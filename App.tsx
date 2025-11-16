import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { List, Task, Status, Priority, User, ViewType, Role, Workspace, Toast, Notification, TaskTemplate, UserStatus, Activity, Folder } from './types';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import TaskModal from './components/TaskModal';
import AdminDashboard from './components/admin/AdminDashboard';
import UserProfileModal from './components/UserProfileModal';
import AppAdminPanel from './components/admin/AppAdminPanel';
import WorkspaceModal from './components/WorkspaceModal';
import ProjectModal from './components/ProjectModal';
import { themes, ThemeName, ColorScheme } from './themes';
import BlockingTasksModal from './components/BlockingTasksModal';
import UserSelectionPage from './components/UserSelectionPage';
import MyTasksView from './components/MyTasksView';
import CommandPalette from './components/CommandPalette';
import { generateProjectSummary } from './services/geminiService';
import AISummaryModal from './components/AISummaryModal';
import AIChatbot from './components/AIChatbot';
import WelcomePage from './components/WelcomePage';
import SettingsModal from './components/SettingsModal';
import FolderModal from './components/FolderModal';


const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alice', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', role: Role.Admin, title: 'Gerente de Proyecto', email: 'alice@zenith.dev', team: 'Principal', bio: 'Liderando todo lo relacionado con la gestión de proyectos. Entusiasta del café.', status: UserStatus.Online },
  { id: 'u2', name: 'Bob', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026705d', role: Role.Member, title: 'Desarrollador Frontend', email: 'bob@zenith.dev', team: 'Frontend', bio: 'Creando interfaces de usuario hermosas y responsivas.', status: UserStatus.Busy },
  { id: 'u3', name: 'Charlie', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026706d', role: Role.Guest, title: 'Interesado', email: 'charlie@client.com', team: 'Externo', bio: 'Proporcionando retroalimentación y requisitos para el proyecto.', status: UserStatus.Offline },
  { id: 'u4', name: 'Diana', avatar: 'https://i.pravatar.cc/150?u=diana', role: Role.Member, title: 'Especialista en Marketing', email: 'diana@zenith.dev', team: 'Marketing', bio: 'Dando a conocer nuestros increíbles productos.', status: UserStatus.Online },
  { id: 'u5', name: 'Eve', avatar: 'https://i.pravatar.cc/150?u=eve', role: Role.Admin, title: 'Líder de Backend', email: 'eve@zenith.dev', team: 'Backend', bio: 'Construyendo APIs robustas y escalables.', status: UserStatus.Away },
  { id: 'u6', name: 'Frank', avatar: 'https://i.pravatar.cc/150?u=frank', role: Role.Guest, title: 'Tester QA (Contratista)', email: 'frank@qa.test', team: 'Externo', bio: 'Asegurándose de que todo funcione como se espera.', status: UserStatus.Offline },
  { id: 'u7', name: 'Grace', avatar: 'https://i.pravatar.cc/150?u=grace', role: Role.Member, title: 'Diseñadora UI/UX', email: 'grace@zenith.dev', team: 'Diseño', bio: 'Diseñando experiencias de usuario intuitivas y encantadoras.', status: UserStatus.Online },
  { id: 'u8', name: 'Heidi', avatar: 'https://i.pravatar.cc/150?u=heidi', role: Role.Member, title: 'Ingeniera DevOps', email: 'heidi@zenith.dev', team: 'Infraestructura', bio: 'Manteniendo los servidores en funcionamiento y los despliegues fluidos.', status: UserStatus.Busy },
  { id: 'u9', name: 'Ivan', avatar: 'https://i.pravatar.cc/150?u=ivan', role: Role.Guest, title: 'Consultor Externo', email: 'ivan@consulting.com', team: 'Externo', bio: 'Proporcionando asesoramiento experto en estrategia de negocio.', status: UserStatus.Offline },
  { id: 'u10', name: 'Judy', avatar: 'https://i.pravatar.cc/150?u=judy', role: Role.Guest, title: 'Cliente', email: 'judy@client.co', team: 'Externo', bio: 'El contacto principal para el proyecto Campaña de Marketing.', status: UserStatus.Offline },
  { id: 'u11', name: 'Kevin', avatar: 'https://i.pravatar.cc/150?u=kevin', role: Role.Member, title: 'Científico de Datos', email: 'kevin@zenith.dev', team: 'Datos', bio: 'Encontrando ideas en los datos.', status: UserStatus.Online },
  { id: 'u12', name: 'Linda', avatar: 'https://i.pravatar.cc/150?u=linda', role: Role.Member, title: 'Dueña de Producto', email: 'linda@zenith.dev', team: 'Principal', bio: 'Definindo la visión y hoja de ruta del producto.', status: UserStatus.Away },
  { id: 'u13', name: 'Mike', avatar: 'https://i.pravatar.cc/150?u=mike', role: Role.Member, title: 'Desarrollador Full Stack', email: 'mike@zenith.dev', team: 'Principal', bio: 'Construyendo características de principio a fin.', status: UserStatus.Online },
  { id: 'u14', name: 'Nancy', avatar: 'https://i.pravatar.cc/150?u=nancy', role: Role.Member, title: 'Gerente de RRHH', email: 'nancy@zenith.dev', team: 'RRHH', bio: 'Cuidando del equipo.', status: UserStatus.Online },
  { id: 'u15', name: 'Oscar', avatar: 'https://i.pravatar.cc/150?u=oscar', role: Role.Member, title: 'Creador de Contenido', email: 'oscar@zenith.dev', team: 'Marketing', bio: 'Creando contenido atractivo para nuestra audiencia.', status: UserStatus.Away },
  { id: 'u16', name: 'Pam', avatar: 'https://i.pravatar.cc/150?u=pam', role: Role.Guest, title: 'Asesora Legal', email: 'pam@legal.co', team: 'Externo', bio: 'Garantizando el cumplimiento legal.', status: UserStatus.Offline },
  { id: 'u17', name: 'Quentin', avatar: 'https://i.pravatar.cc/150?u=quentin', role: Role.Member, title: 'Desarrollador Móvil', email: 'quentin@zenith.dev', team: 'Móvil', bio: 'Construyendo nuestras aplicaciones de iOS y Android.', status: UserStatus.Busy },
  { id: 'u18', name: 'Rachel', avatar: 'https://i.pravatar.cc/150?u=rachel', role: Role.Member, title: 'Especialista en SEO', email: 'rachel@zenith.dev', team: 'Marketing', bio: 'Impulsando el tráfico orgánico.', status: UserStatus.Online },
  { id: 'u19', name: 'Steve', avatar: 'https://i.pravatar.cc/150?u=steve', role: Role.Admin, title: 'CTO', email: 'steve@zenith.dev', team: 'Principal', bio: 'Liderando la estrategia tecnológica.', status: UserStatus.Online },
  { id: 'u20', name: 'Tina', avatar: 'https://i.pravatar.cc/150?u=tina', role: Role.Member, title: 'Soporte al Cliente', email: 'tina@zenith.dev', team: 'Soporte', bio: 'Ayudando a nuestros clientes a tener éxito.', status: UserStatus.Away },
  { id: 'u21', name: 'Uma', avatar: 'https://i.pravatar.cc/150?u=uma', role: Role.Member, title: 'Ingeniera de QA', email: 'uma@zenith.dev', team: 'QA', bio: 'Encontrando errores antes de que ellos te encuentren a ti.', status: UserStatus.Busy },
  { id: 'u22', name: 'Victor', avatar: 'https://i.pravatar.cc/150?u=victor', role: Role.Guest, title: 'Inversionista', email: 'victor@vcfund.com', team: 'Externo', bio: 'Vigilando el progreso.', status: UserStatus.Offline },
  { id: 'u23', name: 'Wendy', avatar: 'https://i.pravatar.cc/150?u=wendy', role: Role.Member, title: 'Scrum Master', email: 'wendy@zenith.dev', team: 'Principal', bio: 'Facilitando los procesos ágiles.', status: UserStatus.Online },
  { id: 'u24', name: 'Xavier', avatar: 'https://i.pravatar.cc/150?u=xavier', role: Role.Member, title: 'Analista de Seguridad', email: 'xavier@zenith.dev', team: 'Infraestructura', bio: 'Manteniendo nuestros sistemas seguros.', status: UserStatus.Busy },
  { id: 'u25', name: 'Yvonne', avatar: 'https://i.pravatar.cc/150?u=yvonne', role: Role.Member, title: 'Escritora Técnica', email: 'yvonne@zenith.dev', team: 'Documentación', bio: 'Haciendo que nuestra documentación sea excelente.', status: UserStatus.Away },
];

const MOCK_WORKSPACES: Workspace[] = [
    { id: 'w1', name: 'Desarrollo de Producto' },
    { id: 'w2', name: 'Equipo de Marketing' },
    { id: 'w3', name: 'Recursos Humanos' },
    { id: 'w4', name: 'Operaciones' },
    { id: 'w5', name: 'Diseño & UX' },
];

const MOCK_FOLDERS: Folder[] = [
    { id: 'f1', name: 'Alianzas Estratégicas', workspaceId: 'w1', order: 0 },
    { id: 'f2', name: 'Iniciativas de Crecimiento', workspaceId: 'w2', order: 1 },
];

const MOCK_LISTS: List[] = [
  { id: 'l1', name: 'Rediseño Frontend', color: 'bg-blue-500', workspaceId: 'w1', order: 0 },
  { id: 'l2', name: 'Desarrollo API', color: 'bg-purple-500', workspaceId: 'w1', order: 1 },
  { id: 'l3', name: 'Campaña de Marketing', color: 'bg-green-500', workspaceId: 'w2', order: 2 },
  { id: 'l4', name: 'Estrategia Q4', color: 'bg-yellow-500', workspaceId: 'w2', folderId: 'f2', order: 3 },
  { id: 'l101', name: 'Aplicación Móvil', color: 'bg-sky-500', workspaceId: 'w1', order: 4 },
  { id: 'l102', name: 'Infraestructura y DevOps', color: 'bg-slate-500', workspaceId: 'w1', order: 5 },
  { id: 'l201', name: 'Contenido del Blog', color: 'bg-emerald-500', workspaceId: 'w2', folderId: 'f2', order: 6 },
  { id: 'l202', name: 'Redes Sociales', color: 'bg-pink-500', workspaceId: 'w2', order: 7 },
  { id: 'l301', name: 'Contratación Q3', color: 'bg-rose-500', workspaceId: 'w3', order: 8 },
  { id: 'l302', name: 'Revisión de Desempeño', color: 'bg-amber-500', workspaceId: 'w3', order: 9 },
  { id: 'l401', name: 'Optimización de Infraestructura', color: 'bg-orange-500', workspaceId: 'w4', order: 10 },
  { id: 'l402', name: 'Logística de Suministros', color: 'bg-lime-500', workspaceId: 'w4', order: 11 },
  { id: 'l501', name: 'Investigación de Usuario', color: 'bg-violet-500', workspaceId: 'w5', order: 12 },
  { id: 'l502', name: 'Sistema de Diseño', color: 'bg-fuchsia-500', workspaceId: 'w5', order: 13 },
  { id: 'l-claro-dico', name: 'Proyecto DICO', color: 'bg-red-500', workspaceId: 'w1', folderId: 'f1', order: 14 },
  { id: 'l-claro-sicte', name: 'Proyecto SICTE', color: 'bg-indigo-500', workspaceId: 'w1', folderId: 'f1', order: 15 },
];

const generateMoreTasks = (count: number, existingTasks: Task[]): Task[] => {
    const newTasks: Task[] = [];
    const statuses = Object.values(Status);
    const priorities = Object.values(Priority);
    const userIds = MOCK_USERS.map(u => u.id);
    const listIds = MOCK_LISTS.map(l => l.id);
    const today = new Date();

    const taskTemplates = [
        { title: 'Implementar {feature}', description: 'Desarrollar y probar la nueva función de {feature}.' },
        { title: 'Corregir bug en {module}', description: 'Investigar y solucionar el bug reportado en el módulo {module}.' },
        { title: 'Refactorizar servicio de {service}', description: 'Mejorar el código y rendimiento del servicio de {service}.' },
        { title: 'Escribir pruebas para {component}', description: 'Asegurar la cobertura de pruebas para el componente {component}.' },
        { title: 'Desplegar a {environment}', description: 'Preparar y ejecutar el despliegue de la vX.Y.Z a {environment}.' },
        { title: 'Crear campaña de email para {product}', description: 'Diseñar y redactar los correos para la campaña de {product}.' },
        { title: 'Analizar métricas de {source}', description: 'Recopilar y analizar los datos de rendimiento de {source}.' },
        { title: 'Escribir artículo de blog sobre {topic}', description: 'Investigar y redactar un artículo SEO-optimizado sobre {topic}.' },
        { title: 'Organizar webinar de {feature}', description: 'Planificar y promocionar un webinar para mostrar la nueva {feature}.' },
        { title: 'Diseñar wireframes para {screen}', description: 'Crear los wireframes de bajo nivel para la pantalla de {screen}.' },
        { title: 'Crear prototipo de {flow}', description: 'Usar Figma para crear un prototipo interactivo del flujo de {flow}.' },
        { title: 'Realizar pruebas de usabilidad', description: 'Reclutar participantes y llevar a cabo sesiones de pruebas de usabilidad.' },
        { title: 'Revisar CVs para {role}', description: 'Filtrar y seleccionar los mejores candidatos para el puesto de {role}.' },
        { title: 'Organizar evento de equipo', description: 'Planificar una actividad de team building para el equipo.' },
        { title: 'Auditar inventario del almacén', description: 'Realizar un conteo físico y comparar con los registros del sistema.' },
    ];
    
    const placeholders: { [key: string]: string[] } = {
        feature: ['autenticación', 'perfiles de usuario', 'notificaciones', 'búsqueda avanzada'],
        module: ['login', 'checkout', 'dashboard', 'API gateway'],
        service: ['usuarios', 'productos', 'pagos'],
        component: ['botón', 'modal', 'tabla de datos'],
        environment: ['staging', 'producción'],
        product: ['lanzamiento de verano', 'oferta de Black Friday'],
        source: ['redes sociales', 'Google Analytics'],
        topic: ['tendencias de IA', 'mejores prácticas de CSS'],
        screen: ['ajustes', 'perfil', 'carrito de compras'],
        flow: ['registro', 'recuperación de contraseña'],
        role: ['Ingeniero Frontend', 'Diseñador de Producto'],
    };

    const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    const generateDate = (base: Date, offsetDays: number): string => {
        const date = new Date(base);
        date.setDate(date.getDate() + offsetDays);
        return date.toISOString().split('T')[0];
    };

    for (let i = 0; i < count; i++) {
        const template = getRandomElement(taskTemplates);
        let title = template.title;
        let description = template.description;
        const matches = [...template.title.matchAll(/{(\w+)}/g)];
        
        matches.forEach(match => {
            const key = match[1];
            if (placeholders[key]) {
                const replacement = getRandomElement(placeholders[key]);
                title = title.replace(match[0], replacement);
                description = description.replace(match[0], replacement);
            }
        });

        const createdAt = generateDate(today, -Math.floor(Math.random() * 90));
        const dueDate = generateDate(new Date(createdAt), Math.floor(Math.random() * 60) + 7);
        const status = getRandomElement(statuses);

        newTasks.push({
            id: `t-gen-${i + 1}`,
            title,
            description,
            status,
            priority: getRandomElement(priorities),
            assigneeId: Math.random() > 0.1 ? getRandomElement(userIds) : null,
            dueDate,
            listId: getRandomElement(listIds),
            subtasks: [],
            comments: [],
            attachments: [],
            reminder: null,
            createdAt,
            dependsOn: [],
            activityLog: [],
        });
    }

    return newTasks;
};


const INITIAL_TASKS: Task[] = [
  { id: 't1', title: 'Diseñar mockups de la nueva página de inicio', description: 'Crear mockups de alta fidelidad en Figma.', status: Status.InProgress, priority: Priority.High, assigneeId: 'u1', dueDate: '2024-08-15', listId: 'l1', subtasks: [{id: 'st1', text: 'Diseño de wireframe', completed: true}], comments: [ { id: 'c1', user: MOCK_USERS[2], text: '¿Cuáles son las guías de marca para el nuevo diseño?', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() }, { id: 'c2', user: MOCK_USERS[0], text: '¡Buena pregunta! Los acabo de adjuntar a la tarea principal.', timestamp: new Date(Date.now() - 86400000).toISOString() }, { id: 'c3', user: MOCK_USERS[2], text: '¡Genial, gracias!', parentId: 'c2', timestamp: new Date(Date.now() - 86400000 + 3600000).toISOString()}], attachments: [], reminder: null, createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), dependsOn: [], activityLog: [] },
  { id: 't2', title: 'Implementar barra de navegación responsive', description: 'Codificar la barra de navegación usando Tailwind CSS.', status: Status.Todo, priority: Priority.Medium, assigneeId: 'u2', dueDate: '2024-08-20', listId: 'l1', subtasks: [], comments: [], attachments: [], reminder: null, createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), dependsOn: ['t1'], activityLog: [] },
  { id: 't3', title: 'Configurar endpoint de autenticación de usuario', description: 'Usar JWT para la autenticación.', status: Status.Done, priority: Priority.High, assigneeId: 'u3', dueDate: '2024-08-10', listId: 'l2', subtasks: [], comments: [], attachments: [], reminder: null, createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), dependsOn: [], activityLog: [] },
  { id: 't4', title: 'Desarrollar esquema de base de datos para productos', description: 'Diseñar tablas para productos, categorías, etc.', status: Status.InProgress, priority: Priority.High, assigneeId: 'u3', dueDate: '2024-08-25', listId: 'l2', subtasks: [], comments: [], attachments: [], reminder: null, createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), dependsOn: [], activityLog: [] },
  { id: 't5', title: 'Redactar borrador de la publicación del blog para el lanzamiento', description: 'Escribir una publicación convincente sobre las nuevas características.', status: Status.Todo, priority: Priority.Low, assigneeId: 'u1', dueDate: '2024-09-01', listId: 'l3', subtasks: [], comments: [], attachments: [], reminder: null, createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), dependsOn: [], activityLog: [] },
  { id: 't6', title: 'Crear gráficos para redes sociales', description: 'Diseñar gráficos atractivos para Instagram y Twitter.', status: Status.Todo, priority: Priority.Medium, assigneeId: 'u4', dueDate: '2024-08-28', listId: 'l3', subtasks: [], comments: [], attachments: [], reminder: '1 día antes', createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), dependsOn: ['t5'], activityLog: [] },
  { id: 't7', title: 'Corregir bug de CSS en la página de inicio de sesión', description: 'El campo de contraseña está desalineado en móviles.', status: Status.InProgress, priority: Priority.High, assigneeId: 'u2', dueDate: '2024-08-12', listId: 'l1', subtasks: [], comments: [], attachments: [], reminder: 'En la fecha de vencimiento', createdAt: new Date(Date.now() - 86400000 * 6).toISOString(), dependsOn: [], activityLog: [] },
  { id: 't8', title: 'Desplegar servidor de staging', description: 'Configurar el entorno de staging en AWS.', status: Status.Done, priority: Priority.High, assigneeId: 'u5', dueDate: '2024-08-05', listId: 'l2', subtasks: [], comments: [], attachments: [], reminder: null, createdAt: new Date(Date.now() - 86400000 * 12).toISOString(), dependsOn: [], activityLog: [] },
  { id: 't9', title: 'Escribir documentación de la API', description: 'Usar Swagger para documentar todos los endpoints.', status: Status.Todo, priority: Priority.Medium, assigneeId: 'u5', dueDate: '2024-09-10', listId: 'l2', subtasks: [], comments: [], attachments: [], reminder: '1 semana antes', createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), dependsOn: ['t3'], activityLog: [] },
  { id: 't10', title: 'Pruebas de aceptación de usuario', description: 'Realizar UAT con los principales interesados.', status: Status.Todo, priority: Priority.High, assigneeId: 'u1', dueDate: '2024-08-22', listId: 'l1', subtasks: [], comments: [], attachments: [], reminder: '2 días antes', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), dependsOn: [], activityLog: [] },
  { id: 't11', title: 'Analizar estrategia SEO de la competencia', description: 'Identificar palabras clave y oportunidades de backlinks.', status: Status.InProgress, priority: Priority.Low, assigneeId: 'u4', dueDate: '2024-09-05', listId: 'l3', subtasks: [], comments: [], attachments: [], reminder: null, createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), dependsOn: [], activityLog: [] },
  { id: 't12', title: 'Refactorizar módulo de servicio de usuario', description: 'Mejorar el rendimiento y añadir caché.', status: Status.Todo, priority: Priority.Medium, assigneeId: 'u7', dueDate: '2024-08-30', listId: 'l2', subtasks: [], comments: [], attachments: [], reminder: '1 semana antes', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), dependsOn: [], activityLog: [] },
  { id: 't13', title: 'Configurar prueba A/B para la página de precios', description: 'Probar dos estructuras de precios diferentes.', status: Status.Done, priority: Priority.Medium, assigneeId: 'u8', dueDate: '2024-08-08', listId: 'l3', subtasks: [], comments: [], attachments: [], reminder: null, createdAt: new Date(Date.now() - 86400000 * 9).toISOString(), dependsOn: [], activityLog: [] },
  { id: 't14', title: 'Optimizar tiempo de compilación de webpack', description: 'Reducir el tiempo que toma compilar los assets del frontend.', status: Status.Todo, priority: Priority.Low, assigneeId: 'u2', dueDate: '2024-09-15', listId: 'l1', subtasks: [], comments: [], attachments: [], reminder: null, createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), dependsOn: [], activityLog: [] },
  { id: 't15', title: 'Crear encuesta de feedback de clientes', description: 'Recopilar feedback sobre las nuevas características.', status: Status.Done, priority: Priority.Low, assigneeId: 'u10', dueDate: '2024-08-18', listId: 'l3', subtasks: [], comments: [], attachments: [], reminder: null, createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), dependsOn: [], activityLog: [] },
  { id: 't16', title: 'Planificar OKRs del Q4', description: 'Definir objetivos y resultados clave para el próximo trimestre.', status: Status.Todo, priority: Priority.High, assigneeId: 'u1', dueDate: '2024-09-20', listId: 'l4', subtasks: [], comments: [], attachments: [], reminder: '1 semana antes', createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), dependsOn: [], activityLog: [] },
  { id: 't17', title: 'Investigar nuevos canales de publicidad', description: 'Explorar anuncios en TikTok y LinkedIn.', status: Status.InProgress, priority: Priority.Medium, assigneeId: 'u4', dueDate: '2024-09-25', listId: 'l4', subtasks: [], comments: [], attachments: [], reminder: null, createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), dependsOn: [], activityLog: [] },
];

