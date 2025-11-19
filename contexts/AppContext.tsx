import React, { createContext, useContext, useReducer, useState, useEffect, useCallback, useMemo } from 'react';
import { 
    User, Task, List, Folder, Workspace, Notification, Toast, 
    ViewType, Status, Priority, Role, Permission, UserStatus, 
    TaskTemplate, Activity 
} from '../types';
import { useTranslation } from '../i18n';
import { generateProjectSummary } from '../services/geminiService';

// --- Mock Initial Data ---
const initialWorkspaces: Workspace[] = [
    { id: 'w1', name: 'Main Workspace' }
];

const initialUsers: User[] = [
    { id: 'u1', name: 'Alex Morgan', avatar: 'https://i.pravatar.cc/150?u=1', role: Role.Admin, title: 'Product Manager', email: 'alex@example.com', team: 'Product', bio: 'Loves building things.', status: UserStatus.Online, skills: ['Product Management', 'Strategy', 'Agile'] },
    { id: 'u2', name: 'Sarah Jenkins', avatar: 'https://i.pravatar.cc/150?u=2', role: Role.Member, title: 'Frontend Dev', email: 'sarah@example.com', team: 'Engineering', bio: 'React enthusiast.', status: UserStatus.Busy, skills: ['React', 'TypeScript', 'Tailwind CSS'] },
    { id: 'u3', name: 'Mike Ross', avatar: 'https://i.pravatar.cc/150?u=3', role: Role.Viewer, title: 'Stakeholder', email: 'mike@example.com', team: 'Marketing', bio: 'Keeping an eye on progress.', status: UserStatus.Offline, skills: ['Marketing', 'SEO', 'Analytics'] },
];

const initialLists: List[] = [
    { id: 'l1', name: 'Website Redesign', color: 'bg-blue-500', workspaceId: 'w1', order: 0 },
    { id: 'l2', name: 'Mobile App Launch', color: 'bg-green-500', workspaceId: 'w1', order: 1 },
];

const initialTasks: Task[] = [
    { id: 't1', title: 'Design Homepage', description: 'Create new mockups', status: Status.InProgress, priority: Priority.High, assigneeId: 'u2', dueDate: new Date(Date.now() + 86400000).toISOString(), listId: 'l1', subtasks: [], comments: [], attachments: [], reminder: null, createdAt: new Date().toISOString(), dependsOn: [], activityLog: [] },
    { id: 't2', title: 'Setup CI/CD', description: 'Configure Github Actions', status: Status.Todo, priority: Priority.Medium, assigneeId: 'u2', dueDate: new Date(Date.now() + 172800000).toISOString(), listId: 'l2', subtasks: [], comments: [], attachments: [], reminder: null, createdAt: new Date().toISOString(), dependsOn: [], activityLog: [] },
];

// --- State & Reducer ---

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
    | { type: 'ADD_TOAST'; payload: Toast }
    | { type: 'REMOVE_TOAST'; payload: number }
    | { type: 'ADD_NOTIFICATION'; payload: Notification }
    | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
    | { type: 'SELECT_WORKSPACE'; payload: string }
    | { type: 'SELECT_LIST'; payload: string | null }
    | { type: 'SET_THEME'; payload: any }
    | { type: 'SET_COLOR_SCHEME'; payload: any }
    | { type: 'ADD_TEMPLATE'; payload: TaskTemplate }
    | { type: 'REORDER_SIDEBAR'; payload: { folders: Folder[], lists: List[] } };

const appReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'SET_USER': return { ...state, currentUser: action.payload };
        case 'ADD_TASK': return { ...state, tasks: [...state.tasks, action.payload] };
        case 'UPDATE_TASK': return { ...state, tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t) };
        case 'DELETE_TASK': return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
        case 'BULK_UPDATE_TASKS': return { ...state, tasks: state.tasks.map(t => action.payload.ids.includes(t.id) ? { ...t, ...action.payload.updates } : t) };
        case 'BULK_DELETE_TASKS': return { ...state, tasks: state.tasks.filter(t => !action.payload.includes(t.id)) };
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
        default: return state;
    }
};

