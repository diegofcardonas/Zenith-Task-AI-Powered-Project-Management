import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import {
  Task, User, List, Workspace, Folder, Status, Priority, Role, UserStatus, ViewType,
  Toast, Notification, TaskTemplate, Activity
} from '../types';
import { ThemeName, ColorScheme, themes } from '../themes';
import { generateProjectSummary } from '../services/geminiService';
import { useTranslation } from '../i18n';

// --- MOCK DATA ---
const USERS: User[] = [
  { id: 'u1', name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=u1', role: Role.Admin, title: 'Project Manager', email: 'alex@zenith.com', team: 'Core', bio: 'Experienced Project Manager with a passion for agile methodologies.', status: UserStatus.Online },
  { id: 'u2', name: 'Maria Garcia', avatar: 'https://i.pravatar.cc/150?u=u2', role: Role.Member, title: 'Lead Developer', email: 'maria@zenith.com', team: 'Engineering', bio: 'Full-stack developer specializing in React and Node.js.', status: UserStatus.Online },
  { id: 'u3', name: 'David Chen', avatar: 'https://i.pravatar.cc/150?u=u3', role: Role.Member, title: 'UX/UI Designer', email: 'david@zenith.com', team: 'Design', bio: 'Creating intuitive and beautiful user experiences.', status: UserStatus.Away },
  { id: 'u4', name: 'Priya Patel', avatar: 'https://i.pravatar.cc/150?u=u4', role: Role.Member, title: 'QA Engineer', email: 'priya@zenith.com', team: 'Engineering', bio: 'Detail-oriented QA professional ensuring product quality.', status: UserStatus.Busy },
  { id: 'u5', name: 'Tom Wilson', avatar: 'https://i.pravatar.cc/150?u=u5', role: Role.Guest, title: 'Freelancer', email: 'tom@external.com', team: 'External', bio: 'Consultant providing external feedback.', status: UserStatus.Offline },
];

const WORKSPACES: Workspace[] = [
  { id: 'ws1', name: 'Zenith Corp' },
  { id: 'ws2', name: 'Side Projects' }
];

const FOLDERS: Folder[] = [
  { id: 'f1', name: 'Q3 Initiatives', workspaceId: 'ws1', order: 0 },
  { id: 'f2', name: 'Marketing Campaigns', workspaceId: 'ws1', order: 1 }
];

const LISTS: List[] = [
  { id: 'l1', name: 'Website Redesign', color: 'bg-blue-500', workspaceId: 'ws1', folderId: 'f1', order: 0 },
  { id: 'l2', name: 'Mobile App Dev', color: 'bg-purple-500', workspaceId: 'ws1', folderId: 'f1', order: 1 },
  { id: 'l3', name: 'Social Media Push', color: 'bg-pink-500', workspaceId: 'ws1', folderId: 'f2', order: 2 },
  { id: 'l4', name: 'Personal Blog', color: 'bg-green-500', workspaceId: 'ws2', folderId: null, order: 3 },
];

const TASKS: Task[] = [
    { id: 't1', title: 'Design Homepage Mockup', description: 'Create a high-fidelity mockup for the new homepage design in Figma.', status: Status.InProgress, priority: Priority.High, assigneeId: 'u3', dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], listId: 'l1', subtasks: [{id: 'st1', text: 'Wireframe layout', completed: true}, {id: 'st2', text: 'Select color palette', completed: false}], comments: [], attachments: [], reminder: null, createdAt: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0], dependsOn: [], activityLog: [] },
    { id: 't2', title: 'Develop Authentication API', description: 'Set up JWT-based authentication endpoints.', status: Status.InProgress, priority: Priority.High, assigneeId: 'u2', dueDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0], listId: 'l2', subtasks: [], comments: [], attachments: [], reminder: null, createdAt: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0], dependsOn: [], activityLog: [] },
    { id: 't3', title: 'Draft Q3 Blog Post', description: 'Write a blog post about our new features.', status: Status.Todo, priority: Priority.Medium, assigneeId: 'u1', dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], listId: 'l3', subtasks: [], comments: [], attachments: [], reminder: '1 day before', createdAt: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], dependsOn: [], activityLog: [] },
    { id: 't4', title: 'Finalize UI Kit', description: 'Complete the component library for the redesign project.', status: Status.Done, priority: Priority.Medium, assigneeId: 'u3', dueDate: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0], listId: 'l1', subtasks: [], comments: [], attachments: [], reminder: null, createdAt: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0], dependsOn: [], activityLog: [] },
    { id: 't5', title: 'Setup CI/CD Pipeline', description: 'Configure GitHub Actions for automated testing and deployment.', status: Status.Todo, priority: Priority.High, assigneeId: 'u2', dueDate: new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0], listId: 'l2', subtasks: [], comments: [], attachments: [], reminder: null, createdAt: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], dependsOn: ['t2'], activityLog: [] },
    { id: 't6', title: 'Test responsive layout', description: 'Ensure the new homepage is responsive on all major devices.', status: Status.Todo, priority: Priority.Medium, assigneeId: 'u4', dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0], listId: 'l1', subtasks: [], comments: [], attachments: [], reminder: null, createdAt: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0], dependsOn: ['t1'], activityLog: [] },
];

