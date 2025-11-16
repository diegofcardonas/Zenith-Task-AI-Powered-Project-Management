import React, { useState, useEffect, useRef } from 'react';
import { Task, User, Status, Priority, Role, List } from '../types';

interface TaskRowProps {
  task: Task;
  users: User[];
  onSelectTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  currentUser: User;
  allTasks: Task[];
  allLists: List[];
  onOpenBlockingTasks: (task: Task) => void;
  logActivity: (taskId: string, text: string, user: User) => void;
  showActions?: boolean;
  isSelected: boolean;
  onToggleSelection: (taskId: string) => void;
  isDraggable: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragEnd: () => void;
}

const statusConfig: { [key in Status]: string } = {
  [Status.Todo]: 'bg-status-todo/20 text-status-todo',
  [Status.InProgress]: 'bg-status-inprogress/20 text-status-inprogress',
  [Status.Done]: 'bg-status-done/20 text-status-done',
};

const statusText: { [key in Status]: string } = {
    [Status.Todo]: 'Por Hacer',
    [Status.InProgress]: 'En Progreso',
    [Status.Done]: 'Hecho',
};


const PriorityIcon: React.FC<{ priority: Priority }> = ({ priority }) => {
    const config = {
        [Priority.High]: { iconColor: 'text-priority-high', label: 'Alta' },
        [Priority.Medium]: { iconColor: 'text-priority-medium', label: 'Media' },
        [Priority.Low]: { iconColor: 'text-priority-low', label: 'Baja' },
    };
    const { iconColor, label } = config[priority];
    return (
        <div className="flex items-center gap-2">
            <svg className={`w-3 h-3 ${iconColor}`} viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 18h16v-2H4v2zm0-5h16v-2H4v2zm0-5h16V6H4v2z" />
            </svg>
            <span>{label}</span>
        </div>
    );
};

