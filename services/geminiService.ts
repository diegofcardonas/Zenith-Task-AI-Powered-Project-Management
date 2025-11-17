import { GoogleGenAI, Type, GenerateContentResponse, FunctionDeclaration } from "@google/genai";
import { Priority, Task, User, Status, List, Comment } from "../types";
import { i18n } from '../i18n';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = 'gemini-2.5-flash';

const createTaskDeclaration: FunctionDeclaration = {
    name: 'create_task',
    description: "Creates a new task in the project management system.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "The title of the task." },
            description: { type: Type.STRING, description: "A detailed description of the task." },
            priority: { type: Type.STRING, enum: Object.values(Priority), description: "The priority of the task." },
            assigneeName: { type: Type.STRING, description: "The name of the user to whom the task should be assigned." },
            dueDate: { type: Type.STRING, description: "The due date of the task in YYYY-MM-DD format." },
            projectName: { type: Type.STRING, description: "The name of the project the task belongs to." },
        },
        required: ['title']
    }
};

const updateTaskStatusDeclaration: FunctionDeclaration = {
    name: 'update_task_status',
    description: "Updates the status of an existing task.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            taskTitle: { type: Type.STRING, description: "The title of the task to update." },
            status: { type: Type.STRING, enum: Object.values(Status), description: "The new status of the task." },
        },
        required: ['taskTitle', 'status']
    }
};

const assignTaskDeclaration: FunctionDeclaration = {
    name: 'assign_task',
    description: "Assigns a task to a user.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            taskTitle: { type: Type.STRING, description: "The title of the task to assign." },
            assigneeName: { type: Type.STRING, description: "The name of the user to assign the task to." },
        },
        required: ['taskTitle', 'assigneeName']
    }
};


export const generateSubtasks = async (taskTitle: string, taskDescription: string): Promise<string[]> => {
  try {
    const prompt = `You are a world-class project manager. Based on the task title "${taskTitle}" and description "${taskDescription}", generate a list of 3 to 5 actionable subtasks. Return ONLY the JSON array of strings.`;
    
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

    // Fix: Trim whitespace from the response before parsing to prevent errors.
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
    const prompt = `You are a world-class project manager. Write a concise yet detailed description for a task titled "${taskTitle}". The description should be professional, clear, and outline the main objective and any key considerations. Respond only with the description text in markdown format.`;
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
    const prompt = `You are a world-class project manager. Based on the user's idea: "${promptText}", generate a concise task title and a detailed description. Return ONLY a JSON object with "title" and "description" keys.`;

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

    // Fix: Trim whitespace from the response before parsing to prevent errors.
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
    return i18n.t('gemini.noTasksForSummary');
  }
  
  try {
    const taskSummary = tasks.map(t => `- "${t.title}" (Status: ${t.status}, Priority: ${t.priority}, Due: ${t.dueDate})`).join('\n');
    const prompt = `You are a senior project manager providing an executive summary. The project is named "${projectName}". Here is a list of its tasks:\n${taskSummary}\n\nBased on this data, provide a brief, insightful summary of the project's status. Highlight key achievements (completed tasks), current focus (in-progress tasks), upcoming work (to-do tasks), and any potential risks (e.g., overdue high-priority tasks). Format your response in markdown.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error generating project summary:", error);
    return i18n.t('gemini.summaryError');
  }
};

export const suggestTaskDetails = async (taskTitle: string, users: User[]): Promise<{ priority?: Priority; assigneeId?: string }> => {
    if (!taskTitle) return {};
    try {
        const userList = users.map(u => `id: "${u.id}", name: "${u.name}", title: "${u.title}"`).join('; ');
        const prompt = `Analyze the following task title: "${taskTitle}". Based on the title, suggest a priority level ('High', 'Medium', or 'Low') and a suitable assignee from the following list of users: [${userList}]. Choose the user whose title/role seems most relevant. Return ONLY a JSON object with the optional keys "priority" and "assigneeId". For example: {"priority": "High", "assigneeId": "u2"}. If you are unsure, return an empty object.`;
        
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
        
        // Fix: Trim whitespace from the response before parsing to prevent errors.
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
    return i18n.t('gemini.riskAnalysisNoTasks');
  }
  
  try {
    const taskSummary = tasks.map(t => `- "${t.title}" (Status: ${t.status}, Priority: ${t.priority}, Due: ${t.dueDate})`).join('\n');
    const prompt = `As a senior project manager, perform a risk analysis for the project "${projectName}".
    Here is a list of its tasks:
    ${taskSummary}
    
    Based on this data, identify and describe 2-3 potential risks for the project. Consider overdue tasks, bottlenecks (tasks many others depend on), and the concentration of work on high-priority tasks.
    Format your response in markdown. Respond only with the analysis.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error generating risk analysis:", error);
    return i18n.t('gemini.riskAnalysisError');
  }
};

export const generateSmartReplies = async (comments: Comment[], taskTitle: string, currentUser: User): Promise<string[]> => {
    if (comments.length === 0) return [];
    try {
        const commentHistory = comments.map(c => `${c.user.name}: ${c.text}`).join('\n');
        const prompt = `You are a helpful project assistant. The task is "${taskTitle}". The conversation so far is:\n${commentHistory}\n\nThe current user is ${currentUser.name}. Suggest 3 brief, relevant, and helpful replies that ${currentUser.name} could give. Think about the next logical step in the conversation. Do not suggest replies that have already been said. Return ONLY a JSON array of strings.`;

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
        // Fix: Trim whitespace from the response before parsing to prevent errors.
        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        if (Array.isArray(result) && result.every(item => typeof item === 'string')) {
            return result.slice(0, 3); // Ensure only 3 replies
        }
        return [];
    } catch (error) {
        console.error("Error generating smart replies:", error);
        return [];
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
        
        const systemInstruction = `You are the Zenith Task AI assistant. You are helpful and friendly.
        You have access to current project data and can perform actions.
        Available functions:
        - create_task: Create a new task.
        - update_task_status: Change a task's status (to 'Todo', 'In Progress', or 'Done').
        - assign_task: Assign a task to a user.
        
        If the user asks to perform an action, use the appropriate function tool. Otherwise, answer their question based on the context.
        
        Current project data context:
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
        throw new Error(i18n.t('gemini.connectionError'));
    }
};