
import React, { createContext, useContext, useReducer, useState, useEffect, useCallback, useMemo } from 'react';
import { 
    User, Task, List, Folder, Workspace, Notification, Toast, 
    ViewType, Status, Priority, Role, Permission, UserStatus, 
    TaskTemplate, Activity, TaskType, ApprovalStatus, ChatChannel, ChatMessage 
} from '../types';
import { useTranslation } from '../i18n';

// --- Mock Initial Data (Ceitel S.A.S Context) ---
const initialWorkspaces: Workspace[] = [
    { id: 'w1', name: 'Ceitel Operaciones' }
];

const initialFolders: Folder[] = [
    { id: 'f1', name: 'Contrato DICO', workspaceId: 'w1', order: 0 },
    { id: 'f2', name: 'Contrato SICTE', workspaceId: 'w1', order: 1 },
    { id: 'f3', name: 'Proyectos Directos', workspaceId: 'w1', order: 2 },
];

const initialUsers: User[] = [
    { id: 'u1', name: 'Edwin Alba', avatar: 'https://ui-avatars.com/api/?name=Edwin+Alba&background=ef4444&color=fff', role: Role.Admin, title: 'Gerente Operativo', email: 'edwin.alba@ceitel.com', team: 'Gerencia', bio: 'Supervisión general de operaciones DICO, SICTE y Nokia.', status: UserStatus.Busy, skills: ['Gerencia', 'Negociación', 'Operaciones'] },
    { id: 'u2', name: 'Sebastian Guio', avatar: 'https://ui-avatars.com/api/?name=Sebastian+Guio&background=purple&color=fff', role: Role.Admin, title: 'Gerente Administrativo', email: 'sebastian.guio@ceitel.com', team: 'Administrativa', bio: 'Gestión de recursos y administración.', status: UserStatus.Online, skills: ['Finanzas', 'Recursos Humanos'] },
    { id: 'u3', name: 'Diego Cardona', avatar: 'https://ui-avatars.com/api/?name=Diego+Cardona&background=0ea5e9&color=fff', role: Role.Manager, title: 'Coord. BTS y TX', email: 'diego.cardona@ceitel.com', team: 'Implementación', bio: 'Coordinador de proyectos BTS y Transmisión (DICO).', status: UserStatus.Online, skills: ['Implementación', 'MW', '4G/5G'] },
    { id: 'u4', name: 'Natalia Caballero', avatar: 'https://ui-avatars.com/api/?name=Natalia+Caballero&background=pink&color=fff', role: Role.Manager, title: 'Coord. O&M', email: 'natalia.caballero@ceitel.com', team: 'Mantenimiento', bio: 'Coordinadora de Operación y Mantenimiento.', status: UserStatus.Away, skills: ['O&M', 'Preventivos', 'Correctivos'] },
    { id: 'u5', name: 'Jhon Miranda', avatar: 'https://ui-avatars.com/api/?name=Jhon+Miranda&background=orange&color=fff', role: Role.Manager, title: 'Coord. Nokia', email: 'jhon.miranda@ceitel.com', team: 'Nokia', bio: 'Coordinador proyecto despliegue Nokia.', status: UserStatus.Online, skills: ['Nokia', 'Despliegue'] },
    { id: 'u6', name: 'Magda Castro', avatar: 'https://ui-avatars.com/api/?name=Magda+Castro&background=teal&color=fff', role: Role.Manager, title: 'Coord. Documentación', email: 'magda.castro@ceitel.com', team: 'Documentación', bio: 'Gestión documental y cierre de proyectos.', status: UserStatus.Busy, skills: ['Documentación', 'Calidad'] },
    { id: 'u7', name: 'Técnico Campo', avatar: 'https://ui-avatars.com/api/?name=Tecnico+Campo&background=gray&color=fff', role: Role.Member, title: 'Líder de Cuadrilla', email: 'tecnico@ceitel.com', team: 'Campo', bio: 'Ejecución de actividades en sitio.', status: UserStatus.Offline, skills: ['Alturas', 'Electricidad', 'Instalación'] },
    { id: 'u8', name: 'Auditor Claro', avatar: 'https://ui-avatars.com/api/?name=Auditor+Claro&background=red&color=fff', role: Role.Viewer, title: 'Auditor Externo', email: 'auditor@claro.com.co', team: 'Auditoría', bio: 'Verificación de estándares.', status: UserStatus.Offline, skills: ['Auditoría'] },
];

const initialLists: List[] = [
    { id: 'l1', name: 'Implementación BTS', key: 'BTS', color: 'bg-blue-500', workspaceId: 'w1', folderId: 'f1', order: 0 },
    { id: 'l6', name: 'Transmisión (TX)', key: 'TX', color: 'bg-cyan-500', workspaceId: 'w1', folderId: 'f1', order: 1 },
    { id: 'l2', name: 'Infraestructura Civil', key: 'CIV', color: 'bg-gray-500', workspaceId: 'w1', folderId: 'f1', order: 2 },
    { id: 'l3', name: 'Mantenimiento O&M', key: 'OM', color: 'bg-green-500', workspaceId: 'w1', folderId: 'f2', order: 0 },
    { id: 'l4', name: 'Despliegue Nokia', key: 'NOK', color: 'bg-indigo-500', workspaceId: 'w1', folderId: 'f3', order: 0 },
    { id: 'l5', name: 'Centro de Documentación', key: 'DOC', color: 'bg-amber-500', workspaceId: 'w1', order: 4 }, 
];

