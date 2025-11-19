export enum Status {
  Todo = 'Todo',
  InProgress = 'In Progress',
  Done = 'Done',
}

export enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export enum ViewType {
  Board = 'board',
  List = 'list',
  Calendar = 'calendar',
  Gantt = 'gantt',
  ProjectDashboard = 'project_dashboard'
}

export enum Role {
  Admin = 'Admin',
  Member = 'Member',
  Viewer = 'Viewer',
  Guest = 'Guest',
}

export enum Permission {
  // High-level admin
  MANAGE_APP = 'MANAGE_APP', // Access App Admin Panel, manage users
  VIEW_DASHBOARD = 'VIEW_DASHBOARD', // Access Admin Dashboard

  // Project and structure management
  MANAGE_WORKSPACES_AND_PROJECTS = 'MANAGE_WORKSPACES_AND_PROJECTS', // Create/edit/delete workspaces, folders, projects

  // Task-level permissions
  CREATE_TASKS = 'CREATE_TASKS',
  EDIT_TASKS = 'EDIT_TASKS', // Edit all fields of a task, move it, etc.
  DELETE_TASKS = 'DELETE_TASKS',
  
  // Interaction permissions
  COMMENT = 'COMMENT',
  DRAG_AND_DROP = 'DRAG_AND_DROP', // For tasks and sidebar items
}

export enum UserStatus {
  Online = 'Online',
  Away = 'Away',
  Busy = 'Busy',
  Offline = 'Offline',
}

export interface Workspace {
  id: string;
  name: string;
}

export interface Folder {
  id: string;
  name: string;
  workspaceId: string;
  order: number;
}

export interface User {
  id:string;
  name: string;
  avatar: string;
  role: Role;
  title: string;
  email: string;
  team: string;
  bio: string;
  status: UserStatus;
  skills: string[];
}

export interface Comment {
  id: string;
  user: User;
  text: string;
  timestamp: string;
  parentId?: string;
}

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Attachment {
    id: string;
    name: string;
    url: string; // data URL for now
    type: string;
    size: number;
}

export interface Activity {
  id: string;
  user: User;
  text: string;
  timestamp: string;
  parentId?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assigneeId: string | null;
  dueDate: string;
  listId: string;
  subtasks: Subtask[];
  comments: Comment[];
  attachments: Attachment[];
  reminder: string | null;
  createdAt: string;
  dependsOn: string[];
  activityLog: Activity[];
}

export interface List {
  id: string;
  name: string;
  color: string;
  workspaceId: string;
  folderId?: string | null;
  order: number;
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface Notification {
    id: string;
    userId: string;
    text: string;
    read: boolean;
    timestamp: string;
    link?: { type: 'task', taskId: string, listId: string };
}

export interface TaskTemplate {
    id: string;
    name: string;
    taskData: Partial<Task>;
}

// Chat Types
export interface ChatMessage {
    id: string;
    channelId: string;
    senderId: string;
    text: string;
    timestamp: string;
}

export interface ChatChannel {
    id: string;
    name: string; // Group name or User Name for DM
    type: 'group' | 'dm';
    participants: string[]; // User IDs
    lastMessage?: string;
    lastMessageTime?: string;
    unreadCount?: number;
    avatar?: string; // Specific avatar for group or user avatar for DM
}