const NOTIFICATIONS: Notification[] = [
    { id: 'n1', userId: 'u1', text: 'Maria Garcia completed task "Finalize UI Kit"', read: false, timestamp: new Date(Date.now() - 1 * 3600000).toISOString() },
    { id: 'n2', userId: 'u1', text: 'You have 2 tasks overdue.', read: true, timestamp: new Date(Date.now() - 24 * 3600000).toISOString() },
];

const TASK_TEMPLATES: TaskTemplate[] = [
    { id: 'tt1', name: 'New Feature Checklist', taskData: { priority: Priority.Medium, subtasks: [{id:'stt1', text:'Define specs', completed: false}, {id:'stt2', text:'Develop feature', completed: false}, {id:'stt3', text:'Write tests', completed: false}, {id:'stt4', text:'Deploy', completed: false}] } },
    { id: 'tt2', name: 'Bug Report', taskData: { priority: Priority.High, title: 'Bug: ', description: '**Steps to Reproduce:**\n\n**Expected Behavior:**\n\n**Actual Behavior:**' } },
];

// --- TYPES ---
interface AppState {
    isLoading: boolean;
    currentUser: User | null;
    users: User[];
    workspaces: Workspace[];
    selectedWorkspaceId: string | null;
    folders: Folder[];
    lists: List[];
    selectedListId: string | null;
    tasks: Task[];
    selectedTaskId: string | null;
    editingUserId: string | null;
    activeView: 'dashboard' | 'app_admin' | 'my_tasks' | 'list';
    currentView: ViewType;
    statusFilter: Status | 'all';
    priorityFilter: Priority | 'all';
    isSidebarOpen: boolean;
    isWorkspaceModalOpen: boolean;
    workspaceToEdit: Workspace | null;
    isProjectModalOpen: boolean;
    listToEdit: List | null;
    isFolderModalOpen: boolean;
    folderToEdit: Folder | null;
    isBlockingTasksModalOpen: boolean;
    taskForBlockingModal: Task | null;
    isCommandPaletteOpen: boolean;
    isSummaryModalOpen: boolean;
    summaryData: { title: string; content: string };
    isSummaryLoading: boolean;
    isSettingsModalOpen: boolean;
    theme: ThemeName;
    colorScheme: ColorScheme;
    toasts: Toast[];
    notifications: Notification[];
    taskTemplates: TaskTemplate[];
    isConfirmationModalOpen: boolean;
    confirmationModalProps: {
        title: string;
        message: string;
        onConfirm: () => void;
    } | null;
}

type Action =
  | { type: 'SET_STATE'; payload: Partial<AppState> }
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: number }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'UPDATE_TASKS'; payload: Task[] }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'DELETE_TASKS'; payload: string[] }
  | { type: 'REORDER_TASKS'; payload: { listId: string; tasks: Task[] } }
  | { type: 'ADD_WORKSPACE'; payload: Workspace }
  | { type: 'UPDATE_WORKSPACE'; payload: Workspace }
  | { type: 'DELETE_WORKSPACE'; payload: string }
  | { type: 'ADD_LIST'; payload: List }
  | { type: 'UPDATE_LIST'; payload: List }
  | { type: 'DELETE_LIST'; payload: string }
  | { type: 'ADD_FOLDER'; payload: Folder }
  | { type: 'UPDATE_FOLDER'; payload: Folder }
  | { type: 'DELETE_FOLDER'; payload: string }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'timestamp' | 'read'> }
  | { type: 'ADD_TEMPLATE'; payload: TaskTemplate }
  | { type: 'SHOW_CONFIRMATION'; payload: { title: string; message: string; onConfirm: () => void; } }
  | { type: 'HIDE_CONFIRMATION' };


