import { GoogleGenAI, Type, GenerateContentResponse, FunctionDeclaration } from "@google/genai";
import { Priority, Task, User, Status, List } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = 'gemini-2.5-flash';

const createTaskDeclaration: FunctionDeclaration = {
    name: 'create_task',
    description: "Crea una nueva tarea en el sistema de gestión de proyectos. (Creates a new task in the project management system.)",
    parameters: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "El título de la tarea. (The title of the task.)" },
            description: { type: Type.STRING, description: "Una descripción detallada de la tarea. (A detailed description of the task.)" },
            priority: { type: Type.STRING, enum: Object.values(Priority), description: "La prioridad de la tarea. (The priority of the task.)" },
            assigneeName: { type: Type.STRING, description: "El nombre del usuario al que se debe asignar la tarea. (The name of the user to whom the task should be assigned.)" },
            dueDate: { type: Type.STRING, description: "La fecha de vencimiento de la tarea en formato AAAA-MM-DD. (The due date of the task in YYYY-MM-DD format.)" },
            projectName: { type: Type.STRING, description: "El nombre del proyecto al que pertenece la tarea. (The name of the project the task belongs to.)" },
        },
        required: ['title']
    }
};

const updateTaskStatusDeclaration: FunctionDeclaration = {
    name: 'update_task_status',
    description: "Actualiza el estado de una tarea existente. (Updates the status of an existing task.)",
    parameters: {
        type: Type.OBJECT,
        properties: {
            taskTitle: { type: Type.STRING, description: "El título de la tarea a actualizar. (The title of the task to update.)" },
            status: { type: Type.STRING, enum: Object.values(Status), description: "El nuevo estado de la tarea. (The new status of the task.)" },
        },
        required: ['taskTitle', 'status']
    }
};

const assignTaskDeclaration: FunctionDeclaration = {
    name: 'assign_task',
    description: "Asigna una tarea a un usuario. (Assigns a task to a user.)",
    parameters: {
        type: Type.OBJECT,
        properties: {
            taskTitle: { type: Type.STRING, description: "El título de la tarea a asignar. (The title of the task to assign.)" },
            assigneeName: { type: Type.STRING, description: "El nombre del usuario al que se asignará la tarea. (The name of the user to assign the task to.)" },
        },
        required: ['taskTitle', 'assigneeName']
    }
};


export const generateSubtasks = async (taskTitle: string, taskDescription: string): Promise<string[]> => {
  try {
    const prompt = `Eres un gestor de proyectos de clase mundial. Basado en el título de la tarea "${taskTitle}" y la descripción "${taskDescription}", genera una lista de 3 a 5 subtareas accionables. Devuelve SOLAMENTE el array JSON de strings.`;
    
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    if (Array.isArray(result) && result.every(item => typeof item === 'string')) {
      return result;
    }
    console.error("AI response for subtasks did not match expected schema:", result);
    return [];
  } catch (error) {
    console.error("Error generating subtasks:", error);
    return [];
  }
};

export const generateTaskDescription = async (taskTitle: string): Promise<string> => {
  try {
    const prompt = `Eres un gestor de proyectos de clase mundial. Escribe una descripción concisa pero detallada para una tarea titulada "${taskTitle}". La descripción debe ser profesional, clara y delinear el objetivo principal y cualquier consideración clave. Responde solo con el texto de la descripción en formato markdown.`;
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating task description:", error);
    return "";
  }
};

export const generateTaskTitleAndDescription = async (promptText: string): Promise<{ title: string; description: string; }> => {
  try {
    const prompt = `Eres un gestor de proyectos de clase mundial. Basado en la idea del usuario: "${promptText}", genera un título de tarea conciso y una descripción detallada. Devuelve SOLAMENTE un objeto JSON con las claves "title" y "description".`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ['title', 'description']
        }
      }
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    
    if (result && typeof result.title === 'string' && typeof result.description === 'string') {
      return result;
    } else {
      console.error("AI response did not match expected schema:", result);
      return { title: '', description: '' };
    }
  } catch (error) {
    console.error("Error generating task title and description:", error);
    return { title: '', description: '' };
  }
};