const MOCK_TASKS = [...INITIAL_TASKS, ...generateMoreTasks(184, INITIAL_TASKS)];

const ToastComponent: React.FC<{ toast: Toast, onClose: () => void }> = ({ toast, onClose }) => {
    const { message, type } = toast;
    const baseClasses = "flex items-center w-full max-w-xs p-4 space-x-4 text-gray-500 bg-white divide-x divide-gray-200 rounded-lg shadow-lg dark:text-gray-400 dark:divide-gray-700 space-x dark:bg-surface border dark:border-border";
    const typeClasses = {
        success: 'text-green-500 dark:text-green-400',
        error: 'text-red-500 dark:text-red-400',
        info: 'text-blue-500 dark:text-blue-400',
    };
    const Icon = () => {
        if (type === 'success') return <svg className={`w-5 h-5 ${typeClasses.success}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/></svg>;
        if (type === 'error') return <svg className={`w-5 h-5 ${typeClasses.error}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z"/></svg>;
        return <svg className={`w-5 h-5 ${typeClasses.info}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/></svg>;
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div role="alert" className={`${baseClasses} animate-fadeIn`}>
            <div className={`p-2 rounded-full ${typeClasses[type]} bg-opacity-10`}>
                <Icon />
            </div>
            <div className="pl-4 text-sm font-normal text-text-primary">{message}</div>
            <button 
                type="button" 
                className="-mx-1.5 -my-1.5 ml-auto inline-flex h-8 w-8 rounded-lg bg-white p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 focus:ring-2 focus:ring-gray-300 dark:bg-surface dark:text-gray-500 dark:hover:bg-secondary-focus dark:hover:text-white" 
                onClick={onClose} 
                aria-label="Cerrar"
            >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
        </div>
    );
};

const App: React.FC = () => {
  
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const savedTasks = localStorage.getItem('tasks');
      return savedTasks ? JSON.parse(savedTasks) as Task[] : MOCK_TASKS;
    } catch (error) {
      console.error('Error parsing tasks from localStorage:', error);
      return MOCK_TASKS;
    }
  });
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const savedUsers = localStorage.getItem('users');
      return savedUsers ? JSON.parse(savedUsers) as User[] : MOCK_USERS;
    } catch (error) {
      console.error('Error parsing users from localStorage:', error);
      return MOCK_USERS;
    }
  });
  const [lists, setLists] = useState<List[]>(() => {
    try {
      const savedLists = localStorage.getItem('lists');
      return savedLists ? JSON.parse(savedLists) as List[] : MOCK_LISTS;
    } catch (error) {
      console.error('Error parsing lists from localStorage:', error);
      return MOCK_LISTS;
    }
  });
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    try {
      const savedWorkspaces = localStorage.getItem('workspaces');
      return savedWorkspaces ? JSON.parse(savedWorkspaces) as Workspace[] : MOCK_WORKSPACES;
    } catch (error) {
      console.error('Error parsing workspaces from localStorage:', error);
      return MOCK_WORKSPACES;
    }
  });
   const [folders, setFolders] = useState<Folder[]>(() => {
    try {
      const saved = localStorage.getItem('folders');
      return saved ? JSON.parse(saved) as Folder[] : MOCK_FOLDERS;
    } catch (error) {
      console.error('Error parsing folders from localStorage:', error);
      return MOCK_FOLDERS;
    }
  });
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.Board);
  
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>(workspaces[0]?.id || 'w1');
  const [activeView, setActiveView] = useState<'list' | 'dashboard' | 'app_admin' | 'my_tasks'>('list');

  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [workspaceToEdit, setWorkspaceToEdit] = useState<Workspace | null>(null);

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderToEdit, setFolderToEdit] = useState<Folder | null>(null);
  
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [listToEdit, setListToEdit] = useState<List | null>(null);

  const [theme, setTheme] = useState<ThemeName>(() => (localStorage.getItem('theme') as ThemeName) || 'default');
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => (localStorage.getItem('colorScheme') as ColorScheme) || 'dark');
  
  const [isBlockingTasksModalOpen, setBlockingTasksModalOpen] = useState(false);
  const [taskForBlockingModal, setTaskForBlockingModal] = useState<Task | null>(null);

  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [summaryData, setSummaryData] = useState<{title: string, content: string}>({title: '', content: ''});
  const [isSummaryLoading, setSummaryLoading] = useState(false);
  const [isSummaryModalOpen, setSummaryModalOpen] = useState(false);

  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('taskTemplates');
      return saved ? JSON.parse(saved) as TaskTemplate[] : [];
    } catch (error) {
      console.error('Error parsing task templates from localStorage:', error);
      return [];
    }
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const saved = localStorage.getItem('notifications');
      return saved ? JSON.parse(saved) as Notification[] : [];
    } catch (error) {
      console.error('Error parsing notifications from localStorage:', error);
      return [];
    }
  });
  
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { localStorage.setItem('tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('lists', JSON.stringify(lists)); }, [lists]);
  useEffect(() => { localStorage.setItem('workspaces', JSON.stringify(workspaces)); }, [workspaces]);
  useEffect(() => { localStorage.setItem('folders', JSON.stringify(folders)); }, [folders]);
  useEffect(() => { localStorage.setItem('theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('colorScheme', colorScheme); }, [colorScheme]);
  useEffect(() => { localStorage.setItem('taskTemplates', JSON.stringify(taskTemplates)); }, [taskTemplates]);
  useEffect(() => { localStorage.setItem('notifications', JSON.stringify(notifications)); }, [notifications]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const newToast: Toast = { id: Date.now(), message, type };
    setToasts(prev => [...prev, newToast]);
  }, []);
  
  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: `notif-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const logActivity = useCallback((taskId: string, text: string, user: User) => {
      setTasks(prevTasks => prevTasks.map(task => {
          if (task.id === taskId) {
              const newActivity: Activity = {
                  id: `act-${Date.now()}-${Math.random()}`,
                  user,
                  text,
                  timestamp: new Date().toISOString(),
              };
              return { ...task, activityLog: [newActivity, ...(task.activityLog || [])] };
          }
          return task;
      }));
  }, []);
  
  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prevTasks => prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task));
    setSelectedTaskId(null);
  };

  const handleAddTask = (listId: string, template?: TaskTemplate) => {
    const defaultData = {
      title: 'Nueva Tarea en Blanco',
      description: '',
      status: Status.Todo,
      priority: Priority.Medium,
      assigneeId: null,
      subtasks: [],
      comments: [],
      attachments: [],
      reminder: null,
      dependsOn: [],
      activityLog: [],
    };
    
    const newTaskData = {
      ...defaultData,
      ...(template ? template.taskData : {}),
    }

    const newTask: Task = {
      id: `t-${Date.now()}`,
      ...newTaskData,
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      listId,
      activityLog: [],
    };

    setTasks(prevTasks => [...prevTasks, newTask]);
    setSelectedTaskId(newTask.id);
    if(currentUser) {
        logActivity(newTask.id, "created the task", currentUser);
    }
  };

  const handleAddTaskOnDate = (date: Date) => {
    if (!selectedListId) {
      addToast("Por favor, selecciona un proyecto primero para añadir una tarea", "error");
      return;
    }
    const newTask: Task = {
      id: `t-${Date.now()}`,
      title: 'New Calendar Task',
      description: '',
      status: Status.Todo,
      priority: Priority.Medium,
      assigneeId: null,
      dueDate: date.toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      listId: selectedListId,
      subtasks: [],
      comments: [],
      attachments: [],
      reminder: null,
      dependsOn: [],
      activityLog: [],
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
    setSelectedTaskId(newTask.id);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prevTasks => {
        const newTasks = prevTasks.filter(task => task.id !== taskId);
        return newTasks.map(task => ({
            ...task,
            dependsOn: (task.dependsOn || []).filter(depId => depId !== taskId)
        }));
    });
    setSelectedTaskId(null);
    addToast("Tarea eliminada correctamente", "success");
  };

  const handleUpdateUserRole = (userId: string, role: Role) => {
    setUsers(prevUsers => prevUsers.map(user => user.id === userId ? { ...user, role } : user));
  };
  
  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser && currentUser.id === updatedUser.id) {
        setCurrentUser(updatedUser);
    }
    setEditingUserId(null);
    addToast("Perfil de usuario actualizado.", "success");
  };

  const handleCreateUser = (name: string, role: Role) => {
    const newUser: User = {
      id: `u-${Date.now()}`,
      name,
      role,
      avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
      title: 'New Member',
      email: `${name.toLowerCase().replace(' ', '.')}@zenith.dev`,
      team: 'Unassigned',
      bio: '',
      status: UserStatus.Online,
    };
    setUsers(prev => [...prev, newUser]);
    addToast(`Usuario "${name}" creado.`, "success");
  };
  
  const handleDeleteUser = (userId: string) => {
      setUsers(prev => prev.filter(u => u.id !== userId));
      setTasks(prev => prev.map(t => t.assigneeId === userId ? {...t, assigneeId: null} : t));
      addToast("Usuario eliminado.", "success");
  };
  
  const handleUpdateUserStatus = useCallback((userId: string, status: UserStatus) => {
    setUsers(prevUsers =>
        prevUsers.map(user => {
            if (user.id === userId) {
                const updatedUser = { ...user, status };
                if (currentUser?.id === userId) {
                    setCurrentUser(updatedUser);
                }
                return updatedUser;
            }
            return user;
        })
    );
  }, [currentUser?.id]);

  const handleSelectWorkspace = (id: string) => {
    setSelectedWorkspaceId(id);
    const firstListInNewWorkspace = lists.find(l => l.workspaceId === id);
    if (firstListInNewWorkspace) {
      setSelectedListId(firstListInNewWorkspace.id);
      setActiveView('list');
    } else {
      setSelectedListId(null);
    }
  };
  
  const handleSelectView = (view: 'list' | 'dashboard' | 'app_admin' | 'my_tasks') => {
    setActiveView(view);
    if(view !== 'list') {
        setSelectedListId(null);
    } else {
        const listsInWorkspace = lists.filter(l => l.workspaceId === selectedWorkspaceId);
        setSelectedListId(listsInWorkspace[0]?.id || null);
    }
    setIsSidebarOpen(false);
  };
  
  const handleSaveWorkspace = (name: string) => {
    if (workspaceToEdit) {
        setWorkspaces(prev => prev.map(w => w.id === workspaceToEdit.id ? {...w, name} : w));
        addToast("Espacio de trabajo actualizado.", "success");
    } else {
        const newWorkspace: Workspace = { id: `w-${Date.now()}`, name };
        setWorkspaces(prev => [...prev, newWorkspace]);
        setSelectedWorkspaceId(newWorkspace.id);
        setSelectedListId(null);
        addToast("Espacio de trabajo creado.", "success");
    }
  };
  
  const handleDeleteWorkspace = (id: string) => {
    const listsToDelete = lists.filter(l => l.workspaceId === id).map(l => l.id);
    const tasksToDelete = tasks.filter(t => listsToDelete.includes(t.listId)).map(t => t.id);
    
    setTasks(prev => prev.filter(t => !tasksToDelete.includes(t.id)));
    setLists(prev => prev.filter(l => !listsToDelete.includes(l.id)));
    setWorkspaces(prev => prev.filter(w => w.id !== id));
    
    if (selectedWorkspaceId === id) {
        const firstWorkspace = workspaces[0];
        if (firstWorkspace) {
            setSelectedWorkspaceId(firstWorkspace.id);
            setSelectedListId(lists.find(l => l.workspaceId === firstWorkspace.id)?.id || null);
        }
    }
    addToast("Espacio de trabajo eliminado.", "success");
  };

  const handleSaveList = (name: string, color: string, folderId: string | null) => {
    if(listToEdit) {
      setLists(prev => prev.map(l => l.id === listToEdit.id ? {...l, name, color, folderId} : l));
      addToast("Proyecto actualizado.", "success");
    } else {
      const newList: List = {
        id: `l-${Date.now()}`,
        name,
        color,
        workspaceId: selectedWorkspaceId,
        folderId,
        order: lists.length,
      };
      setLists(prev => [...prev, newList]);
      setSelectedListId(newList.id);
      setActiveView('list');
      addToast("Proyecto creado.", "success");
    }
    setIsProjectModalOpen(false);
    setListToEdit(null);
  };
  
  const handleDeleteList = (listId: string) => {
    if (window.confirm('Estás seguro de que quieres eliminar este proyecto? Todas las tareas dentro de él también serán eliminadas.')) {
        setTasks(prev => prev.filter(t => t.listId !== listId));
        setLists(prev => prev.filter(l => l.id !== listId));
        setSelectedListId(null);
        addToast("Proyecto eliminado.", "success");
    }
  };

  const handleSaveFolderPath = (name: string) => {
      if (folderToEdit) {
          setFolders(prev => prev.map(f => f.id === folderToEdit.id ? { ...f, name } : f));
          addToast("Carpeta actualizada.", "success");
      } else {
          const newFolder: Folder = {
              id: `f-${Date.now()}`,
              name,
              workspaceId: selectedWorkspaceId,
              order: folders.length,
          };
          setFolders(prev => [...prev, newFolder]);
          addToast("Carpeta creada.", "success");
      }
      setIsFolderModalOpen(false);
      setFolderToEdit(null);
  };

  const handleDeleteFolder = (folderId: string) => {
      if (window.confirm('¿Estás seguro de que quieres eliminar esta carpeta? Los proyectos dentro de ella no serán eliminados, pero ya no estarán agrupados.')) {
          setLists(prev => prev.map(l => l.folderId === folderId ? { ...l, folderId: null } : l));
          setFolders(prev => prev.filter(f => f.id !== folderId));
          addToast("Carpeta eliminada.", "success");
      }
  };


  const handleTasksReorder = (reorderedTasksForList: Task[]) => {
      const reorderedIds = new Set(reorderedTasksForList.map(t => t.id));
      const otherTasks = tasks.filter(t => !reorderedIds.has(t.id));
      setTasks([...otherTasks, ...reorderedTasksForList]);
      addToast("Orden de tareas actualizado.", "success");
  };

  const handleSidebarReorder = (newFolders: Folder[], newLists: List[]) => {
    setFolders(newFolders);
    setLists(newLists);
    addToast("Barra lateral reordenada.", "success");
  };

  const handleBulkUpdateTasks = (taskIds: string[], updates: Partial<Task>) => {
      let logged = false;
      setTasks(prevTasks => prevTasks.map(task => {
          if (taskIds.includes(task.id)) {
              return { ...task, ...updates };
          }
          return task;
      }));

      if(currentUser && updates.status) {
        const logMessage = `changed status to "${updates.status}"`;
        taskIds.forEach(id => logActivity(id, logMessage, currentUser));
      }
      if(currentUser && updates.priority) {
        const logMessage = `changed priority to "${updates.priority}"`;
        taskIds.forEach(id => logActivity(id, logMessage, currentUser));
      }
       if(currentUser && 'assigneeId' in updates) {
        const assignee = users.find(u => u.id === updates.assigneeId);
        const logMessage = `assigned task to "${assignee?.name || 'unassigned'}"`;
        taskIds.forEach(id => logActivity(id, logMessage, currentUser));
      }

      addToast(`${taskIds.length} tareas actualizadas.`, "success");
  };

  useEffect(() => {
    // Fix: Changed event type from `any` to `Event` for better type safety.
    // The `instanceof CustomEvent` check correctly narrows the type, allowing safe access to `event.detail`.
    const handleAIAction = (event: Event) => {
        if (!currentUser) return;
        
        if (!(event instanceof CustomEvent)) {
          return;
        }

        const detail = event.detail;
        if (typeof detail !== 'object' || detail === null || !('action' in detail) || !('args' in detail)) {
          return;
        }

        const { action, args } = detail as { action: string; args: any };

        switch(action) {
            case 'create_task': {
                let listToAddTo = selectedListId;
                if (args.projectName && typeof args.projectName === 'string') {
                    const foundList = lists.find(l => l.name.toLowerCase() === args.projectName.toLowerCase());
                    if (foundList) listToAddTo = foundList.id;
                    else addToast(`Proyecto "${args.projectName}" no encontrado. Creando tarea en el proyecto actual.`, 'error');
                }
                if (!listToAddTo) {
                    addToast('Por favor, selecciona un proyecto primero para añadir una tarea', 'error');
                    return;
                }
                
                let assigneeId: string | null = null;
                const assigneeName = args.assigneeName;
                if (assigneeName && typeof assigneeName === 'string') {
                    const foundUser = users.find(u => u.name.toLowerCase() === assigneeName.toLowerCase());
                    if(foundUser) assigneeId = foundUser.id;
                    else addToast(`Usuario "${assigneeName}" no encontrado.`, 'info');
                }
                
                const taskData: Partial<Task> = {
                    title: args.title,
                    description: args.description || '',
                    priority: args.priority || Priority.Medium,
                    assigneeId: assigneeId,
                    dueDate: args.dueDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
                };

                handleAddTask(listToAddTo, { id: '', name: 'AI Template', taskData });
                addToast(`Tarea "${args.title}" creada por IA.`, 'success');
                break;
            }
            case 'update_task_status': {
                const taskTitle = args.taskTitle;
                const statusArg = args.status;

                if (taskTitle && typeof taskTitle === 'string' && typeof statusArg === 'string') {
                    const status = statusArg as Status;
                    if (Object.values(Status).includes(status)) {
                        const taskToUpdate = tasks.find(t => t.title.toLowerCase() === taskTitle.toLowerCase());
                        if (taskToUpdate) {
                            setTasks(prev => prev.map(t => t.id === taskToUpdate.id ? { ...t, status: status } : t));
                            addToast(`Estado de "${taskToUpdate.title}" actualizado a ${status}.`, 'success');
                            logActivity(taskToUpdate.id, `changed status to "${status}"`, currentUser);
                        } else {
                            addToast(`Tarea "${taskTitle}" no encontrada.`, 'error');
                        }
                    }
                }
                break;
            }
            case 'assign_task': {
                 const taskTitle = args.taskTitle;
                 const assigneeName = args.assigneeName;

                 if (taskTitle && typeof taskTitle === 'string' && assigneeName && typeof assigneeName === 'string') {
                    const taskToUpdate = tasks.find(t => t.title.toLowerCase() === taskTitle.toLowerCase());
                    const userToAssign = users.find(u => u.name.toLowerCase() === assigneeName.toLowerCase());

                    if (taskToUpdate && userToAssign) {
                        setTasks(prev => prev.map(t => t.id === taskToUpdate.id ? { ...t, assigneeId: userToAssign.id } : t));
                        addToast(`Tarea "${taskToUpdate.title}" asignada a ${userToAssign.name}.`, 'success');
                        logActivity(taskToUpdate.id, `assigned task to "${userToAssign.name}"`, currentUser);
                    } else if (!taskToUpdate) {
                        addToast(`Tarea "${taskTitle}" no encontrada.`, 'error');
                    } else {
                        addToast(`Usuario "${assigneeName}" no encontrado.`, 'error');
                    }
                 }
                break;
            }
        }
    };
    window.addEventListener('execute-ai-action', handleAIAction);
    return () => window.removeEventListener('execute-ai-action', handleAIAction);
  }, [selectedListId, lists, users, addToast, tasks, currentUser, logActivity]);

  const selectedTask = useMemo(() => tasks.find(t => t.id === selectedTaskId), [tasks, selectedTaskId]);
  const editingUser = useMemo(() => users.find(u => u.id === editingUserId), [users, editingUserId]);

  const listsInCurrentWorkspace = useMemo(() => lists.filter(l => l.workspaceId === selectedWorkspaceId), [lists, selectedWorkspaceId]);
  const foldersInCurrentWorkspace = useMemo(() => folders.filter(f => f.workspaceId === selectedWorkspaceId), [folders, selectedWorkspaceId]);
  const selectedList = useMemo(() => listsInCurrentWorkspace.find(l => l.id === selectedListId), [listsInCurrentWorkspace, selectedListId]);
  
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');

  const filteredTasks = useMemo(() => {
    return (selectedList?.id ? tasks.filter(t => t.listId === selectedList.id) : [])
      .filter(t => statusFilter === 'all' || t.status === statusFilter)
      .filter(t => priorityFilter === 'all' || t.priority === priorityFilter);
  }, [tasks, selectedList, statusFilter, priorityFilter]);

  const handleCommand = (command: string, payload?: any) => {
      switch (command) {
          case 'navigate_list':
              setSelectedListId(payload);
              const workspaceId = lists.find(l => l.id === payload)?.workspaceId;
              if(workspaceId) setSelectedWorkspaceId(workspaceId);
              setActiveView('list');
              break;
          case 'navigate_my_tasks':
              handleSelectView('my_tasks');
              break;
          case 'navigate_dashboard':
              handleSelectView('dashboard');
              break;
          case 'navigate_admin':
              handleSelectView('app_admin');
              break;
          case 'create_task':
              if (selectedListId) {
                  handleAddTask(selectedListId);
              } else {
                  addToast("Por favor, selecciona un proyecto primero para añadir una tarea", "error");
              }
              break;
          case 'toggle_theme':
              setColorScheme(prev => prev === 'dark' ? 'light' : 'dark');
              break;
          case 'logout':
              setCurrentUser(null);
              break;
      }
      setCommandPaletteOpen(false);
  };
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (selectedTaskId || editingUserId || isWorkspaceModalOpen || isProjectModalOpen || isCommandPaletteOpen) return;
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;

        switch (event.key.toLowerCase()) {
            case 'n':
                if (activeView === 'list' && selectedListId) {
                    event.preventDefault();
                    handleAddTask(selectedListId);
                }
                break;
            case 'f':
                event.preventDefault();
                window.dispatchEvent(new CustomEvent('focus-global-search'));
                break;
        }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeView, selectedListId, selectedTaskId, editingUserId, isWorkspaceModalOpen, isProjectModalOpen, isCommandPaletteOpen]);

  useEffect(() => {
    const openPalette = () => setCommandPaletteOpen(true);
    const handleKeyDown = (event: KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
            event.preventDefault();
            setCommandPaletteOpen(p => !p);
        }
    };
    
    window.addEventListener('open-command-palette', openPalette);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
        window.removeEventListener('open-command-palette', openPalette);
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  useEffect(() => {
    const listsInWorkspace = lists.filter(l => l.workspaceId === selectedWorkspaceId);
    if (listsInWorkspace.length > 0 && !selectedListId) {
      setSelectedListId(listsInWorkspace[0].id);
    } else if (listsInWorkspace.length === 0) {
      setSelectedListId(null);
    }
  }, [selectedWorkspaceId, lists, selectedListId]);

  useEffect(() => {
    const root = document.documentElement;
    const currentTheme = themes[theme][colorScheme];
    Object.entries(currentTheme).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
    document.body.className = colorScheme === 'light' ? 'light-mode' : 'dark-mode';
  }, [theme, colorScheme]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);
  
  const handleGenerateSummary = async () => {
    if (!selectedList) return;
    setSummaryModalOpen(true);
    setSummaryLoading(true);
    setSummaryData({ title: `Resumen IA para ${selectedList.name}`, content: '' });
    const summary = await generateProjectSummary(filteredTasks, selectedList.name);
    setSummaryData(prev => ({ ...prev, content: summary }));
    setSummaryLoading(false);
  };

  const handleSaveTemplate = (name: string, taskData: Partial<Task>) => {
    const newTemplate: TaskTemplate = {
      id: `template-${Date.now()}`,
      name,
      taskData,
    };
    setTaskTemplates(prev => [...prev, newTemplate]);
    addToast(`Plantilla "${name}" guardada.`, "success");
  };

  if (isLoading) {
      return <WelcomePage />;
  }

  if (!currentUser) {
      return <UserSelectionPage users={users} onSelectUser={(userId) => setCurrentUser(users.find(u => u.id === userId) || null)} />;
  }

  return (
    <div className="flex h-screen bg-background text-text-primary">
      <Sidebar
        workspaces={workspaces}
        selectedWorkspaceId={selectedWorkspaceId}
        onSelectWorkspace={handleSelectWorkspace}
        onAddWorkspace={() => { setWorkspaceToEdit(null); setIsWorkspaceModalOpen(true); }}
        lists={listsInCurrentWorkspace}
        folders={foldersInCurrentWorkspace}
        selectedListId={selectedListId}
        onSelectList={(id) => { setSelectedListId(id); setActiveView('list'); setIsSidebarOpen(window.innerWidth > 768); }}
        onAddList={() => { setListToEdit(null); setIsProjectModalOpen(true); }}
        onAddFolder={() => { setFolderToEdit(null); setIsFolderModalOpen(true); }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentUser={currentUser}
        onOpenUserProfile={() => setEditingUserId(currentUser.id)}
        activeView={activeView}
        onSelectView={handleSelectView}
        onLogout={() => setCurrentUser(null)}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onUpdateUserStatus={handleUpdateUserStatus}
        onSidebarReorder={handleSidebarReorder}
      />
      
      {activeView === 'dashboard' ? (
        <AdminDashboard 
          tasks={tasks} 
          users={users} 
          lists={lists} 
          onToggleSidebar={() => setIsSidebarOpen(p => !p)} 
          isSidebarOpen={isSidebarOpen} 
          currentUser={currentUser} 
          onOpenUserProfile={() => setEditingUserId(currentUser.id)}
          onSelectTask={task => setSelectedTaskId(task.id)}
          onNavigateToList={(listId) => {
            const list = lists.find(l => l.id === listId);
            if(list) {
              setSelectedWorkspaceId(list.workspaceId);
              setSelectedListId(list.id);
              setActiveView('list');
            }
          }}
          setEditingUser={(user) => setEditingUserId(user?.id || null)}
          notifications={notifications}
          setNotifications={setNotifications}
        />
      ) : activeView === 'app_admin' ? (
        <AppAdminPanel
            workspaces={workspaces}
            lists={lists}
            tasks={tasks}
            users={users}
            onToggleSidebar={() => setIsSidebarOpen(p => !p)} 
            isSidebarOpen={isSidebarOpen} 
            currentUser={currentUser}
            onOpenUserProfile={() => setEditingUserId(currentUser.id)}
            onUpdateWorkspace={(ws) => setWorkspaces(prev => prev.map(w => w.id === ws.id ? ws : w))}
            onDeleteWorkspace={handleDeleteWorkspace}
            onUpdateUserRole={handleUpdateUserRole}
            onDeleteUser={handleDeleteUser}
            onEditUser={(user) => setEditingUserId(user.id)}
            onCreateUser={handleCreateUser}
            onEditWorkspace={(ws) => {setWorkspaceToEdit(ws); setIsWorkspaceModalOpen(true);}}
            addToast={addToast}
            onSelectWorkspace={handleSelectWorkspace}
            onSelectTask={task => setSelectedTaskId(task.id)}
            onNavigateToList={(listId) => {
                const list = lists.find(l => l.id === listId);
                if(list) {
                  setSelectedWorkspaceId(list.workspaceId);
                  setSelectedListId(list.id);
                  setActiveView('list');
                }
            }}
            setEditingUser={(user) => setEditingUserId(user?.id || null)}
            notifications={notifications}
            setNotifications={setNotifications}
        />
      ) : activeView === 'my_tasks' ? (
        <MyTasksView 
          allTasks={tasks}
          allLists={lists}
          currentUser={currentUser}
          users={users}
          onSelectTask={task => setSelectedTaskId(task.id)}
          onToggleSidebar={() => setIsSidebarOpen(p => !p)} 
          isSidebarOpen={isSidebarOpen} 
          onOpenUserProfile={() => setEditingUserId(currentUser.id)}
          onNavigateToList={(listId) => {
            const list = lists.find(l => l.id === listId);
            if(list) {
              setSelectedWorkspaceId(list.workspaceId);
              setSelectedListId(list.id);
              setActiveView('list');
            }
          }}
          setEditingUser={(user) => setEditingUserId(user?.id || null)}
          notifications={notifications}
          setNotifications={setNotifications}
          logActivity={logActivity}
        />
      ) : (
        <MainContent
          workspaceName={workspaces.find(w => w.id === selectedWorkspaceId)?.name || 'Workspace'}
          lists={listsInCurrentWorkspace}
          tasks={filteredTasks}
          allTasks={tasks}
          allLists={lists}
          selectedList={selectedList}
          users={users}
          onUpdateTask={handleUpdateTask}
          onAddTask={handleAddTask}
          onAddTaskForDate={handleAddTaskOnDate}
          onDeleteTask={handleDeleteTask}
          onSelectTask={task => setSelectedTaskId(task.id)}
          onToggleSidebar={() => setIsSidebarOpen(p => !p)}
          isSidebarOpen={isSidebarOpen}
          currentView={currentView}
          setCurrentView={setCurrentView}
          currentUser={currentUser}
          onOpenUserProfile={() => setEditingUserId(currentUser.id)}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          onEditList={(list) => { setListToEdit(list); setIsProjectModalOpen(true); }}
          onDeleteList={handleDeleteList}
          onOpenBlockingTasks={(task) => { setTaskForBlockingModal(task); setBlockingTasksModalOpen(true);}}
          setEditingUser={(user) => setEditingUserId(user?.id || null)}
          onGenerateSummary={handleGenerateSummary}
          taskTemplates={taskTemplates}
          onNavigateToList={(listId) => {
            const list = lists.find(l => l.id === listId);
            if(list) {
              setSelectedWorkspaceId(list.workspaceId);
              setSelectedListId(list.id);
              setActiveView('list');
            }
          }}
          notifications={notifications}
          setNotifications={setNotifications}
          logActivity={logActivity}
          onTasksReorder={handleTasksReorder}
          onBulkUpdateTasks={handleBulkUpdateTasks}
        />
      )}

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTaskId(null)}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          users={users}
          allLists={lists}
          currentUser={currentUser}
          allTasks={tasks}
          onOpenUserProfile={(user) => setEditingUserId(user.id)}
          addNotification={addNotification}
          onSaveTemplate={handleSaveTemplate}
          logActivity={logActivity}
        />
      )}
      {editingUser && (
        <UserProfileModal 
            user={editingUser}
            onClose={() => setEditingUserId(null)}
            onUpdateUser={handleUpdateUser}
            isEditingSelf={currentUser.id === editingUser.id}
        />
      )}
      <WorkspaceModal 
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        onSave={handleSaveWorkspace}
        workspaceToEdit={workspaceToEdit}
      />
      <ProjectModal 
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleSaveList}
        listToEdit={listToEdit}
        folders={foldersInCurrentWorkspace}
        workspaceId={selectedWorkspaceId}
      />
      <FolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onSave={handleSaveFolderPath}
        folderToEdit={folderToEdit}
      />
      {taskForBlockingModal && (
          <BlockingTasksModal
            isOpen={isBlockingTasksModalOpen}
            onClose={() => { setBlockingTasksModalOpen(false); setTaskForBlockingModal(null); }}
            task={taskForBlockingModal}
            allTasks={tasks}
            onSelectTask={(task) => {
                setSelectedTaskId(task.id);
                setBlockingTasksModalOpen(false);
            }}
          />
      )}
       <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        lists={lists}
        currentUser={currentUser}
        onCommand={handleCommand}
      />
      <AISummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        title={summaryData.title}
        content={summaryData.content}
        isLoading={isSummaryLoading}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        theme={theme}
        setTheme={setTheme}
        colorScheme={colorScheme}
        setColorScheme={setColorScheme}
      />

      <AIChatbot tasks={tasks} lists={lists} users={users} />

      <div className="fixed top-5 right-5 z-50 space-y-2">
        {toasts.map(toast => (
          <ToastComponent key={toast.id} toast={toast} onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} />
        ))}
      </div>
    </div>
  );
};

export default App;