const initialState: AppState = {
    isLoading: true,
    currentUser: null,
    users: USERS,
    workspaces: WORKSPACES,
    selectedWorkspaceId: WORKSPACES[0]?.id || null,
    folders: FOLDERS,
    lists: LISTS,
    selectedListId: LISTS[0]?.id || null,
    tasks: TASKS,
    selectedTaskId: null,
    editingUserId: null,
    activeView: 'list',
    currentView: ViewType.Board,
    statusFilter: 'all',
    priorityFilter: 'all',
    isSidebarOpen: true,
    isWorkspaceModalOpen: false,
    workspaceToEdit: null,
    isProjectModalOpen: false,
    listToEdit: null,
    isFolderModalOpen: false,
    folderToEdit: null,
    isBlockingTasksModalOpen: false,
    taskForBlockingModal: null,
    isCommandPaletteOpen: false,
    isSummaryModalOpen: false,
    summaryData: { title: '', content: '' },
    isSummaryLoading: false,
    isSettingsModalOpen: false,
    theme: (localStorage.getItem('theme') as ThemeName) || 'default',
    colorScheme: (localStorage.getItem('colorScheme') as ColorScheme) || 'dark',
    toasts: [],
    notifications: NOTIFICATIONS,
    taskTemplates: TASK_TEMPLATES,
    isConfirmationModalOpen: false,
    confirmationModalProps: null,
};

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_STATE':
        return { ...state, ...action.payload };
    case 'ADD_TOAST':
        return { ...state, toasts: [...state.toasts, action.payload] };
    case 'REMOVE_TOAST':
        return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
    case 'ADD_TASK':
        return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
        return { ...state, tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'UPDATE_TASKS': {
        const updatedTaskIds = new Set(action.payload.map(ut => ut.id));
        const unchangedTasks = state.tasks.filter(t => !updatedTaskIds.has(t.id));
        return { ...state, tasks: [...unchangedTasks, ...action.payload] };
    }
    case 'DELETE_TASK': {
        const taskIdToDelete = action.payload;
        const remainingTasks = state.tasks.filter(t => t.id !== taskIdToDelete);
        const tasksWithCleanedDependencies = remainingTasks.map(task => {
            if (task.dependsOn?.includes(taskIdToDelete)) {
                return {
                    ...task,
                    dependsOn: task.dependsOn.filter(depId => depId !== taskIdToDelete),
                };
            }
            return task;
        });
        return {
            ...state,
            tasks: tasksWithCleanedDependencies,
            selectedTaskId: state.selectedTaskId === taskIdToDelete ? null : state.selectedTaskId,
        };
    }
    case 'DELETE_TASKS': {
        const taskIdsToDelete = new Set(action.payload);
        const remainingTasks = state.tasks.filter(t => !taskIdsToDelete.has(t.id));
        const tasksWithCleanedDependencies = remainingTasks.map(task => {
            const newDependsOn = task.dependsOn?.filter(depId => !taskIdsToDelete.has(depId));
            if (newDependsOn && newDependsOn.length !== (task.dependsOn?.length || 0)) {
                return { ...task, dependsOn: newDependsOn };
            }
            return task;
        });
        return {
            ...state,
            tasks: tasksWithCleanedDependencies,
            selectedTaskId: state.selectedTaskId && taskIdsToDelete.has(state.selectedTaskId) ? null : state.selectedTaskId,
        };
    }
    case 'REORDER_TASKS': {
        const otherTasks = state.tasks.filter(t => t.listId !== action.payload.listId);
        return { ...state, tasks: [...otherTasks, ...action.payload.tasks] };
    }
    case 'DELETE_WORKSPACE': {
        const listsInWorkspace = state.lists.filter(l => l.workspaceId === action.payload).map(l => l.id);
        const remainingWorkspaces = state.workspaces.filter(ws => ws.id !== action.payload);
        return {
            ...state,
            workspaces: remainingWorkspaces,
            folders: state.folders.filter(f => f.workspaceId !== action.payload),
            lists: state.lists.filter(l => l.workspaceId !== action.payload),
            tasks: state.tasks.filter(t => !listsInWorkspace.includes(t.listId)),
            selectedWorkspaceId: state.selectedWorkspaceId === action.payload ? remainingWorkspaces[0]?.id || null : state.selectedWorkspaceId,
        };
    }
    case 'DELETE_LIST': {
        return {
            ...state,
            lists: state.lists.filter(l => l.id !== action.payload),
            tasks: state.tasks.filter(t => t.listId !== action.payload),
            selectedListId: state.selectedListId === action.payload ? null : state.selectedListId,
        };
    }
     case 'DELETE_FOLDER': {
        return {
            ...state,
            folders: state.folders.filter(f => f.id !== action.payload),
            lists: state.lists.map(l => l.folderId === action.payload ? { ...l, folderId: null } : l)
        };
    }
     case 'DELETE_USER': {
        return {
            ...state,
            users: state.users.filter(u => u.id !== action.payload),
            tasks: state.tasks.map(t => t.assigneeId === action.payload ? { ...t, assigneeId: null } : t),
        }
    }
    case 'ADD_WORKSPACE': return { ...state, workspaces: [...state.workspaces, action.payload]};
    case 'UPDATE_WORKSPACE': return { ...state, workspaces: state.workspaces.map(w => w.id === action.payload.id ? action.payload : w) };
    case 'ADD_LIST': return { ...state, lists: [...state.lists, action.payload], isProjectModalOpen: false };
    case 'UPDATE_LIST': return { ...state, lists: state.lists.map(l => l.id === action.payload.id ? action.payload : l), isProjectModalOpen: false };
    case 'ADD_FOLDER': return { ...state, folders: [...state.folders, action.payload], isFolderModalOpen: false };
    case 'UPDATE_FOLDER': return { ...state, folders: state.folders.map(f => f.id === action.payload.id ? action.payload : f), isFolderModalOpen: false };
    case 'ADD_USER': return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER': return { ...state, users: state.users.map(u => u.id === action.payload.id ? action.payload : u) };
    case 'ADD_NOTIFICATION': {
        const newNotification: Notification = {
            ...action.payload,
            id: `n-${Date.now()}`,
            timestamp: new Date().toISOString(),
            read: false,
        };
        return { ...state, notifications: [newNotification, ...state.notifications] };
    }
    case 'ADD_TEMPLATE': return { ...state, taskTemplates: [...state.taskTemplates, action.payload] };
    case 'SHOW_CONFIRMATION':
        return { ...state, isConfirmationModalOpen: true, confirmationModalProps: action.payload };
    case 'HIDE_CONFIRMATION':
        return { ...state, isConfirmationModalOpen: false, confirmationModalProps: null };
    default:
      return state;
  }
};

