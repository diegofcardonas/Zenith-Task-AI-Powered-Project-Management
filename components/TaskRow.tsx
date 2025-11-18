import React, { useState, useEffect, useRef } from 'react';
import { Task, User, Status, Priority, Role, List, Permission } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { useTranslation } from '../i18n';
import AvatarWithStatus from './AvatarWithStatus';

interface TaskRowProps {
  task: Task;
  isSelected?: boolean;
  onToggleSelection?: (taskId: string) => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragEnter?: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragEnd?: () => void;
}

const statusConfig: { [key in Status]: string } = {
  [Status.Todo]: 'bg-status-todo/20 text-status-todo',
  [Status.InProgress]: 'bg-status-inprogress/20 text-status-inprogress',
  [Status.Done]: 'bg-status-done/20 text-status-done',
};

const PriorityIcon: React.FC<{ priority: Priority }> = ({ priority }) => {
    const { t } = useTranslation();
    const config = {
        [Priority.High]: { iconColor: 'text-priority-high', label: t('common.high') },
        [Priority.Medium]: { iconColor: 'text-priority-medium', label: t('common.medium') },
        [Priority.Low]: { iconColor: 'text-priority-low', label: t('common.low') },
    };
    const { iconColor, label } = config[priority];
    return (
        <div className="flex items-center gap-1.5">
            <svg className={`w-3 h-3 ${iconColor}`} viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 18h16v-2H4v2zm0-5h16v-2H4v2zm0-5h16V6H4v2z" />
            </svg>
            <span className="text-xs md:text-sm">{label}</span>
        </div>
    );
};

