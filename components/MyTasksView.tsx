import React from 'react';
import { Task, User, List, Notification } from '../types';
import Header from './Header';
import TaskRow from './TaskRow';

interface MyTasksViewProps {
  allTasks: Task[];
  allLists: List[];
  currentUser: User;
  users: User[];
  onSelectTask: (task: Task) => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onOpenUserProfile: () => void;
  onNavigateToList: (listId: string) => void;
  setEditingUser: (user: User | null) => void;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  logActivity: (taskId: string, text: string, user: User) => void;
}

const MyTasksView: React.FC<MyTasksViewProps> = ({
  allTasks,
  allLists,
  currentUser,
  users,
  onSelectTask,
  onToggleSidebar,
  isSidebarOpen,
  onOpenUserProfile,
  onNavigateToList,
  setEditingUser,
  notifications,
  setNotifications,
  logActivity,
}) => {
  const myTasks = allTasks.filter(task => task.assigneeId === currentUser.id);

  const tasksByProject = myTasks.reduce((acc, task) => {
    const project = allLists.find(list => list.id === task.listId);
    if (project) {
      if (!acc[project.id]) {
        acc[project.id] = { project, tasks: [] };
      }
      acc[project.id].tasks.push(task);
    }
    return acc;
  }, {} as { [key: string]: { project: List; tasks: Task[] } });

  const projectGroups = Object.values(tasksByProject);

  return (
    <main className="flex-grow flex flex-col h-full overflow-y-auto">
      <Header
        title="Mis Tareas"
        onToggleSidebar={onToggleSidebar}
        isSidebarOpen={isSidebarOpen}
        currentUser={currentUser}
        onOpenUserProfile={onOpenUserProfile}
        allTasks={allTasks}
        allLists={allLists}
        allUsers={users}
        onSelectTask={onSelectTask}
        onNavigateToList={onNavigateToList}
        setEditingUser={setEditingUser}
        notifications={notifications}
        setNotifications={setNotifications}
      />
      <div className="flex-grow p-3 sm:p-6 space-y-6">
        {projectGroups.length > 0 ? (
          projectGroups.map(({ project, tasks }) => (
            <div key={project.id} className="bg-surface rounded-lg">
              <div className="p-4 border-b border-border flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${project.color}`}></span>
                    <h2 className="font-semibold text-lg text-text-primary">{project.name}</h2>
                </div>
                <button 
                    onClick={() => onNavigateToList(project.id)}
                    className="text-sm text-primary hover:underline"
                >
                    Ver Proyecto
                </button>
              </div>
              <div className="divide-y divide-border">
                {tasks.map(task => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    users={users}
                    onSelectTask={onSelectTask}
                    onUpdateTask={() => {}} // My Tasks view is read-only for status/assignee
                    onDeleteTask={() => {}} // Cannot delete from this view
                    currentUser={currentUser}
                    allTasks={allTasks}
                    allLists={allLists}
                    onOpenBlockingTasks={() => {}}
                    logActivity={logActivity}
                    showActions={false}
                    isSelected={false}
                    onToggleSelection={() => {}}
                    isDraggable={false}
                    onDragStart={() => {}}
                    onDragEnter={() => {}}
                    onDragEnd={() => {}}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <h2 className="text-2xl font-semibold">No tienes tareas asignadas.</h2>
              <p className="text-text-secondary mt-1">¡Buen trabajo!</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default MyTasksView;