interface AppContextType {
    state: AppState & {
        selectedTask: Task | null;
        editingUser: User | null;
        selectedList: List | null;
        allTasks: Task[];
        allLists: List[];
        filteredTasks: Task[];
    };
    actions: Record<string, (...args: any[]) => void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);
    const { t, i18n } = useTranslation();

    const checkAuth = useCallback(() => {
        const authedUserId = localStorage.getItem('authedUserId');
        if (authedUserId) {
            const user = USERS.find(u => u.id === authedUserId);
            if (user) {
                dispatch({ type: 'SET_STATE', payload: { currentUser: user } });
            }
        }
        dispatch({ type: 'SET_STATE', payload: { isLoading: false } });
    }, []);
    
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        const root = document.documentElement;
        const currentTheme = themes[state.theme][state.colorScheme];
        
        Object.entries(currentTheme).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });
        
        root.classList.remove('light', 'dark');
        root.classList.add(state.colorScheme);

        localStorage.setItem('theme', state.theme);
        localStorage.setItem('colorScheme', state.colorScheme);
    }, [state.theme, state.colorScheme]);

    const selectedTask = useMemo(() => state.tasks.find(t => t.id === state.selectedTaskId) || null, [state.tasks, state.selectedTaskId]);
    const editingUser = useMemo(() => state.users.find(u => u.id === state.editingUserId) || null, [state.users, state.editingUserId]);
    const selectedList = useMemo(() => state.lists.find(l => l.id === state.selectedListId) || null, [state.lists, state.selectedListId]);
    
    const filteredTasks = useMemo(() => {
        if (!selectedList) return [];
        return state.tasks.filter(task => {
            if (task.listId !== selectedList.id) return false;
            if (state.statusFilter !== 'all' && task.status !== state.statusFilter) return false;
            if (state.priorityFilter !== 'all' && task.priority !== state.priorityFilter) return false;
            return true;
        });
    }, [state.tasks, selectedList, state.statusFilter, state.priorityFilter]);

    // --- ACTIONS ---

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        dispatch({ type: 'ADD_TOAST', payload: { ...toast, id: Date.now() } });
    }, []);

    const showConfirmation = useCallback((title: string, message: string, onConfirm: () => void) => {
        dispatch({ type: 'SHOW_CONFIRMATION', payload: { title, message, onConfirm } });
    }, []);

    const hideConfirmation = useCallback(() => {
        dispatch({ type: 'HIDE_CONFIRMATION' });
    }, []);
    
    const simpleSetters = useMemo(() => ({
        setSelectedTaskId: (taskId: string | null) => dispatch({ type: 'SET_STATE', payload: { selectedTaskId: taskId } }),
        setSelectedListId: (listId: string | null) => dispatch({ type: 'SET_STATE', payload: { selectedListId: listId } }),
        setSelectedWorkspaceId: (workspaceId: string) => dispatch({ type: 'SET_STATE', payload: { selectedWorkspaceId: workspaceId } }),
        setActiveView: (view: AppState['activeView']) => dispatch({ type: 'SET_STATE', payload: { activeView: view } }),
        setCurrentView: (view: ViewType) => dispatch({ type: 'SET_STATE', payload: { currentView: view } }),
        setStatusFilter: (filter: Status | 'all') => dispatch({ type: 'SET_STATE', payload: { statusFilter: filter } }),
        setPriorityFilter: (filter: Priority | 'all') => dispatch({ type: 'SET_STATE', payload: { priorityFilter: filter } }),
        setEditingUserId: (userId: string | null) => dispatch({ type: 'SET_STATE', payload: { editingUserId: userId } }),
        setIsSidebarOpen: (isOpen: boolean) => dispatch({ type: 'SET_STATE', payload: { isSidebarOpen: isOpen } }),
        setIsWorkspaceModalOpen: (isOpen: boolean) => dispatch({ type: 'SET_STATE', payload: { isWorkspaceModalOpen: isOpen } }),
        setWorkspaceToEdit: (workspace: Workspace | null) => dispatch({ type: 'SET_STATE', payload: { workspaceToEdit: workspace } }),
        setIsProjectModalOpen: (isOpen: boolean) => dispatch({ type: 'SET_STATE', payload: { isProjectModalOpen: isOpen } }),
        setListToEdit: (list: List | null) => dispatch({ type: 'SET_STATE', payload: { listToEdit: list } }),
        setIsFolderModalOpen: (isOpen: boolean) => dispatch({ type: 'SET_STATE', payload: { isFolderModalOpen: isOpen } }),
        setFolderToEdit: (folder: Folder | null) => dispatch({ type: 'SET_STATE', payload: { folderToEdit: folder } }),
        setIsBlockingTasksModalOpen: (isOpen: boolean) => dispatch({ type: 'SET_STATE', payload: { isBlockingTasksModalOpen: isOpen } }),
        setTaskForBlockingModal: (task: Task | null) => dispatch({ type: 'SET_STATE', payload: { taskForBlockingModal: task } }),
        setIsCommandPaletteOpen: (isOpen: boolean) => dispatch({ type: 'SET_STATE', payload: { isCommandPaletteOpen: isOpen } }),
        setIsSummaryModalOpen: (isOpen: boolean) => dispatch({ type: 'SET_STATE', payload: { isSummaryModalOpen: isOpen } }),
        setIsSettingsModalOpen: (isOpen: boolean) => dispatch({ type: 'SET_STATE', payload: { isSettingsModalOpen: isOpen } }),
        setTheme: (theme: ThemeName) => dispatch({ type: 'SET_STATE', payload: { theme } }),
        setColorScheme: (scheme: ColorScheme) => dispatch({ type: 'SET_STATE', payload: { colorScheme: scheme } }),
        hideConfirmation,
    }), [hideConfirmation]);

    const handleLogin = useCallback((email: string, password_unused: string) => {
        // NOTE: Password is not checked for this mock implementation
        const user = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
            localStorage.setItem('authedUserId', user.id);
            dispatch({ type: 'SET_STATE', payload: { currentUser: user } });
        } else {
            addToast({ message: t('toasts.loginFailed'), type: 'error' });
        }
    }, [state.users, addToast, t]);
    
    const handleSignup = useCallback((name: string, email: string, password_unused: string) => {
        const userExists = state.users.some(u => u.email.toLowerCase() === email.toLowerCase());
        if (userExists) {
            addToast({ message: t('toasts.signupFailed'), type: 'error' });
            return;
        }
        const newUser: User = {
            id: `u-${Date.now()}`, name, role: Role.Member, // New users are members by default
            avatar: `https://i.pravatar.cc/150?u=${Date.now()}`, title: 'Team Member',
            email: email, team: 'Core', bio: '', status: UserStatus.Online,
        };
        dispatch({ type: 'ADD_USER', payload: newUser });
        localStorage.setItem('authedUserId', newUser.id);
        dispatch({ type: 'SET_STATE', payload: { currentUser: newUser } });
        addToast({ message: t('toasts.signupSuccess'), type: 'success' });
    }, [state.users, addToast, t]);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('authedUserId');
        dispatch({ type: 'SET_STATE', payload: { currentUser: null } });
    }, []);

    const setNotifications = useCallback((notifications: React.SetStateAction<Notification[]>) => {
        const newNotifications = typeof notifications === 'function' ? notifications(state.notifications) : notifications;
        dispatch({ type: 'SET_STATE', payload: { notifications: newNotifications } });
    }, [state.notifications]);
    
    const removeToast = useCallback((id: number) => dispatch({ type: 'REMOVE_TOAST', payload: id }), []);
    const addNotification = useCallback((notification: Omit<Notification, 'id'|'timestamp'|'read'>) => dispatch({ type: 'ADD_NOTIFICATION', payload: notification }), []);
    const handleUpdateUser = useCallback((user: User) => {
        dispatch({ type: 'UPDATE_USER', payload: user });
        addToast({ message: t('toasts.userProfileUpdated'), type: 'success' });
    }, [addToast, t]);

    const handleSaveWorkspace = useCallback((name: string) => {
        if(state.workspaceToEdit) {
            dispatch({ type: 'UPDATE_WORKSPACE', payload: { ...state.workspaceToEdit, name } });
            addToast({ message: t('toasts.workspaceUpdated'), type: 'success' });
        } else {
            const newWorkspace: Workspace = { id: `ws-${Date.now()}`, name };
            dispatch({ type: 'ADD_WORKSPACE', payload: newWorkspace });
            addToast({ message: t('toasts.workspaceCreated'), type: 'success' });
        }
    }, [state.workspaceToEdit, addToast, t]);

    const handleDeleteWorkspace = useCallback((workspaceId: string) => {
        const ws = state.workspaces.find(w => w.id === workspaceId);
        showConfirmation(
            t('common.delete') + ` "${ws?.name}"`,
            t('confirmations.deleteWorkspace', { name: ws?.name }),
            () => {
                dispatch({ type: 'DELETE_WORKSPACE', payload: workspaceId });
                addToast({ message: t('toasts.workspaceDeleted'), type: 'success' });
            }
        );
    }, [state.workspaces, addToast, t, showConfirmation]);
    
    const handleSaveList = useCallback((name: string, color: string, folderId: string | null) => {
        if(state.listToEdit) {
            dispatch({ type: 'UPDATE_LIST', payload: { ...state.listToEdit, name, color, folderId } });
            addToast({ message: t('toasts.projectUpdated'), type: 'success' });
        } else {
            const newList: List = { id: `l-${Date.now()}`, name, color, workspaceId: state.selectedWorkspaceId!, folderId, order: state.lists.length };
            dispatch({ type: 'ADD_LIST', payload: newList });
            addToast({ message: t('toasts.projectCreated'), type: 'success' });
        }
    }, [state.listToEdit, state.selectedWorkspaceId, state.lists.length, addToast, t]);
    
    const handleDeleteList = useCallback((listId: string) => {
        showConfirmation(
            t('header.deleteProject'),
            t('confirmations.deleteProject'),
            () => {
                dispatch({ type: 'DELETE_LIST', payload: listId });
                addToast({ message: t('toasts.projectDeleted'), type: 'success' });
            }
        );
    }, [addToast, t, showConfirmation]);

    const handleSaveFolder = useCallback((name: string) => {
        if(state.folderToEdit) {
            dispatch({ type: 'UPDATE_FOLDER', payload: { ...state.folderToEdit, name } });
            addToast({ message: t('toasts.folderUpdated'), type: 'success' });
        } else {
            const newFolder: Folder = { id: `f-${Date.now()}`, name, workspaceId: state.selectedWorkspaceId!, order: state.folders.length };
            dispatch({ type: 'ADD_FOLDER', payload: newFolder });
            addToast({ message: t('toasts.folderCreated'), type: 'success' });
        }
    }, [state.folderToEdit, state.selectedWorkspaceId, state.folders.length, addToast, t]);

    const handleDeleteFolder = useCallback((folderId: string) => {
        showConfirmation(
            t('sidebar.newFolder'),
            t('confirmations.deleteFolder'),
            () => {
                dispatch({ type: 'DELETE_FOLDER', payload: folderId });
                addToast({ message: t('toasts.folderDeleted'), type: 'success' });
            }
        );
    }, [addToast, t, showConfirmation]);

    const handleUpdateTask = useCallback((task: Task) => dispatch({ type: 'UPDATE_TASK', payload: task }), []);

    const handleDeleteTask = useCallback((taskId: string) => {
        showConfirmation(
            t('modals.deleteTask'),
            t('modals.confirmDeleteTask'),
            () => {
                dispatch({ type: 'DELETE_TASK', payload: taskId });
                addToast({ message: t('toasts.taskDeleted'), type: 'success' });
            }
        );
    }, [addToast, t, showConfirmation]);

    const handleBulkDeleteTasks = useCallback((taskIds: string[]) => {
        showConfirmation(
            t('modals.deleteTask'),
            t('confirmations.deleteTasks', { count: taskIds.length }),
            () => {
                dispatch({ type: 'DELETE_TASKS', payload: taskIds });
                addToast({ message: t('toasts.taskDeleted_plural', { count: taskIds.length }), type: 'success' });
            }
        );
    }, [addToast, t, showConfirmation]);

    const handleAddTask = useCallback((listId: string, template?: TaskTemplate) => {
        const baseTask = {
            id: `t-${Date.now()}`,
            title: 'New Task',
            description: '',
            status: Status.Todo,
            priority: Priority.Medium,
            assigneeId: null,
            dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
            listId,
            subtasks: [], comments: [], attachments: [], reminder: null,
            createdAt: new Date().toISOString(),
            dependsOn: [], activityLog: [],
        };
        const newTask = { ...baseTask, ...(template?.taskData || {}) };
        if (template?.taskData.title) newTask.title = template.taskData.title;
        dispatch({ type: 'ADD_TASK', payload: newTask });
        dispatch({ type: 'SET_STATE', payload: { selectedTaskId: newTask.id }});
    }, []);

    const handleAddTaskOnDate = useCallback((date: Date) => {
        if(!state.selectedListId) return;
        const newTask: Task = {
            id: `t-${Date.now()}`, title: 'New Event', description: '', status: Status.Todo,
            priority: Priority.Medium, assigneeId: null, dueDate: date.toISOString().split('T')[0],
            createdAt: new Date().toISOString(), listId: state.selectedListId,
            subtasks: [], comments: [], attachments: [], reminder: null, dependsOn: [], activityLog: [],
        };
        dispatch({ type: 'ADD_TASK', payload: newTask });
        dispatch({ type: 'SET_STATE', payload: { selectedTaskId: newTask.id } });
    }, [state.selectedListId]);
    
    const logActivity = useCallback((taskId: string, text: string, user: User) => {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return;
        const newActivity: Activity = { id: `act-${Date.now()}`, user, text, timestamp: new Date().toISOString() };
        const updatedTask = { ...task, activityLog: [newActivity, ...task.activityLog] };
        dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
    }, [state.tasks]);

    const handleGenerateSummary = useCallback(async () => {
        if (!selectedList) return;
        dispatch({ type: 'SET_STATE', payload: { isSummaryModalOpen: true, isSummaryLoading: true, summaryData: { title: t('modals.aiSummaryFor', { name: selectedList.name }), content: '' } } });
        const summary = await generateProjectSummary(filteredTasks, selectedList.name);
        dispatch({ type: 'SET_STATE', payload: { isSummaryLoading: false, summaryData: { title: t('modals.aiSummaryFor', { name: selectedList.name }), content: summary } } });
    }, [selectedList, filteredTasks, t]);

    const handleSidebarReorder = useCallback((folders: Folder[], lists: List[]) => {
        dispatch({ type: 'SET_STATE', payload: { folders, lists } });
        addToast({ message: t('toasts.sidebarReordered'), type: 'info' });
    }, [addToast, t]);

    const handleTasksReorder = useCallback((reorderedTasks: Task[]) => {
         const allOtherTasks = state.tasks.filter(t => !reorderedTasks.some(rt => rt.id === t.id));
         dispatch({ type: 'SET_STATE', payload: { tasks: [...allOtherTasks, ...reorderedTasks] } });
         addToast({ message: t('toasts.tasksReordered'), type: 'info' });
    }, [state.tasks, addToast, t]);

    const handleBulkUpdateTasks = useCallback((taskIds: string[], updates: Partial<Task>) => {
        const updatedTasks = state.tasks.map(task => 
            taskIds.includes(task.id) ? { ...task, ...updates } : task
        );
        dispatch({ type: 'UPDATE_TASKS', payload: updatedTasks });
        addToast({ message: t('toasts.tasksUpdated', { count: taskIds.length }), type: 'success' });
    }, [state.tasks, addToast, t]);

    const handleSelectWorkspace = useCallback((workspaceId: string) => {
        const firstListInWorkspace = state.lists.find(l => l.workspaceId === workspaceId);
        dispatch({ type: 'SET_STATE', payload: {
            selectedWorkspaceId: workspaceId,
            selectedListId: firstListInWorkspace?.id || null,
            activeView: firstListInWorkspace ? 'list' : 'dashboard',
        }});
    }, [state.lists]);

    const handleUpdateUserStatus = useCallback((userId: string, status: UserStatus) => {
        const user = state.users.find(u => u.id === userId);
        if (user) dispatch({ type: 'UPDATE_USER', payload: { ...user, status } });
    }, [state.users]);

    const handleSaveTemplate = useCallback((name: string, taskData: Partial<Task>) => {
        const newTemplate: TaskTemplate = { id: `tt-${Date.now()}`, name, taskData };
        dispatch({ type: 'ADD_TEMPLATE', payload: newTemplate });
        addToast({ message: t('toasts.templateSaved', { name }), type: 'success' });
    }, [addToast, t]);

    const handleNotificationClick = useCallback((notification: Notification) => {
        const newNotifications = state.notifications.map(n => n.id === notification.id ? { ...n, read: true } : n);
        let payload: Partial<AppState> = { notifications: newNotifications };
        if (notification.link?.type === 'task') {
            const task = state.tasks.find(t => t.id === notification.link?.taskId);
            if (task) {
                const list = state.lists.find(l => l.id === task.listId);
                if (list) {
                    payload = { ...payload, selectedWorkspaceId: list.workspaceId, selectedListId: list.id, activeView: 'list', selectedTaskId: task.id };
                }
            }
        }
        dispatch({ type: 'SET_STATE', payload });
    }, [state.notifications, state.tasks, state.lists]);

    const handleCreateUser = useCallback((name: string, role: Role) => {
        const newUser: User = {
            id: `u-${Date.now()}`, name, role, avatar: `https://i.pravatar.cc/150?u=${Date.now()}`, title: 'New Member',
            email: `${name.toLowerCase().replace(' ', '.')}@zenith.com`, team: 'Unassigned', bio: '', status: UserStatus.Offline,
        };
        dispatch({ type: 'ADD_USER', payload: newUser });
        addToast({ message: t('toasts.userCreated', { name }), type: 'success' });
    }, [addToast, t]);

    const handleDeleteUser = useCallback((userId: string) => {
        const user = state.users.find(u => u.id === userId);
        if (user) {
            showConfirmation(
                t('tooltips.deleteUser', { name: user.name }),
                t('confirmations.deleteUser', { name: user.name }),
                () => {
                    dispatch({ type: 'DELETE_USER', payload: userId });
                    addToast({ message: t('toasts.userDeleted'), type: 'success' });
                }
            );
        }
    }, [state.users, addToast, t, showConfirmation]);

    const handleUpdateUserRole = useCallback((userId: string, role: Role) => {
        const user = state.users.find(u => u.id === userId);
        if (user) dispatch({ type: 'UPDATE_USER', payload: { ...user, role } });
    }, [state.users]);

    const handleAIAction = useCallback((name: string, args: any) => {
        switch (name) {
            case 'create_task': {
                const { title, description, priority, assigneeName, dueDate, projectName } = args;
                let listIdToUse = state.selectedListId;
                if (projectName) {
                    const foundList = state.lists.find(l => l.name.toLowerCase() === projectName.toLowerCase());
                    if (foundList) listIdToUse = foundList.id;
                    // FIX: Explicitly cast 'projectName' from 'args' to string for type safety in translation.
                    else addToast({ message: t('toasts.projectNotFound', { name: String(projectName) }), type: 'info' });
                }
                if (!listIdToUse) { addToast({ message: t('toasts.selectProjectFirst'), type: 'info' }); return; }
                let assigneeIdToUse = null;
                if (assigneeName) {
                    const foundUser = state.users.find(u => u.name.toLowerCase() === assigneeName.toLowerCase());
                    if (foundUser) assigneeIdToUse = foundUser.id;
                    // FIX: Explicitly cast 'assigneeName' from 'args' to string for type safety in translation.
                    else addToast({ message: t('toasts.userNotFound', { name: String(assigneeName) }), type: 'info' });
                }
                const newTask: Task = {
                    id: `t-${Date.now()}`, title: title || 'New AI Task', description: description || '', status: Status.Todo,
                    priority: Object.values(Priority).includes(priority) ? priority : Priority.Medium, assigneeId: assigneeIdToUse,
                    dueDate: dueDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0], listId: listIdToUse,
                    subtasks: [], comments: [], attachments: [], reminder: null, createdAt: new Date().toISOString(), dependsOn: [], activityLog: [],
                };
                dispatch({ type: 'ADD_TASK', payload: newTask });
                addToast({ message: t('toasts.taskCreatedByAI', { title: newTask.title }), type: 'success' });
                break;
            }
            case 'update_task_status': {
                const { taskTitle, status } = args;
                const taskToUpdate = state.tasks.find(t => t.title.toLowerCase() === taskTitle.toLowerCase());
                if (taskToUpdate && Object.values(Status).includes(status)) {
                    dispatch({ type: 'UPDATE_TASK', payload: { ...taskToUpdate, status } });
                    addToast({ message: t('toasts.taskStatusUpdated', { title: taskToUpdate.title, status: i18n.t(`common.${status.replace(/\s+/g, '').toLowerCase()}`) }), type: 'success' });
                } else {
// FIX: Explicitly cast 'taskTitle' from 'args' to string for type safety in translation.
addToast({ message: t('toasts.taskNotFound', { title: String(taskTitle) }), type: 'error' });
}
                break;
            }
            case 'assign_task': {
                const { taskTitle, assigneeName } = args;
                const taskToUpdate = state.tasks.find(t => t.title.toLowerCase() === taskTitle.toLowerCase());
                const userToAssign = state.users.find(u => u.name.toLowerCase() === assigneeName.toLowerCase());
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

    const actions = useMemo(() => ({
        ...simpleSetters,
        handleLogin,
        handleSignup,
        handleLogout,
        setNotifications,
        addToast,
        removeToast,
        addNotification,
        showConfirmation,
        handleUpdateUser,
        handleSaveWorkspace,
        handleDeleteWorkspace,
        handleSaveList,
        handleDeleteList,
        handleSaveFolder,
        handleDeleteFolder,
        handleUpdateTask,
        handleDeleteTask,
        handleBulkDeleteTasks,
        handleAddTask,
        handleAddTaskOnDate,
        logActivity,
        handleGenerateSummary,
        handleSidebarReorder,
        handleTasksReorder,
        handleBulkUpdateTasks,
        handleSelectWorkspace,
        handleUpdateUserStatus,
        handleSaveTemplate,
        handleNotificationClick,
        handleCreateUser,
        handleDeleteUser,
        handleUpdateUserRole,
        handleAIAction,
    }), [
        simpleSetters, handleLogin, handleSignup, handleLogout, setNotifications, addToast, removeToast, addNotification, showConfirmation, handleUpdateUser, handleSaveWorkspace,
        handleDeleteWorkspace, handleSaveList, handleDeleteList, handleSaveFolder, handleDeleteFolder, handleUpdateTask,
        handleDeleteTask, handleBulkDeleteTasks, handleAddTask, handleAddTaskOnDate, logActivity, handleGenerateSummary, handleSidebarReorder,
        handleTasksReorder, handleBulkUpdateTasks, handleSelectWorkspace, handleUpdateUserStatus, handleSaveTemplate,
        handleNotificationClick, handleCreateUser, handleDeleteUser, handleUpdateUserRole, handleAIAction
    ]);

    const value = useMemo(() => ({
        state: {
            ...state,
            selectedTask,
            editingUser,
            selectedList,
            allTasks: state.tasks,
            allLists: state.lists,
            filteredTasks,
        },
        actions
    }), [state, selectedTask, editingUser, selectedList, filteredTasks, actions]);

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