const DependencyIndicator: React.FC<{ task: Task; allTasks: Task[]; onBlockingClick: () => void; }> = ({ task, allTasks, onBlockingClick }) => {
  const isBlocked = (task.dependsOn || []).some(depId => {
    const depTask = allTasks.find(t => t.id === depId);
    return depTask && depTask.status !== Status.Done;
  });

  const blockingTasks = allTasks.filter(t => t.dependsOn?.includes(task.id));

  if (isBlocked) {
    return (
      <div className="flex items-center text-amber-500" title="Esta tarea está bloqueada por otras tareas.">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }

  if (blockingTasks.length > 0) {
    const taskTitles = blockingTasks.map(t => t.title).join(', ');
    return (
      <button onClick={(e) => { e.stopPropagation(); onBlockingClick(); }} className="flex items-center gap-1 hover:text-primary transition-colors" title={`Esta tarea está bloqueando: ${taskTitles}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 9a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
          <path d="M15.5 6.5a1 1 0 00-1-1h-1.382l-.447-1.342A2 2 0 0011.025 3H8.975a2 2 0 00-1.646 1.158L6.882 5.5H5.5a1 1 0 000 2h1.082l.858 5.146A2 2 0 009.423 14h1.154a2 2 0 001.983-1.854l.858-5.146H14.5a1 1 0 001-1z" />
        </svg>
        <span>{blockingTasks.length}</span>
      </button>
    );
  }

  return null;
};


const TaskRow: React.FC<TaskRowProps> = ({ task, users, onSelectTask, onUpdateTask, onDeleteTask, currentUser, allTasks, allLists, onOpenBlockingTasks, logActivity, showActions = true, isSelected, onToggleSelection, isDraggable, onDragStart, onDragEnter, onDragEnd }) => {
  const isReadOnly = currentUser.role === Role.Guest;
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== Status.Done;
  const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);
  const moveMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (moveMenuRef.current && !moveMenuRef.current.contains(event.target as Node)) {
            setIsMoveMenuOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as Status;
    const oldStatus = task.status;
    onUpdateTask({ ...task, status: newStatus });
    logActivity(task.id, `cambió el estado de "${statusText[oldStatus]}" a "${statusText[newStatus]}"`, currentUser);
  };

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAssigneeId = e.target.value || null;
    const oldAssigneeName = users.find(u => u.id === task.assigneeId)?.name || 'nadie';
    const newAssigneeName = users.find(u => u.id === newAssigneeId)?.name || 'nadie';
    onUpdateTask({ ...task, assigneeId: newAssigneeId });
    logActivity(task.id, `cambió el asignado de "${oldAssigneeName}" a "${newAssigneeName}"`, currentUser);
  };
  
  const handleDeleteClick = () => {
      if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea? Esta acción no se puede deshacer.')) {
          onDeleteTask(task.id);
      }
  };
  
  const handleMoveTask = (newListId: string) => {
    const oldListName = allLists.find(l => l.id === task.listId)?.name || 'una lista';
    const newListName = allLists.find(l => l.id === newListId)?.name || 'otra lista';
    onUpdateTask({ ...task, listId: newListId });
    logActivity(task.id, `movió la tarea de "${oldListName}" a "${newListName}"`, currentUser);
    setIsMoveMenuOpen(false);
  };

  return (
    <div
      draggable={isDraggable}
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnter={(e) => onDragEnter(e, task.id)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      className={`grid grid-cols-12 gap-4 p-4 border-b border-border transition-colors duration-200 animate-fadeIn items-center ${isDraggable ? 'cursor-grab' : ''} ${isSelected ? 'bg-primary/10' : 'hover:bg-secondary-focus'}`}
      aria-label={`Tarea: ${task.title}`}
    >
      <div className="col-span-1 flex items-center" onClick={(e) => e.stopPropagation()}>
          <input 
              type="checkbox"
              className="w-4 h-4 rounded text-primary bg-surface border-border focus:ring-primary"
              checked={isSelected}
              onChange={() => onToggleSelection(task.id)}
          />
      </div>
      <div className="col-span-6 sm:col-span-3 md:col-span-2 font-medium text-text-primary truncate flex items-center gap-2">
        <DependencyIndicator task={task} allTasks={allTasks} onBlockingClick={() => onOpenBlockingTasks(task)} />
        <button 
            onClick={() => onSelectTask(task)} 
            className="text-left hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded truncate"
        >
            {task.title}
        </button>
      </div>

      <div className="col-span-2 hidden sm:block">
        <select
          value={task.assigneeId || ''}
          onChange={handleAssigneeChange}
          disabled={isReadOnly}
          className="w-full bg-secondary border border-transparent hover:border-border rounded-md px-2 py-1 text-sm focus:ring-primary focus:border-primary disabled:opacity-70 disabled:cursor-not-allowed"
          onClick={e => e.stopPropagation()}
        >
          <option value="">Sin Asignar</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>

      <div className="col-span-3 sm:col-span-2">
         <select
            value={task.status}
            onChange={handleStatusChange}
            disabled={isReadOnly}
            className={`w-full appearance-none text-xs font-medium rounded-full px-3 py-1 text-center cursor-pointer focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed ${statusConfig[task.status]}`}
            onClick={e => e.stopPropagation()}
        >
            {Object.values(Status).map(s => <option key={s} value={s}>{statusText[s]}</option>)}
        </select>
      </div>

      <div className={`col-span-2 hidden sm:block md:col-span-1 text-sm ${isOverdue ? 'text-priority-high font-semibold' : 'text-text-secondary'}`}>
        {new Date(task.dueDate).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })}
      </div>

      <div className="col-span-2 hidden md:block text-sm text-text-secondary"><PriorityIcon priority={task.priority} /></div>

      <div className="col-span-2 flex items-center justify-end">
        {showActions && !isReadOnly && (
            <div className="flex items-center">
                <div className="relative" ref={moveMenuRef}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMoveMenuOpen(p => !p); }}
                        className="p-2 text-text-secondary hover:text-primary rounded-full hover:bg-primary/10 transition-colors"
                        aria-label="Mover Tarea"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                    {isMoveMenuOpen && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-surface rounded-md shadow-lg border border-border z-10 p-1">
                            {allLists.filter(l => l.id !== task.listId).map(list => (
                                <button
                                    key={list.id}
                                    onClick={(e) => { e.stopPropagation(); handleMoveTask(list.id); }}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-secondary-focus flex items-center gap-2 rounded-md"
                                >
                                    <span className={`w-3 h-3 rounded-full ${list.color} flex-shrink-0`}></span>
                                    <span className="truncate">{list.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelectTask(task);
                    }}
                    className="p-2 text-text-secondary hover:text-blue-500 rounded-full hover:bg-blue-500/10 transition-colors"
                    aria-label="Editar Tarea"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                    </svg>
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick();
                    }}
                    className="p-2 text-text-secondary hover:text-red-500 rounded-full hover:bg-red-500/10 transition-colors"
                    aria-label="Eliminar Tarea"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default TaskRow;