export const generateProjectSummary = async (tasks: Task[], projectName: string): Promise<string> => {
  if (tasks.length === 0) {
    return "Este proyecto aún no tiene tareas. Añade algunas tareas para generar un resumen.";
  }
  
  try {
    const taskSummary = tasks.map(t => `- "${t.title}" (Status: ${t.status}, Priority: ${t.priority}, Due: ${t.dueDate})`).join('\n');
    const prompt = `Eres un gerente de proyectos senior proporcionando un resumen ejecutivo. El proyecto se llama "${projectName}". Aquí hay una lista de sus tareas:\n${taskSummary}\n\nBasado en estos datos, proporciona un resumen breve y perspicaz del estado del proyecto. Destaca los logros clave (tareas completadas), el enfoque actual (tareas en progreso), el trabajo próximo (tareas por hacer) y cualquier riesgo potencial (por ejemplo, tareas de alta prioridad atrasadas). Formatea tu respuesta en markdown.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error generating project summary:", error);
    return "No se pudo generar el resumen debido a un error.";
  }
};

export const suggestTaskDetails = async (taskTitle: string, users: User[]): Promise<{ priority?: Priority; assigneeId?: string }> => {
    if (!taskTitle) return {};
    try {
        const userList = users.map(u => `id: "${u.id}", name: "${u.name}", title: "${u.title}"`).join('; ');
        const prompt = `Analiza el siguiente título de tarea: "${taskTitle}". Basado en el título, sugiere un nivel de prioridad ('High', 'Medium', o 'Low') y un asignado adecuado de la siguiente lista de usuarios: [${userList}]. Elige al usuario cuyo título/rol parezca más relevante. Devuelve SOLAMENTE un objeto JSON con las claves opcionales "priority" y "assigneeId". Por ejemplo: {"priority": "High", "assigneeId": "u2"}. Si no estás seguro, devuelve un objeto vacío.`;
        
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        priority: { type: Type.STRING, enum: Object.values(Priority) },
                        assigneeId: { type: Type.STRING }
                    }
                }
            }
        });
        
        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);

        if (result && (result.priority || result.assigneeId)) {
            if (result.assigneeId && !users.some(u => u.id === result.assigneeId)) {
                delete result.assigneeId;
            }
            return result;
        }
        return {};
    } catch (error) {
        console.error("Error suggesting task details:", error);
        return {};
    }
};

export const generateRiskAnalysis = async (tasks: Task[], projectName: string): Promise<string> => {
  if (tasks.length === 0) {
    return "No hay tareas para analizar.";
  }
  
  try {
    const taskSummary = tasks.map(t => `- "${t.title}" (Status: ${t.status}, Priority: ${t.priority}, Due: ${t.dueDate})`).join('\n');
    const prompt = `Como gerente de proyectos senior, realiza un análisis de riesgos para el proyecto "${projectName}".
    Aquí hay una lista de sus tareas:
    ${taskSummary}
    
    Basado en estos datos, identifica y describe 2-3 riesgos potenciales para el proyecto. Considera tareas atrasadas, cuellos de botella (tareas de las que dependen muchas otras) y la concentración de trabajo en tareas de alta prioridad.
    Formatea tu respuesta en markdown. Responde solo con el análisis.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error generating risk analysis:", error);
    return "No se pudo generar el análisis de riesgos debido a un error.";
  }
};

export const getAIChatResponse = async (
    history: { role: string, parts: { text: string }[] }[],
    message: string,
    tasks: Task[],
    lists: List[],
    users: User[]
): Promise<GenerateContentResponse> => {
    try {
        const tasksContext = tasks.map(t => `Task: "${t.title}", Status: ${t.status}, Assignee: ${users.find(u => u.id === t.assigneeId)?.name || 'Unassigned'}, Project: ${lists.find(l => l.id === t.listId)?.name}`).join('\n');
        
        const systemInstruction = `Eres el asistente de IA de Zenith Task. Eres servicial y amigable.
        Tienes acceso a los datos actuales del proyecto y puedes realizar acciones.
        Funciones disponibles:
        - create_task: Crear una nueva tarea.
        - update_task_status: Cambiar el estado de una tarea (a 'Todo', 'In Progress', o 'Done').
        - assign_task: Asignar una tarea a un usuario.
        
        Si el usuario pide realizar una acción, utiliza la herramienta de función apropiada. De lo contrario, responde su pregunta basándote en el contexto.
        
        Contexto de datos del proyecto actual:
        ${tasksContext}
        `;

        const contents = [
            ...history,
            { role: 'user', parts: [{ text: message }] }
        ];
        
        const response = await ai.models.generateContent({
            model,
            contents,
            config: {
                systemInstruction,
                tools: [{ functionDeclarations: [createTaskDeclaration, updateTaskStatusDeclaration, assignTaskDeclaration] }]
            },
        });
        
        return response;
    } catch (error) {
        console.error("Error getting AI chat response:", error);
        throw new Error("Lo siento, estoy teniendo problemas para conectarme en este momento.");
    }
};