// --- Permissions Helper ---
const getPermissions = (role: Role): Set<Permission> => {
    const permissions = new Set<Permission>();
    
    // Base permissions for everyone (if any)
    
    if (role === Role.Guest) {
        // Minimal access
    }

    if (role === Role.Viewer || role === Role.Member || role === Role.Admin) {
        permissions.add(Permission.COMMENT);
    }

    if (role === Role.Member || role === Role.Admin) {
        permissions.add(Permission.CREATE_TASKS);
        permissions.add(Permission.EDIT_TASKS);
        permissions.add(Permission.DELETE_TASKS);
        permissions.add(Permission.MANAGE_WORKSPACES_AND_PROJECTS);
        permissions.add(Permission.DRAG_AND_DROP);
    }

    if (role === Role.Admin) {
        permissions.add(Permission.MANAGE_APP);
        permissions.add(Permission.VIEW_DASHBOARD);
    }

    return permissions;
};

// --- Context Definition ---

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
        folders: [],
        workspaces: initialWorkspaces,
        selectedWorkspaceId: initialWorkspaces[0].id,
        selectedListId: null,
        notifications: [],
        toasts: [],
        taskTemplates: [],
        theme: 'default',
        colorScheme: 'dark',
    });

    // --- UI State ---
    const [activeView, setActiveView] = useState('board'); // 'board', 'list', 'calendar', etc. or 'dashboard', 'my_tasks'
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
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [summaryData, setSummaryData] = useState({ title: '', content: '' });
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [confirmationModalProps, setConfirmationModalProps] = useState<{ title: string, message: string, onConfirm: () => void } | null>(null);
    
    // Filters
    const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
    const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');

    // --- Derived State ---
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

    // --- Actions ---
    
    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        dispatch({ type: 'ADD_TOAST', payload: { ...toast, id: Date.now() } });
    }, []);

    const removeToast = useCallback((id: number) => {
        dispatch({ type: 'REMOVE_TOAST', payload: id });
    }, []);

    const showConfirmation = useCallback((title: string, message: string, onConfirm: () => void) => {
        setConfirmationModalProps({ title, message, onConfirm });
        setIsConfirmationModalOpen(true);
    }, []);

    const hideConfirmation = useCallback(() => {
        setIsConfirmationModalOpen(false);
        setConfirmationModalProps(null);
    }, []);

    const logActivity = useCallback((taskId: string, text: string, user: User) => {
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
    }, [state.tasks]);

    // --- Action Wrappers ---

    const handleLogin = (email: string, password?: string) => {
        const normalizedEmail = email.trim().toLowerCase();
        const user = state.users.find(u => u.email.toLowerCase() === normalizedEmail);
        if (user) {
            dispatch({ type: 'SET_USER', payload: user });
        } else {
            addToast({ message: t('toasts.loginFailed'), type: 'error' });
        }
    };

    const handleSignup = (name: string, email: string, password?: string) => {
        const normalizedEmail = email.trim().toLowerCase();
        if (state.users.some(u => u.email.toLowerCase() === normalizedEmail)) {
            addToast({ message: t('toasts.signupFailed'), type: 'error' });
            return;
        }
        const newUser: User = {
            id: `u-${Date.now()}`,
            name: name.trim(),
            email: normalizedEmail,
            role: Role.Member, // Default role
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
            title: 'New Member',
            team: 'General',
            bio: '',
            status: UserStatus.Online,
            skills: []
        };
        dispatch({ type: 'ADD_USER', payload: newUser });
        dispatch({ type: 'SET_USER', payload: newUser });
        addToast({ message: t('toasts.signupSuccess'), type: 'success' });
    };

    const handleLogout = () => {
        dispatch({ type: 'SET_USER', payload: null });
        setIsSidebarOpen(false); // Reset some UI state
    };

    const handleAddTask = (listId: string, template?: TaskTemplate) => {
        const newTask: Task = template ? { ...template.taskData, id: `t-${Date.now()}`, listId, createdAt: new Date().toISOString() } as Task : {
            id: `t-${Date.now()}`,
            title: t('common.new') + ' ' + t('common.tasks'),
            description: '',
            status: Status.Todo,
            priority: Priority.Medium,
            assigneeId: state.currentUser?.id || null,
            dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            listId,
            subtasks: [],
            comments: [],
            attachments: [],
            reminder: null,
            createdAt: new Date().toISOString(),
            dependsOn: [],
            activityLog: [],
        };
        dispatch({ type: 'ADD_TASK', payload: newTask });
        setSelectedTaskId(newTask.id);
    };
    
    const handleAddTaskOnDate = (date: Date) => {
        if(!state.selectedListId) {
             addToast({ message: t('toasts.selectProjectFirst'), type: 'info' });
             return;
        }
        const newTask: Task = {
            id: `t-${Date.now()}`,
            title: t('common.new') + ' ' + t('common.tasks'),
            description: '',
            status: Status.Todo,
            priority: Priority.Medium,
            assigneeId: state.currentUser?.id || null,
            dueDate: date.toISOString().split('T')[0],
            listId: state.selectedListId,
            subtasks: [],
            comments: [],
            attachments: [],
            reminder: null,
            createdAt: new Date().toISOString(),
            dependsOn: [],
            activityLog: [],
        };
        dispatch({ type: 'ADD_TASK', payload: newTask });
        setSelectedTaskId(newTask.id);
    };

    const handleUpdateTask = (task: Task) => dispatch({ type: 'UPDATE_TASK', payload: task });
    const handleDeleteTask = (taskId: string) => {
        showConfirmation(t('common.delete'), t('confirmations.deleteTask'), () => {
             dispatch({ type: 'DELETE_TASK', payload: taskId });
             addToast({ message: t('toasts.taskDeleted'), type: 'success' });
             setSelectedTaskId(null);
        });
    };
    const handleBulkUpdateTasks = (ids: string[], updates: Partial<Task>) => {
        dispatch({ type: 'BULK_UPDATE_TASKS', payload: { ids, updates } });
        addToast({ message: t('toasts.tasksUpdated', { count: ids.length }), type: 'success' });
    };
    const handleTasksReorder = (tasks: Task[]) => dispatch({ type: 'SET_TASKS', payload: tasks }); // Assuming reorder just updates the whole list for now
    const handleBulkDeleteTasks = (ids: string[]) => {
         showConfirmation(t('common.delete'), t('confirmations.deleteTasks_plural', { count: ids.length }), () => {
             dispatch({ type: 'BULK_DELETE_TASKS', payload: ids });
             addToast({ message: t('toasts.taskDeleted_plural', { count: ids.length }), type: 'success' });
        });
    };

    const handleSaveWorkspace = (name: string) => {
        if (workspaceToEdit) {
            dispatch({ type: 'UPDATE_WORKSPACE', payload: { ...workspaceToEdit, name } });
            addToast({ message: t('toasts.workspaceUpdated'), type: 'success' });
        } else {
            const newWorkspace = { id: `w-${Date.now()}`, name };
            dispatch({ type: 'ADD_WORKSPACE', payload: newWorkspace });
            dispatch({ type: 'SELECT_WORKSPACE', payload: newWorkspace.id });
            addToast({ message: t('toasts.workspaceCreated'), type: 'success' });
        }
    };

    const handleSaveList = (name: string, color: string, folderId: string | null) => {
        if (listToEdit) {
            dispatch({ type: 'UPDATE_LIST', payload: { ...listToEdit, name, color, folderId } });
             addToast({ message: t('toasts.projectUpdated'), type: 'success' });
        } else {
            const newList = { id: `l-${Date.now()}`, name, color, folderId, workspaceId: state.selectedWorkspaceId, order: state.lists.length };
            dispatch({ type: 'ADD_LIST', payload: newList });
            dispatch({ type: 'SELECT_LIST', payload: newList.id });
             addToast({ message: t('toasts.projectCreated'), type: 'success' });
        }
    };

    const handleDeleteList = (listId: string) => {
        showConfirmation(t('common.delete'), t('confirmations.deleteProject'), () => {
            dispatch({ type: 'DELETE_LIST', payload: listId });
            // Also delete tasks in list
            const tasksToDelete = state.tasks.filter(t => t.listId === listId).map(t => t.id);
            dispatch({ type: 'BULK_DELETE_TASKS', payload: tasksToDelete });
            dispatch({ type: 'SELECT_LIST', payload: null });
            addToast({ message: t('toasts.projectDeleted'), type: 'success' });
        });
    };

    const handleSaveFolder = (name: string) => {
        if (folderToEdit) {
            dispatch({ type: 'UPDATE_FOLDER', payload: { ...folderToEdit, name } });
             addToast({ message: t('toasts.folderUpdated'), type: 'success' });
        } else {
            const newFolder = { id: `f-${Date.now()}`, name, workspaceId: state.selectedWorkspaceId, order: state.folders.length };
            dispatch({ type: 'ADD_FOLDER', payload: newFolder });
             addToast({ message: t('toasts.folderCreated'), type: 'success' });
        }
    };

    const handleUpdateUser = (user: User) => {
        dispatch({ type: 'UPDATE_USER', payload: user });
        if (state.currentUser?.id === user.id) {
            dispatch({ type: 'SET_USER', payload: user });
        }
        addToast({ message: t('toasts.userProfileUpdated'), type: 'success' });
    };

    const handleUpdateUserStatus = (userId: string, status: UserStatus) => {
        const user = state.users.find(u => u.id === userId);
        if (user) {
            handleUpdateUser({ ...user, status });
        }
    };

    const handleCreateUser = (name: string, role: Role) => {
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
        addToast({ message: t('toasts.userCreated', { name }), type: 'success' });
    };

    const handleUpdateUserRole = (userId: string, role: Role) => {
        const user = state.users.find(u => u.id === userId);
        if (user) {
            dispatch({ type: 'UPDATE_USER', payload: { ...user, role } });
        }
    };

    const handleDeleteUser = (userId: string) => {
         const user = state.users.find(u => u.id === userId);
         if(!user) return;
         showConfirmation(t('common.delete'), t('confirmations.deleteUser', { name: user.name }), () => {
            dispatch({ type: 'DELETE_USER', payload: userId });
            // Unassign tasks
            const userTasks = state.tasks.filter(t => t.assigneeId === userId);
            userTasks.forEach(t => {
                dispatch({ type: 'UPDATE_TASK', payload: { ...t, assigneeId: null } });
            });
            addToast({ message: t('toasts.userDeleted'), type: 'success' });
         });
    };

    const handleGenerateSummary = async () => {
        const list = state.lists.find(l => l.id === state.selectedListId);
        if (!list) return;
        
        setIsSummaryLoading(true);
        setSummaryData({ title: t('modals.aiSummaryFor', { name: list.name }), content: '' });
        setIsSummaryModalOpen(true);

        const tasksInList = state.tasks.filter(t => t.listId === list.id);
        const summary = await generateProjectSummary(tasksInList, list.name);
        
        setSummaryData(prev => ({ ...prev, content: summary }));
        setIsSummaryLoading(false);
    };

    const handleSaveTemplate = (name: string, taskData: Partial<Task>) => {
        const newTemplate: TaskTemplate = { id: `tpl-${Date.now()}`, name, taskData };
        dispatch({ type: 'ADD_TEMPLATE', payload: newTemplate });
        addToast({ message: t('toasts.templateSaved', { name }), type: 'success' });
    };

    const handleAIAction = useCallback((name: string, args: any) => {
        switch (name) {
            case 'create_task': {
                const { title, description, priority, assigneeName, dueDate, projectName } = args;
                let listIdToUse = state.selectedListId;
                if (projectName) {
                    const foundList = state.lists.find(l => l.name.toLowerCase() === (projectName as string).toLowerCase());
                    if (foundList) listIdToUse = foundList.id;
                    // FIX: Explicitly cast 'projectName' from 'args' to string for type safety in translation.
                    else addToast({ message: t('toasts.projectNotFound', { name: String(projectName) }), type: 'info' });
                }
                if (!listIdToUse) { addToast({ message: t('toasts.selectProjectFirst'), type: 'info' }); return; }
                let assigneeIdToUse = null;
                if (assigneeName) {
                    const foundUser = state.users.find(u => u.name.toLowerCase() === (assigneeName as string).toLowerCase());
                    if (foundUser) assigneeIdToUse = foundUser.id;
                    // FIX: Explicitly cast 'assigneeName' from 'args' to string for type safety in translation.
                    else addToast({ message: t('toasts.userNotFound', { name: String(assigneeName) }), type: 'info' });
                }
                const newTask: Task = {
                    id: `t-${Date.now()}`, title: title || 'New AI Task', description: description || '', status: Status.Todo,
                    priority: Object.values(Priority).includes(priority as Priority) ? priority : Priority.Medium, assigneeId: assigneeIdToUse,
                    dueDate: dueDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0], listId: listIdToUse,
                    subtasks: [], comments: [], attachments: [], reminder: null, createdAt: new Date().toISOString(), dependsOn: [], activityLog: [],
                };
                dispatch({ type: 'ADD_TASK', payload: newTask });
                addToast({ message: t('toasts.taskCreatedByAI', { title: newTask.title }), type: 'success' });
                break;
            }
            case 'update_task_status': {
                const { taskTitle, status } = args;
                const taskToUpdate = state.tasks.find(t => t.title.toLowerCase() === (taskTitle as string).toLowerCase());
                if (taskToUpdate && Object.values(Status).includes(status as Status)) {
                    dispatch({ type: 'UPDATE_TASK', payload: { ...taskToUpdate, status } });
                    addToast({ message: t('toasts.taskStatusUpdated', { title: taskToUpdate.title, status: i18n.t(`common.${(status as string).replace(/\s+/g, '').toLowerCase()}`) }), type: 'success' });
                } else {
                    // FIX: Explicitly cast 'taskTitle' from 'args' to string for type safety in translation.
                    addToast({ message: t('toasts.taskNotFound', { title: String(taskTitle) }), type: 'error' });
                }
                break;
            }
            case 'assign_task': {
                const { taskTitle, assigneeName } = args;
                const taskToUpdate = state.tasks.find(t => t.title.toLowerCase() === (taskTitle as string).toLowerCase());
                const userToAssign = state.users.find(u => u.name.toLowerCase() === (assigneeName as string).toLowerCase());
                if (taskToUpdate && userToAssign) {
                    dispatch({ type: 'UPDATE_TASK', payload: { ...taskToUpdate, assigneeId: userToAssign.id } });
                    addToast({ message: t('toasts.taskAssigned', { title: taskToUpdate.title, name: userToAssign.name }), type: 'success' });
                } else if (!taskToUpdate) {
                     // FIX: Explicitly cast 'taskTitle' from 'args' to string for type safety in translation.
                     addToast({ message: t('toasts.taskNotFound', { title: String(taskTitle) }), type: 'error' });
                } else {
                     // FIX: Explicitly cast 'assigneeName' from 'args' to string for type safety in translation.
                     addToast({ message: t('toasts.userNotFound', { name: String(assigneeName) }), type: 'error' });
                }
                break;
            }
            default: console.warn(`Unknown AI action: ${name}`);
        }
    }, [state.selectedListId, state.lists, state.users, state.tasks, addToast, t, i18n]);

    const fullState = {
        ...state,
        activeView,
        currentView,
        isSidebarOpen,
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
        isSummaryModalOpen,
        summaryData,
        isSummaryLoading,
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
    };

    const actions = {
        addToast,
        removeToast,
        showConfirmation,
        hideConfirmation,
        logActivity,
        handleLogin,
        handleSignup,
        handleLogout,
        handleAddTask,
        handleAddTaskOnDate,
        handleUpdateTask,
        handleDeleteTask,
        handleBulkUpdateTasks,
        handleTasksReorder,
        handleBulkDeleteTasks,
        handleSaveWorkspace,
        handleSaveList,
        handleDeleteList,
        handleSaveFolder,
        handleUpdateUser,
        handleUpdateUserStatus,
        handleCreateUser,
        handleUpdateUserRole,
        handleDeleteUser,
        handleGenerateSummary,
        handleSaveTemplate,
        handleAIAction,
        
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
        setIsSummaryModalOpen,
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
    };

    useEffect(() => {
        // Apply theme
        const root = document.documentElement;
        const themeConfig = { 
            light: { primary: '#6a1b9a', background: '#ffffff', surface: '#f8fafc', textPrimary: '#1e293b', textSecondary: '#475569' },
            dark: { primary: '#8e24aa', background: '#111827', surface: '#1f2937', textPrimary: '#f9fafb', textSecondary: '#d1d5db' }
        }; // Simplified for reconstruction, ideally use themes.ts logic or apply class
        
        if (state.colorScheme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        // For real theme application, we'd map state.theme to CSS variables here
    }, [state.theme, state.colorScheme]);

    return (
        <AppContext.Provider value={{ state: fullState, actions, permissions }}>
            {children}
        </AppContext.Provider>
    );
};