const initialTasks: Task[] = [
    // BTS Tasks (l1)
    { id: 't1', issueKey: 'BTS-101', type: TaskType.Story, title: 'Instalación Nodo 4G - Sitio: BOG_CENTRO_01', description: 'Instalación de equipos Huawei, cableado de energía DC y montaje de RRUs.', status: Status.InProgress, priority: Priority.High, storyPoints: 5, assigneeId: 'u7', approvalStatus: 'none', dueDate: new Date(Date.now() + 86400000).toISOString(), listId: 'l1', subtasks: [{id: 'st1', text: 'Montaje de antenas', completed: true}, {id: 'st2', text: 'Conexión de jumpers', completed: false}], comments: [], attachments: [], reminder: null, createdAt: new Date().toISOString(), dependsOn: [], activityLog: [] },
    
    // TX Tasks (l6)
    { id: 't5', issueKey: 'TX-42', type: TaskType.Task, title: 'Alineación Enlace MW - BOG_SUR_02 <-> BOG_SUR_05', description: 'Alineación de microondas banda E, pruebas de BER y comisionamiento.', status: Status.Todo, priority: Priority.High, storyPoints: 8, assigneeId: 'u3', approvalStatus: 'pending', dueDate: new Date(Date.now() + 120000000).toISOString(), listId: 'l6', subtasks: [], comments: [], attachments: [], reminder: null, createdAt: new Date().toISOString(), dependsOn: [], activityLog: [] },
    
    // O&M Tasks (l3)
    { id: 't2', issueKey: 'OM-305', type: TaskType.Task, title: 'Mantenimiento Preventivo - Estación Base CALI_NORTE', description: 'Limpieza de equipos, verificación de aires acondicionados y pruebas de baterías.', status: Status.Todo, priority: Priority.Medium, storyPoints: 3, assigneeId: 'u4', approvalStatus: 'none', dueDate: new Date(Date.now() + 172800000).toISOString(), listId: 'l3', subtasks: [], comments: [], attachments: [], reminder: null, createdAt: new Date().toISOString(), dependsOn: [], activityLog: [] },
    
    // Nokia Tasks (l4)
    { id: 't3', issueKey: 'NOK-88', type: TaskType.Story, title: 'Carga de TSS y Reporte Fotográfico - Proyecto Nokia', description: 'Subir evidencias al portal de Nokia para el sitio MED_POBLADO.', status: Status.Todo, priority: Priority.High, storyPoints: 2, assigneeId: 'u5', approvalStatus: 'approved', dueDate: new Date(Date.now() + 259200000).toISOString(), listId: 'l4', subtasks: [], comments: [], attachments: [], reminder: null, createdAt: new Date().toISOString(), dependsOn: [], activityLog: [] },
    
    // Documentation Tasks (l5)
    { id: 't4', issueKey: 'DOC-12', type: TaskType.Bug, title: 'Validación Carpeta Calidad Sitio BOG_CENTRO_01', description: 'Revisión de firmas y protocolo de pruebas para facturación a DICO.', status: Status.InProgress, priority: Priority.Low, storyPoints: 1, assigneeId: 'u6', approvalStatus: 'pending', dueDate: new Date(Date.now() + 432000000).toISOString(), listId: 'l5', subtasks: [], comments: [], attachments: [], reminder: null, createdAt: new Date().toISOString(), dependsOn: ['t1'], activityLog: [] },
];

