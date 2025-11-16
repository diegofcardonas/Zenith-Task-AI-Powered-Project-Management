import React, { useMemo, useState } from 'react';
import { Task, Status, User, Role } from '../types';
import TaskCard from './TaskCard';

interface BoardViewProps {
  tasks: Task[];
  users: User[];
  onUpdateTask: (task: Task) => void;
  onSelectTask: (task: Task) => void;
  currentUser: User;
  allTasks: Task[];
  onOpenBlockingTasks: (task: Task) => void;
  onOpenUserProfile: (user: User) => void;
}

const BoardView: React.FC<BoardViewProps> = ({ tasks, users, onUpdateTask, onSelectTask, currentUser, allTasks, onOpenBlockingTasks, onOpenUserProfile }) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<Status | null>(null);
  
  const canDrag = currentUser.role !== Role.Guest;

  const STATUS_CONFIG = useMemo(() => ({
    [Status.Todo]: { title: 'Por Hacer', color: 'bg-status-todo' },
    [Status.InProgress]: { title: 'En Progreso', color: 'bg-status-inprogress' },
    [Status.Done]: { title: 'Hecho', color: 'bg-status-done' },
  }), []);

  const columns = useMemo(() => {
    const groupedTasks: { [key in Status]: Task[] } = {
      [Status.Todo]: [],
      [Status.InProgress]: [],
      [Status.Done]: [],
    };
    tasks.forEach(task => {
      groupedTasks[task.status].push(task);
    });
    return Object.values(Status).map(status => ({
      status,
      tasks: groupedTasks[status],
    }));
  }, [tasks]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    if (!canDrag) return;
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, status: Status) => {
    e.preventDefault();
    if (!canDrag) return;
    setDragOverStatus(status);
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = () => {
    if (!canDrag) return;
    setDragOverStatus(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetStatus: Status) => {
    e.preventDefault();
    if (!canDrag || !draggedTaskId) return;
    
    const taskToMove = tasks.find(t => t.id === draggedTaskId);
    if (taskToMove && taskToMove.status !== targetStatus) {
      onUpdateTask({ ...taskToMove, status: targetStatus });
    }
    
    setDraggedTaskId(null);
    setDragOverStatus(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 h-full">
      {columns.map(({ status, tasks: columnTasks }) => (
        <div
          key={status}
          className={`bg-surface rounded-lg flex flex-col transition-colors duration-200 ${dragOverStatus === status ? 'bg-secondary-focus' : ''}`}
          onDragOver={(e) => handleDragOver(e, status)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, status)}
        >
          <div className="p-4 border-b border-border sticky top-0 bg-surface rounded-t-lg">
            <h3 className="font-semibold text-lg flex items-center">
              <span className={`w-3 h-3 rounded-full mr-3 ${STATUS_CONFIG[status].color}`}></span>
              {STATUS_CONFIG[status].title}
              <span className="ml-2 text-sm bg-secondary-focus text-text-secondary rounded-full px-2 py-0.5">{columnTasks.length}</span>
            </h3>
          </div>
          <div className="p-2 sm:p-4 space-y-4 flex-grow overflow-y-auto">
            {columnTasks.length > 0 ? (
                columnTasks.map((task, index) => (
                    <div key={task.id} style={{ animationDelay: `${index * 50}ms`}} className="animate-fadeIn">
                        <TaskCard
                            task={task}
                            user={users.find(u => u.id === task.assigneeId)}
                            onSelectTask={onSelectTask}
                            onDragStart={handleDragStart}
                            isDraggable={canDrag}
                            allTasks={allTasks}
                            onOpenBlockingTasks={onOpenBlockingTasks}
                            onOpenUserProfile={onOpenUserProfile}
                        />
                    </div>
                ))
            ) : (
                <div className="flex items-center justify-center h-full text-text-secondary text-sm italic p-4">
                    Arrastra una tarea aquí o crea una nueva.
                </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BoardView;