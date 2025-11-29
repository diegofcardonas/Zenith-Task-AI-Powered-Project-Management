
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

export enum TaskType {
  Story = 'Story',
  Task = 'Task',
  Bug = 'Bug',
  Epic = 'Epic',
}

export type ApprovalStatus = 'none' | 'pending' | 'approved' | 'rejected';

export enum ViewType {
  Board = 'board',
  List = 'list',
  Calendar = 'calendar',
  Gantt = 'gantt',
  ProjectDashboard = 'project_dashboard',
  Eisenhower = 'eisenhower',
  Backlog = 'backlog',
  Approvals = 'approvals'
}

export enum Role {
  Admin = 'Admin',     // System Admin
  Manager = 'Manager', // Project Manager
  Member = 'Member',   // Worker
  Viewer = 'Viewer',   // Read-only
  Guest = 'Guest',     // Limited
}

export enum Permission {
  MANAGE_APP = 'MANAGE_APP',
  MANAGE_USERS = 'MANAGE_USERS',
  VIEW_DASHBOARD = 'VIEW_DASHBOARD',
  MANAGE_WORKSPACES_AND_PROJECTS = 'MANAGE_WORKSPACES_AND_PROJECTS',
  CREATE_TASKS = 'CREATE_TASKS',
  EDIT_TASKS = 'EDIT_TASKS',
  DELETE_TASKS = 'DELETE_TASKS',
  COMMENT = 'COMMENT',
  DRAG_AND_DROP = 'DRAG_AND_DROP',
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
    url: string;
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
  issueKey: string; // e.g. BTS-101
  type: TaskType;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  storyPoints?: number;
  assigneeId: string | null;
  approvalStatus: ApprovalStatus;
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
  key: string; // e.g. BTS, TX, OM
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

export interface ChatChannel {
    id: string;
    type: 'dm' | 'group';
    name: string;
    participants: string[];
    lastMessage?: string;
    unreadCount: number;
}

export interface ChatMessage {
    id: string;
    channelId: string;
    senderId: string;
    text: string;
    timestamp: string;
}