const initialChatChannels: ChatChannel[] = [
    { id: 'c1', type: 'group', name: 'General', participants: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8'], unreadCount: 0, lastMessage: 'Welcome to Zenith Task!' },
    { id: 'c2', type: 'group', name: 'Implementación', participants: ['u1', 'u3', 'u7'], unreadCount: 2, lastMessage: 'Update on BTS-101?' }
];

const initialChatMessages: ChatMessage[] = [
    { id: 'm1', channelId: 'c1', senderId: 'u1', text: 'Welcome team!', timestamp: new Date(Date.now() - 100000000).toISOString() },
    { id: 'm2', channelId: 'c2', senderId: 'u3', text: 'Checking on site access.', timestamp: new Date(Date.now() - 5000000).toISOString() }
];

interface AppState {
    currentUser: User | null;
    users: User[];
    tasks: Task[];
    lists: List[];
    folders: Folder[];
    workspaces: Workspace[];
    selectedWorkspaceId: string;
    selectedListId: string | null;
    notifications: Notification[];
    toasts: Toast[];
    taskTemplates: TaskTemplate[];
    theme: 'default' | 'forest' | 'ocean' | 'sunset' | 'rose' | 'slate';
    colorScheme: 'light' | 'dark';
    isAdminPanelOpen: boolean;
    chatChannels: ChatChannel[];
    chatMessages: ChatMessage[];
    activeChatId: string | null;
    isChatOpen: boolean;
}

type Action =
    | { type: 'SET_USER'; payload: User | null }
    | { type: 'ADD_TASK'; payload: Task }
    | { type: 'UPDATE_TASK'; payload: Task }
    | { type: 'DELETE_TASK'; payload: string }
    | { type: 'BULK_UPDATE_TASKS'; payload: { ids: string[], updates: Partial<Task> } }
    | { type: 'BULK_DELETE_TASKS'; payload: string[] }
    | { type: 'SET_TASKS'; payload: Task[] }
    | { type: 'ADD_LIST'; payload: List }
    | { type: 'UPDATE_LIST'; payload: List }
    | { type: 'DELETE_LIST'; payload: string }
    | { type: 'ADD_FOLDER'; payload: Folder }
    | { type: 'UPDATE_FOLDER'; payload: Folder }
    | { type: 'DELETE_FOLDER'; payload: string }
    | { type: 'ADD_WORKSPACE'; payload: Workspace }
    | { type: 'UPDATE_WORKSPACE'; payload: Workspace }
    | { type: 'DELETE_WORKSPACE'; payload: string }
    | { type: 'ADD_USER'; payload: User }
    | { type: 'UPDATE_USER'; payload: User }
    | { type: 'DELETE_USER'; payload: string }
    | { type: 'BULK_DELETE_USERS'; payload: string[] }
    | { type: 'ADD_TOAST'; payload: Toast }
    | { type: 'REMOVE_TOAST'; payload: number }
    | { type: 'ADD_NOTIFICATION'; payload: Notification }
    | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
    | { type: 'SELECT_WORKSPACE'; payload: string }
    | { type: 'SELECT_LIST'; payload: string | null }
    | { type: 'SET_THEME'; payload: any }
    | { type: 'SET_COLOR_SCHEME'; payload: any }
    | { type: 'ADD_TEMPLATE'; payload: TaskTemplate }
    | { type: 'REORDER_SIDEBAR'; payload: { folders: Folder[], lists: List[] } }
    | { type: 'SET_ADMIN_PANEL_OPEN'; payload: boolean }
    | { type: 'SET_CHAT_OPEN'; payload: boolean }
    | { type: 'SET_ACTIVE_CHAT'; payload: string | null }
    | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
    | { type: 'ADD_CHAT_CHANNEL'; payload: ChatChannel }
    | { type: 'UPDATE_CHAT_CHANNEL'; payload: ChatChannel };

const appReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'SET_USER': return { ...state, currentUser: action.payload };
        case 'ADD_TASK': return { ...state, tasks: [...state.tasks, action.payload] };
        case 'UPDATE_TASK': return { ...state, tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t) };
        case 'DELETE_TASK': return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
        case 'BULK_UPDATE_TASKS': {
            const idsSet = new Set(action.payload.ids);
            return { ...state, tasks: state.tasks.map(t => idsSet.has(t.id) ? { ...t, ...action.payload.updates } : t) };
        }
        case 'BULK_DELETE_TASKS': {
            const idsSet = new Set(action.payload);
            return { ...state, tasks: state.tasks.filter(t => !idsSet.has(t.id)) };
        }
        case 'SET_TASKS': return { ...state, tasks: action.payload };
        case 'ADD_LIST': return { ...state, lists: [...state.lists, action.payload] };
        case 'UPDATE_LIST': return { ...state, lists: state.lists.map(l => l.id === action.payload.id ? action.payload : l) };
        case 'DELETE_LIST': return { ...state, lists: state.lists.filter(l => l.id !== action.payload) };
        case 'ADD_FOLDER': return { ...state, folders: [...state.folders, action.payload] };
        case 'UPDATE_FOLDER': return { ...state, folders: state.folders.map(f => f.id === action.payload.id ? action.payload : f) };
        case 'DELETE_FOLDER': return { ...state, folders: state.folders.filter(f => f.id !== action.payload) };
        case 'ADD_WORKSPACE': return { ...state, workspaces: [...state.workspaces, action.payload] };
        case 'UPDATE_WORKSPACE': return { ...state, workspaces: state.workspaces.map(w => w.id === action.payload.id ? action.payload : w) };
        case 'DELETE_WORKSPACE': return { ...state, workspaces: state.workspaces.filter(w => w.id !== action.payload) };
        case 'ADD_USER': return { ...state, users: [...state.users, action.payload] };
        case 'UPDATE_USER': return { ...state, users: state.users.map(u => u.id === action.payload.id ? action.payload : u) };
        case 'DELETE_USER': return { ...state, users: state.users.filter(u => u.id !== action.payload) };
        case 'BULK_DELETE_USERS': {
             const idsSet = new Set(action.payload);
             return { ...state, users: state.users.filter(u => !idsSet.has(u.id)) };
        }
        case 'ADD_TOAST': return { ...state, toasts: [...state.toasts, action.payload] };
        case 'REMOVE_TOAST': return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
        case 'ADD_NOTIFICATION': return { ...state, notifications: [action.payload, ...state.notifications] };
        case 'SET_NOTIFICATIONS': return { ...state, notifications: action.payload };
        case 'SELECT_WORKSPACE': return { ...state, selectedWorkspaceId: action.payload };
        case 'SELECT_LIST': return { ...state, selectedListId: action.payload };
        case 'SET_THEME': return { ...state, theme: action.payload };
        case 'SET_COLOR_SCHEME': return { ...state, colorScheme: action.payload };
        case 'ADD_TEMPLATE': return { ...state, taskTemplates: [...state.taskTemplates, action.payload] };
        case 'REORDER_SIDEBAR': return { ...state, folders: action.payload.folders, lists: action.payload.lists };
        case 'SET_ADMIN_PANEL_OPEN': return { ...state, isAdminPanelOpen: action.payload };
        case 'SET_CHAT_OPEN': return { ...state, isChatOpen: action.payload };
        case 'SET_ACTIVE_CHAT': {
            const channels = state.chatChannels.map(c => c.id === action.payload ? { ...c, unreadCount: 0 } : c);
            return { ...state, activeChatId: action.payload, chatChannels: channels };
        }
        case 'ADD_CHAT_MESSAGE': {
            const msg = action.payload;
            const channels = state.chatChannels.map(c => {
                if (c.id === msg.channelId) {
                    return {
                        ...c,
                        lastMessage: msg.text,
                        unreadCount: (state.activeChatId === c.id || msg.senderId === state.currentUser?.id) ? c.unreadCount : c.unreadCount + 1
                    };
                }
                return c;
            });
            return { ...state, chatMessages: [...state.chatMessages, msg], chatChannels: channels };
        }
        case 'ADD_CHAT_CHANNEL': return { ...state, chatChannels: [...state.chatChannels, action.payload] };
        case 'UPDATE_CHAT_CHANNEL': return { ...state, chatChannels: state.chatChannels.map(c => c.id === action.payload.id ? action.payload : c) };
        default: return state;
    }
};

const getPermissions = (role: Role): Set<Permission> => {
    const permissions = new Set<Permission>();
    if (role === Role.Viewer || role === Role.Member || role === Role.Manager || role === Role.Admin) {
        permissions.add(Permission.COMMENT);
    }
    if (role === Role.Member || role === Role.Manager || role === Role.Admin) {
        permissions.add(Permission.CREATE_TASKS);
        permissions.add(Permission.EDIT_TASKS); 
        permissions.add(Permission.DRAG_AND_DROP);
    }
    if (role === Role.Manager || role === Role.Admin) {
        permissions.add(Permission.MANAGE_WORKSPACES_AND_PROJECTS); 
        permissions.add(Permission.DELETE_TASKS); 
        permissions.add(Permission.VIEW_DASHBOARD); 
    }
    if (role === Role.Admin) {
        permissions.add(Permission.MANAGE_APP);   
        permissions.add(Permission.MANAGE_USERS); 
    }
    return permissions;
};