const DependencyIndicator: React.FC<{ task: Task; onBlockingClick: () => void; }> = ({ task, onBlockingClick }) => {
  const { t } = useTranslation();
  const { state } = useAppContext();
  const { allTasks } = state;

  const isBlocked = (task.dependsOn || []).some(depId => {
    const depTask = allTasks.find(t => t.id === depId);
    return depTask && depTask.status !== Status.Done;
  });

  const blockingTasks = allTasks.filter(t => t.dependsOn?.includes(task.id));

  if (isBlocked) {
    return (
      <div className="flex items-center text-amber-500 flex-shrink-0" title={t('tooltips.blocked')}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }

  if (blockingTasks.length > 0) {
    const taskTitles = blockingTasks.map(t => t.title).join(', ');
    return (
      <button onClick={(e) => { e.stopPropagation(); onBlockingClick(); }} className="flex items-center gap-1 hover:text-primary transition-colors flex-shrink-0" title={t('tooltips.isBlocking', { tasks: taskTitles })}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 9a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
          <path d="M15.5 6.5a1 1 0 00-1-1h-1.382l-.447-1.342A2 2 0 0011.025 3H8.975a2 2 0 00-1.646 1.158L6.882 5.5H5.5a1 1 0 000 2h1.082l.858 5.146A2 2 0 009.423 14h1.154a2 2 0 001.983-1.854l.858-5.146H14.5a1 1 0 001-1z" />
        </svg>
        <span className="text-xs">{blockingTasks.length}</span>
      </button>
    );
  }

  return null;
};


const TaskRow: React.FC<TaskRowProps> = ({ 
    task, 
    isSelected = false, 
    onToggleSelection = (taskId) => {}, 
    onDragStart = (e, taskId) => {}, 
    onDragEnter = (e, taskId) => {}, 
    onDragEnd = () => {} 
}) => {
  const { state, actions, permissions } = useAppContext();
  const { users, currentUser, allLists } = state;
  const { handleUpdateTask, handleDeleteTask, setSelectedTaskId, logActivity, setTaskForBlockingModal, setIsBlockingTasksModalOpen } = actions;
  const { t, i18n } = useTranslation();

  const statusText: { [key in Status]: string } = {
    [Status.Todo]: t('common.todo'),
    [Status.InProgress]: t('common.inProgress'),
    [Status.Done]: t('common.done'),
  };
    
  const canEdit = permissions.has(Permission.EDIT_TASKS);
  const canDelete = permissions.has(Permission.DELETE_TASKS);
  const isDraggable = permissions.has(Permission.DRAG_AND_DROP);

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== Status.Done;
  const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);
  const moveMenuRef = useRef<HTMLDivElement>(null);
  const assignee = users.find(u => u.id === task.assigneeId);

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
    handleUpdateTask({ ...task, status: newStatus });
    logActivity(task.id, `cambió el estado de "${statusText[oldStatus]}" a "${statusText[newStatus]}"`, currentUser!);
  };

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAssigneeId = e.target.value || null;
    const oldAssigneeName = users.find(u => u.id === task.assigneeId)?.name || 'nadie';
    const newAssigneeName = users.find(u => u.id === newAssigneeId)?.name || 'nadie';
    handleUpdateTask({ ...task, assigneeId: newAssigneeId });
    logActivity(task.id, `cambió el asignado de "${oldAssigneeName}" a "${newAssigneeName}"`, currentUser!);
  };
  
  const handleMoveTask = (newListId: string) => {
    const oldListName = allLists.find(l => l.id === task.listId)?.name || 'una lista';
    const newListName = allLists.find(l => l.id === newListId)?.name || 'otra lista';
    handleUpdateTask({ ...task, listId: newListId });
    logActivity(task.id, `movió la tarea de "${oldListName}" a "${newListName}"`, currentUser!);
    setIsMoveMenuOpen(false);
  };

  return (
    <div
      draggable={isDraggable}
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnter={(e) => onDragEnter(e, task.id)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      className={`
        group flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 p-3 md:p-4 
        border-b border-border transition-colors duration-200 animate-fadeIn 
        ${isDraggable ? 'cursor-grab' : ''} 
        ${isSelected ? 'bg-primary/10' : 'hover:bg-secondary-focus'}
      `}
      aria-label={`Tarea: ${task.title}`}
    >
      {/* Mobile Layout: Top Row (Checkbox + Title) */}
      <div className="flex items-start gap-3 col-span-6 sm:col-span-3 md:col-span-2">
          <div className="flex items-center h-6" onClick={(e) => e.stopPropagation()}>
            <input 
                type="checkbox"
                className="w-5 h-5 md:w-4 md:h-4 rounded text-primary bg-surface border-border focus:ring-primary disabled:opacity-50"
                checked={isSelected}
                onChange={() => onToggleSelection(task.id)}
                disabled={!canEdit}
            />
          </div>
          <div className="flex-grow min-w-0 flex items-center gap-2">
             <DependencyIndicator task={task} onBlockingClick={() => { setTaskForBlockingModal(task); setIsBlockingTasksModalOpen(true); }} />
             <button 
                 onClick={() => setSelectedTaskId(task.id)} 
                 className="text-left hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded truncate font-medium text-text-primary text-base md:text-sm"
             >
                 {task.title}
             </button>
          </div>
      </div>

      {/* Mobile Layout: Bottom Row / Desktop: Columns */}
      <div className="flex flex-wrap md:contents items-center gap-y-2 gap-x-4 pl-8 md:pl-0">
        
        {/* Assignee */}
        <div className="col-span-2 md:block w-full md:w-auto order-3 md:order-none">
             {/* Mobile Assignee View */}
             <div className="md:hidden flex items-center gap-2 mb-1">
                 <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">{t('listView.assignee')}:</span>
                 {assignee ? (
                     <div className="flex items-center gap-2 bg-secondary-focus/50 pr-2 rounded-full">
                         <AvatarWithStatus user={assignee} className="w-6 h-6" />
                         <span className="text-sm text-text-primary">{assignee.name}</span>
                     </div>
                 ) : (
                     <span className="text-sm text-text-secondary italic">{t('common.unassigned')}</span>
                 )}
             </div>
            
             {/* Desktop Assignee Select */}
             <div className="hidden md:block">
                <select
                    value={task.assigneeId || ''}
                    onChange={handleAssigneeChange}
                    disabled={!canEdit}
                    className="w-full bg-secondary border border-transparent hover:border-border rounded-md px-2 py-1 text-sm focus:ring-primary focus:border-primary disabled:opacity-70 disabled:cursor-not-allowed"
                    onClick={e => e.stopPropagation()}
                >
                    <option value="">{t('common.unassigned')}</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
            </div>
        </div>

        {/* Status */}
        <div className="col-span-3 sm:col-span-2 w-1/2 md:w-auto order-1 md:order-none">
            <select
                value={task.status}
                onChange={handleStatusChange}
                disabled={!canEdit}
                className={`w-full appearance-none text-xs font-medium rounded-full px-3 py-1 text-center cursor-pointer focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed ${statusConfig[task.status]}`}
                onClick={e => e.stopPropagation()}
            >
                {Object.values(Status).map(s => <option key={s} value={s}>{statusText[s]}</option>)}
            </select>
        </div>

        {/* Due Date */}
        <div className={`col-span-2 hidden sm:block md:col-span-1 text-sm w-auto order-2 md:order-none ${isOverdue ? 'text-priority-high font-semibold' : 'text-text-secondary'}`}>
           <div className="flex items-center gap-1">
             <span className="md:hidden text-xs text-text-secondary uppercase font-semibold mr-1">{t('listView.dueDate')}:</span>
             {new Date(task.dueDate).toLocaleDateString(i18n.language, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            })}
           </div>
        </div>

        {/* Priority */}
        <div className="col-span-2 md:block w-auto order-2 md:order-none">
            <div className="text-sm text-text-secondary">
                <PriorityIcon priority={task.priority} />
            </div>
        </div>

        {/* Actions */}
        <div className="col-span-2 flex items-center justify-end ml-auto md:ml-0 order-2 md:order-none">
            {(canEdit || canDelete) && (
                <div className="flex items-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    {canEdit && (
                    <div className="relative" ref={moveMenuRef}>
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsMoveMenuOpen(p => !p); }}
                            className="p-2 text-text-secondary hover:text-primary rounded-full hover:bg-primary/10 transition-colors"
                            aria-label={t('tooltips.moveTask')}
                            title={t('tooltips.moveTask')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                        {isMoveMenuOpen && (
                            <div className="absolute right-0 bottom-full mb-2 w-56 bg-surface rounded-lg shadow-lg border border-border z-20 animate-fadeIn p-1">
                                <div className="px-2 py-1 text-xs text-text-secondary">{t('tooltips.moveTask')}</div>
                                <div className="max-h-48 overflow-y-auto">
                                    {allLists
                                        .filter(l => l.id !== task.listId)
                                        .map(list => (
                                            <button
                                                key={list.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMoveTask(list.id);
                                                }}
                                                className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-secondary-focus"
                                            >
                                                {list.name}
                                            </button>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                    )}
                    {canDelete && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                            className="p-2 text-text-secondary hover:text-red-400 rounded-full hover:bg-red-500/10 transition-colors"
                            aria-label={t('tooltips.deleteTask')}
                            title={t('tooltips.deleteTask')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TaskRow;