const AppContext = createContext<any>(null);

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { t, i18n } = useTranslation();
    
    const [state, dispatch] = useReducer(appReducer, {
        currentUser: null,
        users: initialUsers,
        tasks: initialTasks,
        lists: initialLists,
        folders: initialFolders,
        workspaces: initialWorkspaces,
        selectedWorkspaceId: initialWorkspaces[0].id,
        selectedListId: null,
        notifications: [],
        toasts: [],
        taskTemplates: [],
        theme: 'default',
        colorScheme: 'dark',
        isAdminPanelOpen: false,
        chatChannels: initialChatChannels,
        chatMessages: initialChatMessages,
        activeChatId: null,
        isChatOpen: false,
    });

    const [activeView, setActiveView] = useState('board'); 
    const [currentView, setCurrentView] = useState<ViewType>(ViewType.Board);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
    const [workspaceToEdit, setWorkspaceToEdit] = useState<Workspace | null>(null);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [listToEdit, setListToEdit] = useState<List | null>(null);
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const [folderToEdit, setFolderToEdit] = useState<Folder | null>(null);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [isBlockingTasksModalOpen, setIsBlockingTasksModalOpen] = useState(false);
    const [taskForBlockingModal, setTaskForBlockingModal] = useState<Task | null>(null);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [confirmationModalProps, setConfirmationModalProps] = useState<{ title: string, message: string, onConfirm: () => void } | null>(null);
    
    const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
    const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');

    const permissions = useMemo(() => {
        return state.currentUser ? getPermissions(state.currentUser.role) : new Set<Permission>();
    }, [state.currentUser]);

    const filteredTasks = useMemo(() => {
        let filtered = state.tasks;
        if (state.selectedListId) {
            filtered = filtered.filter(t => t.listId === state.selectedListId);
        }
        if (statusFilter !== 'all') {
            filtered = filtered.filter(t => t.status === statusFilter);
        }
        if (priorityFilter !== 'all') {
            filtered = filtered.filter(t => t.priority === priorityFilter);
        }
        return filtered;
    }, [state.tasks, state.selectedListId, statusFilter, priorityFilter]);

    // Use Memo for Actions to prevent recreation on every render
    const actions = useMemo(() => ({
        addToast: (toast: Omit<Toast, 'id'>) => dispatch({ type: 'ADD_TOAST', payload: { ...toast, id: Date.now() } }),
        removeToast: (id: number) => dispatch({ type: 'REMOVE_TOAST', payload: id }),
        showConfirmation: (title: string, message: string, onConfirm: () => void) => {
            setConfirmationModalProps({ title, message, onConfirm });
            setIsConfirmationModalOpen(true);
        },
        hideConfirmation: () => {
            setIsConfirmationModalOpen(false);
            setConfirmationModalProps(null);
        },
        logActivity: (taskId: string, text: string, user: User) => {
            const activity: Activity = {
                id: `act-${Date.now()}`,
                user,
                text,
                timestamp: new Date().toISOString(),
            };
            const task = state.tasks.find(t => t.id === taskId);
            if (task) {
                dispatch({ type: 'UPDATE_TASK', payload: { ...task, activityLog: [activity, ...task.activityLog] } });
            }
        },
        handleLogin: (email: string, password?: string) => {
            const normalizedEmail = email.trim().toLowerCase();
            const user = state.users.find(u => u.email.toLowerCase() === normalizedEmail);
            if (user) {
                dispatch({ type: 'SET_USER', payload: user });
            } else {
                dispatch({ type: 'ADD_TOAST', payload: { message: t('toasts.loginFailed'), type: 'error', id: Date.now() } });
            }
        },
        handleSignup: (name: string, email: string, password?: string) => {
            const normalizedEmail = email.trim().toLowerCase();
            if (state.users.some(u => u.email.toLowerCase() === normalizedEmail)) {
                dispatch({ type: 'ADD_TOAST', payload: { message: t('toasts.signupFailed'), type: 'error', id: Date.now() } });
                return;
            }
            const newUser: User = {
                id: `u-${Date.now()}`,
                name: name.trim(),
                email: normalizedEmail,
                role: Role.Member,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
                title: 'Member',
                team: 'General',
                bio: '',
                status: UserStatus.Online,
                skills: []
            };
            dispatch({ type: 'ADD_USER', payload: newUser });
            dispatch({ type: 'SET_USER', payload: newUser });
            dispatch({ type: 'ADD_TOAST', payload: { message: t('toasts.signupSuccess'), type: 'success', id: Date.now() } });
        },
        handleLogout: () => {
            dispatch({ type: 'SET_USER', payload: null });
            setIsSidebarOpen(false);
        },
        handleDeleteAccount: () => {
            if (!state.currentUser) return;
            const userId = state.currentUser.id;
            const userName = state.currentUser.name;

            const admins = state.users.filter(u => u.role === Role.Admin);
            if (state.currentUser.role === Role.Admin && admins.length <= 1) {
                dispatch({ type: 'ADD_TOAST', payload: { message: t('tooltips.lastAdminDelete'), type: 'error', id: Date.now() } });
                return;
            }

            setConfirmationModalProps({
                title: t('modals.deleteAccount'),
                message: t('modals.deleteAccountWarning'),
                onConfirm: () => {
                    const userTaskIds = state.tasks.filter(t => t.assigneeId === userId).map(t => t.id);
                    if (userTaskIds.length > 0) {
                        dispatch({ type: 'BULK_UPDATE_TASKS', payload: { ids: userTaskIds, updates: { assigneeId: null } } });
                    }
                    dispatch({ type: 'DELETE_USER', payload: userId });
                    dispatch({ type: 'SET_USER', payload: null });
                    setIsSidebarOpen(false);
                    dispatch({ type: 'ADD_TOAST', payload: { message: t('toasts.userDeleted', { name: userName }), type: 'success', id: Date.now() } });
                }
            });
            setIsConfirmationModalOpen(true);
        },
        handleAddTask: (listId: string, template?: TaskTemplate) => {
            const list = state.lists.find(l => l.id === listId);
            const projectKey = list ? list.key : 'PROJ';
            
            const projectTasks = state.tasks.filter(t => t.listId === listId);
            let maxNum = 0;
            projectTasks.forEach(t => {
                if (t.issueKey && t.issueKey.startsWith(projectKey + '-')) {
                    const num = parseInt(t.issueKey.split('-')[1], 10);
                    if (!isNaN(num) && num > maxNum) maxNum = num;
                }
            });
            const newIssueKey = `${projectKey}-${maxNum + 1}`;

            const newTask: Task = template ? { ...template.taskData, id: `t-${Date.now()}`, listId, issueKey: newIssueKey, createdAt: new Date().toISOString() } as Task : {
                id: `t-${Date.now()}`,
                issueKey: newIssueKey,
                type: TaskType.Task,
                title: t('common.new') + ' ' + t('common.tasks'),
                description: '',
                status: Status.Todo,
                priority: Priority.Medium,
                assigneeId: state.currentUser?.id || null,
                approvalStatus: 'none',
                dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                listId,
                subtasks: [],
                comments: [],
                attachments: [],
                reminder: null,
                createdAt: new Date().toISOString(),
                dependsOn: [],
                activityLog: [],
                storyPoints: 0,
            };
            dispatch({ type: 'ADD_TASK', payload: newTask });
            setSelectedTaskId(newTask.id);
        },
        handleAddTaskOnDate: (date: Date) => {
            if(!state.selectedListId) {
                 dispatch({ type: 'ADD_TOAST', payload: { message: t('toasts.selectProjectFirst'), type: 'info', id: Date.now() } });
                 return;
            }
            const listId = state.selectedListId;
            const list = state.lists.find(l => l.id === listId);
            const projectKey = list ? list.key : 'PROJ';
            
            const projectTasks = state.tasks.filter(t => t.listId === listId);
            let maxNum = 0;
            projectTasks.forEach(t => {
                if (t.issueKey && t.issueKey.startsWith(projectKey + '-')) {
                    const num = parseInt(t.issueKey.split('-')[1], 10);
                    if (!isNaN(num) && num > maxNum) maxNum = num;
                }
            });
            const newIssueKey = `${projectKey}-${maxNum + 1}`;

            const newTask: Task = {
                id: `t-${Date.now()}`,
                issueKey: newIssueKey,
                type: TaskType.Task,
                title: t('common.new') + ' ' + t('common.tasks'),
                description: '',
                status: Status.Todo,
                priority: Priority.Medium,
                assigneeId: state.currentUser?.id || null,
                approvalStatus: 'none',
                dueDate: date.toISOString().split('T')[0],
                listId: listId,
                subtasks: [],
                comments: [],
                attachments: [],
                reminder: null,
                createdAt: new Date().toISOString(),
                dependsOn: [],
                activityLog: [],
                storyPoints: 0,
            };
            dispatch({ type: 'ADD_TASK', payload: newTask });
            setSelectedTaskId(newTask.id);
        },
        handleUpdateTask: (task: Task) => dispatch({ type: 'UPDATE_TASK', payload: task }),
        handleDeleteTask: (taskId: string) => {
            const task = state.tasks.find(t => t.id === taskId);
            const taskTitle = task ? task.title : t('common.tasks');
            setConfirmationModalProps({
                title: t('common.delete'),
                message: t('confirmations.deleteTask'),
                onConfirm: () => {
                    dispatch({ type: 'DELETE_TASK', payload: taskId });
                    dispatch({ type: 'ADD_TOAST', payload: { message: t('toasts.taskDeleted', { title: taskTitle }), type: 'success', id: Date.now() } });
                    setSelectedTaskId(null);
                }
            });
            setIsConfirmationModalOpen(true);
        },
        handleBulkUpdateTasks: (ids: string[], updates: Partial<Task>) => {
            dispatch({ type: 'BULK_UPDATE_TASKS', payload: { ids, updates } });
            dispatch({ type: 'ADD_TOAST', payload: { message: t('toasts.tasksUpdated', { count: ids.length }), type: 'success', id: Date.now() } });
        },
        handleTasksReorder: (tasks: Task[]) => dispatch({ type: 'SET_TASKS', payload: tasks }), 
        handleBulkDeleteTasks: (ids: string[]) => {
             setConfirmationModalProps({
                title: t('common.delete'),
                message: t('confirmations.deleteTasks_plural', { count: ids.length }),
                onConfirm: () => {
                    dispatch({ type: 'BULK_DELETE_TASKS', payload: ids });
                    dispatch({ type: 'ADD_TOAST', payload: { message: t('toasts.taskDeleted_plural', { count: ids.length }), type: 'success', id: Date.now() } });
                }
             });
             setIsConfirmationModalOpen(true);
        },
        handleSaveWorkspace: (name: string) => {
            if (workspaceToEdit) {
                dispatch({ type: 'UPDATE_WORKSPACE', payload: { ...workspaceToEdit, name } });
                dispatch({ type: 'ADD_TOAST', payload: { message: t('toasts.workspaceUpdated'), type: 'success', id: Date.now() } });
            } else {
                const newWorkspace = { id: `w-${Date.now()}`, name };
                dispatch({ type: 'ADD_WORKSPACE', payload: newWorkspace });
                dispatch({ type: 'SELECT_WORKSPACE', payload: newWorkspace.id });
                dispatch({ type: 'ADD_TOAST', payload: { message: t('toasts.workspaceCreated'), type: 'success', id: Date.now() } });
            }
        },
        handleSaveList: (name: string, color: string, folderId: string | null) => {
            const key = name.substring(0, 3).toUpperCase();
            if (listToEdit) {
                dispatch({ type: 'UPDATE_LIST', payload: { ...listToEdit, name, color, folderId } });
                 dispatch({ type: 'ADD_TOAST', payload: { message: t('toasts.projectUpdated'), type: 'success', id: Date.now() } });
            } else {
                const newList = { id: `l-${Date.now()}`, name, key, color, folderId, workspaceId: state.selectedWorkspaceId, order: state.lists.length };
                dispatch({ type: 'ADD_LIST', payload: newList });
                dispatch({ type: 'SELECT_LIST', payload: newList.id });
                 dispatch({ type: 'ADD_TOAST', payload: { message: t('toasts.projectCreated'), type: 'success', id: Date.now() } });
            }
        },
        handleDeleteList: (listId: string) => {
            const list = state.lists.find(l => l.id === listId);
            const listName = list ? list.name : t('sidebar.projects');
            setConfirmationModalProps({
                title: t('common.delete'),
                message: t('confirmations.deleteProject'),
                onConfirm: () => {
                    dispatch({ type: 'DELETE_LIST', payload: listId });
                    const tasksToDelete = state.tasks.filter(t => t.listId === listId).map(t => t.id);
                    dispatch({ type: 'BULK_DELETE_TASKS', payload: tasksToDelete });
                    dispatch({ type: 'SELECT_LIST', payload: null });
                    dispatch({ type: 'ADD_TOAST', payload: { message: t('toasts.projectDeleted', { name: listName }), type: 'success', id: Date.now() } });
                }
            });
            setIsConfirmationModalOpen(true);
        },
        handleSaveFolder: (name: string) => {
            if (folderToEdit) {
                dispatch({ type: 'UPDATE_FOLDER', payload: { ...folderToEdit, name } });
                 dispatch({ type: 'ADD_TOAST', payload: { message: t('toasts.folderUpdated'), type: 'success', id: Date.now() } });
            } else {
                const newFolder = { id: `f-${Date.now()}`, name, workspaceId: state.selectedWorkspaceId, order: state.folders.length };
                dispatch({ type: 'ADD_FOLDER', payload: newFolder });
                 dispatch({ type: 'ADD_TOAST', payload: { message: t('toasts.folderCreated'), type: 'success', id: Date.now() } });
            }
        },
        handleUpdateUser: (user: User) => {
            dispatch({ type: 'UPDATE_USER', payload: user });
            if (state.currentUser?.id === user.id) {
                dispatch({ type: 'SET_USER', payload: user });
            }
            dispatch({ type: 'ADD_TOAST', payload: { message: t('toasts.userProfileUpdated'), type: 'success', id: Date.now() } });
        },
        handleUpdateUserStatus: (userId: string, status: UserStatus) => {
            const user = state.users.find(u => u.id === userId);
            if (user) {
                dispatch({ type: 'UPDATE_USER', payload: { ...user, status } });
                if (state.currentUser?.id === user.id) {
                    dispatch({ type: 'SET_USER', payload: { ...user, status } });
                }
                dispatch({ type: 'ADD_TOAST', payload: { message: t('toasts.userProfileUpdated'), type: 'success', id: Date.now() } });
            }
        },
        handleCreateUser: (name: string, role: Role) => {
            const newUser: User = {
                id: `u-${Date.now()}`,
                name,
                role,
                title: 'Member',
                email: `${name.toLowerCase().replace(/\s/g, '')}@example.com`,
                team: 'General',
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
                bio: '',
                status: UserStatus.Offline,
                skills: []
            };
            dispatch({ type: 'ADD_USER', payload: newUser });
            dispatch({ type: 'ADD_TOAST', payload: { message: t('toasts.userCreated', { name }), type: 'success', id: Date.now() } });
        },
        handleUpdateUserRole: (userId: string, role: Role) => {
            const user = state.users.find(u => u.id === userId);
            if (user) {
                 if (user.role === Role.Admin && role !== Role.Admin) {
                     const admins = state.users.filter(u => u.role === Role.Admin);
                     if (admins.length <= 1) {
                         dispatch({ type: 'ADD_TOAST', payload: { message: t('tooltips.lastAdminRole'), type: 'error', id: Date.now() } });
                         return;
                     }
                 }
                dispatch({ type: 'UPDATE_USER', payload: { ...user, role } });
            }
        },
        handleDeleteUser: (userId: string) => {
             const user = state.users.find(u => u.id === userId);
             if(!user) return;

             if (user.role === Role.Admin) {
                 const admins = state.users.filter(u => u.role === Role.Admin);
                 if (admins.length <= 1) {
                     dispatch({ type: 'ADD_TOAST', payload: { message: t('tooltips.lastAdminDelete'), type: 'error', id: Date.now() } });
                     return;
                 }
             }
             
             if (state.currentUser && state.currentUser.id === userId) {
                 dispatch({ type: 'ADD_TOAST', payload: { message: "Usa la opción de eliminar cuenta en ajustes.", type: 'error', id: Date.now() } });
                 return;
             }

             setConfirmationModalProps({
                title: t('common.delete'),
                message: t('confirmations.deleteUser', { name: user.name }),
                onConfirm: () => {
                    const userTaskIds = state.tasks.filter(t => t.assigneeId === userId).map(t => t.id);
                    if (userTaskIds.length > 0) {
                        dispatch({ type: 'BULK_UPDATE_TASKS', payload: { ids: userTaskIds, updates: { assigneeId: null } } });
                    }
                    dispatch({ type: 'DELETE_USER', payload: userId });
                    dispatch({ type: 'ADD_TOAST', payload: { message: t('toasts.userDeleted', { name: user.name }), type: 'success', id: Date.now() } });
                }
             });
             setIsConfirmationModalOpen(true);
        },
        handleBulkDeleteUsers: (userIds: string[]) => {
             const idsToDelete = userIds.filter(id => {
                 const user = state.users.find(u => u.id === id);
                 if (!user) return false;
                 if (state.currentUser && state.currentUser.id === id) return false;
                 if (user.role === Role.Admin) {
                     const admins = state.users.filter(u => u.role === Role.Admin);
                     const remainingAdmins = admins.filter(a => !userIds.includes(a.id));
                     if (remainingAdmins.length === 0) return false;
                 }
                 return true;
             });

             if (idsToDelete.length === 0) {
                 dispatch({ type: 'ADD_TOAST', payload: { message: "No se pueden eliminar los usuarios seleccionados.", type: 'error', id: Date.now() } });
                 return;
             }

             setConfirmationModalProps({
                title: t('common.delete'),
                message: t('confirmations.deleteTasks_plural', { count: idsToDelete.length }),
                onConfirm: () => {
                    const idsSet = new Set(idsToDelete);
                    const userTaskIds = state.tasks.filter(t => t.assigneeId && idsSet.has(t.assigneeId)).map(t => t.id);
                    
                    if (userTaskIds.length > 0) {
                        dispatch({ type: 'BULK_UPDATE_TASKS', payload: { ids: userTaskIds, updates: { assigneeId: null } } });
                    }
                    dispatch({ type: 'BULK_DELETE_USERS', payload: idsToDelete });
                    dispatch({ type: 'ADD_TOAST', payload: { message: t('toasts.bulkUpdateSuccess', { count: idsToDelete.length }), type: 'success', id: Date.now() } });
                }
             });
             setIsConfirmationModalOpen(true);
        },
        handleSaveTemplate: (name: string, taskData: Partial<Task>) => {
            const newTemplate: TaskTemplate = { id: `tpl-${Date.now()}`, name, taskData };
            dispatch({ type: 'ADD_TEMPLATE', payload: newTemplate });
            dispatch({ type: 'ADD_TOAST', payload: { message: t('toasts.templateSaved', { name }), type: 'success', id: Date.now() } });
        },
        setIsAdminPanelOpen: (isOpen: boolean) => dispatch({ type: 'SET_ADMIN_PANEL_OPEN', payload: isOpen }),
        handleCompleteSprint: (listId: string | null) => {
            const targetListId = listId;
            const tasksToArchive = state.tasks.filter(t => t.status === Status.Done && (targetListId ? t.listId === targetListId : true)).map(t => t.id);
            
            if(tasksToArchive.length === 0) {
                 dispatch({ type: 'ADD_TOAST', payload: { message: "No hay tareas completadas para archivar.", type: 'info', id: Date.now() } });
                 return;
            }
            dispatch({ type: 'ADD_TOAST', payload: { message: t('backlog.sprintCompletedMessage', { count: tasksToArchive.length }), type: 'success', id: Date.now() } });
        },
        handleSubmitForApproval: (taskId: string) => {
            const task = state.tasks.find(t => t.id === taskId);
            if (task) {
                dispatch({ type: 'UPDATE_TASK', payload: { ...task, approvalStatus: 'pending' } });
                dispatch({ type: 'ADD_TOAST', payload: { message: t('toasts.approvalSubmitted'), type: 'info', id: Date.now() } });
            }
        },
        handleApproveTask: (taskId: string) => {
            const task = state.tasks.find(t => t.id === taskId);
            if (task) {
                dispatch({ type: 'UPDATE_TASK', payload: { ...task, approvalStatus: 'approved', status: Status.Done } });
                dispatch({ type: 'ADD_TOAST', payload: { message: t('toasts.approvalApproved'), type: 'success', id: Date.now() } });
            }
        },
        handleRejectTask: (taskId: string) => {
            const task = state.tasks.find(t => t.id === taskId);
            if (task) {
                dispatch({ type: 'UPDATE_TASK', payload: { ...task, approvalStatus: 'rejected', status: Status.Todo } });
                dispatch({ type: 'ADD_TOAST', payload: { message: t('toasts.approvalRejected'), type: 'error', id: Date.now() } });
            }
        },
        setIsChatOpen: (isOpen: boolean) => dispatch({ type: 'SET_CHAT_OPEN', payload: isOpen }),
        handleSetActiveChat: (chatId: string) => dispatch({ type: 'SET_ACTIVE_CHAT', payload: chatId }),
        handleSendMessage: (channelId: string, text: string) => {
            if(!state.currentUser) return;
            const message: ChatMessage = {
                id: `m-${Date.now()}`,
                channelId,
                senderId: state.currentUser.id,
                text,
                timestamp: new Date().toISOString()
            };
            dispatch({ type: 'ADD_CHAT_MESSAGE', payload: message });
        },
        handleCreateOrOpenDM: (targetUserId: string) => {
            if(!state.currentUser) return;
            const existingChannel = state.chatChannels.find(c =>
                c.type === 'dm' &&
                c.participants.includes(state.currentUser!.id) &&
                c.participants.includes(targetUserId)
            );

            if (existingChannel) {
                dispatch({ type: 'SET_ACTIVE_CHAT', payload: existingChannel.id });
                dispatch({ type: 'SET_CHAT_OPEN', payload: true });
            } else {
                const newChannel: ChatChannel = {
                    id: `c-${Date.now()}`,
                    type: 'dm',
                    name: 'DM', // Display name is handled dynamically based on participants
                    participants: [state.currentUser.id, targetUserId],
                    unreadCount: 0
                };
                dispatch({ type: 'ADD_CHAT_CHANNEL', payload: newChannel });
                dispatch({ type: 'SET_ACTIVE_CHAT', payload: newChannel.id });
                dispatch({ type: 'SET_CHAT_OPEN', payload: true });
            }
        },
        handleAIAction: (actionName: string, args: any) => {
            if (actionName === 'create_task') {
                const title = args.title;
                const description = args.description || '';
                const priority = args.priority || Priority.Medium;
                let assigneeId = null;
                if (args.assigneeName) {
                    const user = state.users.find(u => u.name.toLowerCase().includes(args.assigneeName.toLowerCase()));
                    if (user) assigneeId = user.id;
                }
                
                const dueDate = args.dueDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];
                
                let listId = state.selectedListId;
                if (args.projectName) {
                    const list = state.lists.find(l => l.name.toLowerCase().includes(args.projectName.toLowerCase()));
                    if (list) listId = list.id;
                }
                if (!listId && state.lists.length > 0) listId = state.lists[0].id;

                if (listId) {
                    const list = state.lists.find(l => l.id === listId);
                    const projectKey = list ? list.key : 'PROJ';
                    const projectTasks = state.tasks.filter(t => t.listId === listId);
                    let maxNum = 0;
                    projectTasks.forEach(t => {
                        if (t.issueKey && t.issueKey.startsWith(projectKey + '-')) {
                            const num = parseInt(t.issueKey.split('-')[1], 10);
                            if (!isNaN(num) && num > maxNum) maxNum = num;
                        }
                    });
                    const newIssueKey = `${projectKey}-${maxNum + 1}`;

                    const newTask: Task = {
                        id: `t-${Date.now()}`,
                        issueKey: newIssueKey,
                        type: TaskType.Task,
                        title: title,
                        description: description,
                        status: Status.Todo,
                        priority: priority as Priority,
                        assigneeId: assigneeId,
                        approvalStatus: 'none',
                        dueDate: dueDate,
                        listId: listId,
                        subtasks: [],
                        comments: [],
                        attachments: [],
                        reminder: null,
                        createdAt: new Date().toISOString(),
                        dependsOn: [],
                        activityLog: [],
                        storyPoints: 0,
                    };
                    dispatch({ type: 'ADD_TASK', payload: newTask });
                    dispatch({ type: 'ADD_TOAST', payload: { message: t('toasts.tasksUpdated', {count: 1}), type: 'success', id: Date.now() } });
                }
            } else if (actionName === 'update_task_status') {
                const task = state.tasks.find(t => t.title.toLowerCase().includes(args.taskTitle.toLowerCase()));
                if (task) {
                    dispatch({ type: 'UPDATE_TASK', payload: { ...task, status: args.status } });
                    dispatch({ type: 'ADD_TOAST', payload: { message: t('toasts.taskStatusUpdated', { title: task.title, status: args.status }), type: 'success', id: Date.now() } });
                }
            } else if (actionName === 'assign_task') {
                const task = state.tasks.find(t => t.title.toLowerCase().includes(args.taskTitle.toLowerCase()));
                const user = state.users.find(u => u.name.toLowerCase().includes(args.assigneeName.toLowerCase()));
                if (task && user) {
                    dispatch({ type: 'UPDATE_TASK', payload: { ...task, assigneeId: user.id } });
                    dispatch({ type: 'ADD_TOAST', payload: { message: t('toasts.taskAssigned', { title: task.title, name: user.name }), type: 'success', id: Date.now() } });
                }
            }
        },
        setActiveView,
        setCurrentView,
        setIsSidebarOpen,
        setIsWorkspaceModalOpen,
        setWorkspaceToEdit,
        setIsProjectModalOpen,
        setListToEdit,
        setIsFolderModalOpen,
        setFolderToEdit,
        setSelectedTaskId,
        setEditingUserId,
        setIsBlockingTasksModalOpen,
        setTaskForBlockingModal,
        setIsCommandPaletteOpen,
        setIsSettingsModalOpen,
        setStatusFilter,
        setPriorityFilter,
        handleSelectWorkspace: (id: string) => dispatch({ type: 'SELECT_WORKSPACE', payload: id }),
        setSelectedWorkspaceId: (id: string) => dispatch({ type: 'SELECT_WORKSPACE', payload: id }),
        setSelectedListId: (id: string | null) => dispatch({ type: 'SELECT_LIST', payload: id }),
        setTheme: (theme: any) => dispatch({ type: 'SET_THEME', payload: theme }),
        setColorScheme: (scheme: any) => dispatch({ type: 'SET_COLOR_SCHEME', payload: scheme }),
        handleSidebarReorder: (folders: Folder[], lists: List[]) => dispatch({ type: 'REORDER_SIDEBAR', payload: { folders, lists } }),
        setNotifications: (notifications: Notification[]) => dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications }),
        addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => dispatch({ type: 'ADD_NOTIFICATION', payload: { ...notification, id: `n-${Date.now()}`, read: false, timestamp: new Date().toISOString() } }),
        handleNotificationClick: (notification: Notification) => {
             if(notification.link?.type === 'task') {
                 dispatch({ type: 'SELECT_LIST', payload: notification.link.listId });
                 setSelectedTaskId(notification.link.taskId);
             }
             const newNotifications = state.notifications.map(n => n.id === notification.id ? { ...n, read: true } : n);
             dispatch({ type: 'SET_NOTIFICATIONS', payload: newNotifications });
        }
    }), [state.tasks, state.users, state.currentUser, state.lists, state.folders, state.selectedWorkspaceId, workspaceToEdit, listToEdit, folderToEdit, t, state.chatChannels, state.activeChatId, state.chatMessages, state.selectedListId]);

    const fullState = useMemo(() => ({
        ...state,
        activeView,
        currentView,
        isSidebarOpen,
        isAdminPanelOpen: state.isAdminPanelOpen,
        isWorkspaceModalOpen,
        workspaceToEdit,
        isProjectModalOpen,
        listToEdit,
        isFolderModalOpen,
        folderToEdit,
        selectedTaskId,
        editingUserId,
        isBlockingTasksModalOpen,
        taskForBlockingModal,
        isCommandPaletteOpen,
        isSettingsModalOpen,
        isConfirmationModalOpen,
        confirmationModalProps,
        statusFilter,
        priorityFilter,
        filteredTasks,
        allTasks: state.tasks,
        allLists: state.lists,
        allUsers: state.users,
        selectedList: state.lists.find(l => l.id === state.selectedListId),
        selectedTask: state.tasks.find(t => t.id === selectedTaskId),
        editingUser: state.users.find(u => u.id === editingUserId),
        chatChannels: state.chatChannels,
        chatMessages: state.chatMessages,
        activeChatId: state.activeChatId,
        isChatOpen: state.isChatOpen,
    }), [state, activeView, currentView, isSidebarOpen, isWorkspaceModalOpen, workspaceToEdit, isProjectModalOpen, listToEdit, isFolderModalOpen, folderToEdit, selectedTaskId, editingUserId, isBlockingTasksModalOpen, taskForBlockingModal, isCommandPaletteOpen, isSettingsModalOpen, isConfirmationModalOpen, confirmationModalProps, statusFilter, priorityFilter, filteredTasks]);

    const contextValue = useMemo(() => ({
        state: fullState,
        actions,
        permissions
    }), [fullState, actions, permissions]);

    useEffect(() => {
        const root = document.documentElement;
        if (state.colorScheme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [state.theme, state.colorScheme]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};
