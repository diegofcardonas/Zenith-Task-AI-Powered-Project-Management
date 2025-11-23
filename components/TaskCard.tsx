
import React from 'react';
import { Task, User, Priority, Status, Permission } from '../types';
import AvatarWithStatus from './AvatarWithStatus';
import { useTranslation } from '../i18n';
import { useAppContext } from '../contexts/AppContext';

interface TaskCardProps {
  task: Task;
  user?: User;
  onSelectTask: () => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  allTasks: Task[];
  onOpenBlockingTasks: () => void;
  onOpenUserProfile: (user: User) => void;
  onDeleteTask: (taskId: string) => void;
}

const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
    const { t } = useTranslation();
    const priorityConfig = {
        [Priority.High]: 'bg-red-500/10 text-red-500 border-red-500/20',
        [Priority.Medium]: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        [Priority.Low]: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    };
    
    return (
        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${priorityConfig[priority]} uppercase tracking-wide`}>
            {t(`common.${priority.toLowerCase()}`)}
        </span>
    );
};

const StatusBadge: React.FC<{ status: Status; onClick: (e: React.MouseEvent) => void; editable: boolean }> = ({ status, onClick, editable }) => {
    const { t } = useTranslation();
    const statusConfig = {
        [Status.Todo]: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        [Status.InProgress]: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        [Status.Done]: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    };

    return (
        <button 
            onClick={onClick}
            disabled={!editable}
            className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${statusConfig[status]} uppercase tracking-wide transition-all ${editable ? 'hover:bg-white/10 cursor-pointer' : 'cursor-default'}`}
            title={editable ? t('tooltips.changeStatus') : ''}
        >
            {t(`common.${status.replace(/\s+/g, '').toLowerCase()}`)}
        </button>
    );
};

const DependencyIndicator: React.FC<{ task: Task; allTasks: Task[]; onBlockingClick: () => void }> = ({ task, allTasks, onBlockingClick }) => {
  const { t } = useTranslation();
  const isBlocked = (task.dependsOn || []).some(depId => {
    const depTask = allTasks.find(t => t.id === depId);
    return depTask && depTask.status !== Status.Done;
  });

  const blockingTasks = allTasks.filter(t => t.dependsOn?.includes(task.id));

  if (isBlocked) {
    return (
      <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md text-xs border border-amber-500/20" title={t('tooltips.blocked')}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
        </svg>
        <span className="hidden group-hover:inline text-[10px] font-medium">Blocked</span>
      </div>
    );
  }

  if (blockingTasks.length > 0) {
    const taskTitles = blockingTasks.map(t => t.title).join(', ');
    return (
      <button onClick={(e) => { e.stopPropagation(); onBlockingClick(); }} className="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors text-xs bg-surface border border-border px-2 py-0.5 rounded hover:border-primary/50" title={t('tooltips.isBlocking', { tasks: taskTitles })}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 9a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
          <path d="M15.5 6.5a1 1 0 00-1-1h-1.382l-.447-1.342A2 2 0 0011.025 3H8.975a2 2 0 00-1.646 1.158L6.882 5.5H5.5a1 1 0 000 2h1.082l.858 5.146A2 2 0 009.423 14h1.154a2 2 0 001.983-1.854l.858-5.146H14.5a1 1 0 001-1z" />
        </svg>
        <span className="font-medium">{blockingTasks.length}</span>
      </button>
    );
  }

  return null;
};

const TaskCard: React.FC<TaskCardProps> = ({ task, user, onSelectTask, onDragStart, allTasks, onOpenBlockingTasks, onOpenUserProfile, onDeleteTask }) => {
  const { i18n, t } = useTranslation();
  const { permissions, state, actions } = useAppContext();
  const { lists, selectedListId } = state;
  const { handleUpdateTask } = actions;

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== Status.Done;
  
  const isDraggable = permissions.has(Permission.DRAG_AND_DROP);
  const canDelete = permissions.has(Permission.DELETE_TASKS);
  const canEdit = permissions.has(Permission.EDIT_TASKS);

  const projectList = lists.find(l => l.id === task.listId);

  const handleStatusClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!canEdit) return;
      const nextStatus = {
          [Status.Todo]: Status.InProgress,
          [Status.InProgress]: Status.Done,
          [Status.Done]: Status.Todo
      };
      handleUpdateTask({ ...task, status: nextStatus[task.status] });
  };

  return (
    <div
      draggable={isDraggable}
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onSelectTask()}
      className={`
        bg-surface rounded-xl p-4 shadow-sm border border-white/5
        transition-all duration-300 transform 
        hover:-translate-y-1 hover:shadow-card hover:border-white/10 hover:ring-1 hover:ring-white/10
        relative group w-full flex flex-col gap-2
        ${isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
      `}
      aria-label={t('tooltips.openTask', { title: task.title })}
    >
        {canDelete && (
            <button 
                onClick={(e) => { 
                    e.stopPropagation();
                    onDeleteTask(task.id);
                }}
                className="absolute top-3 right-3 p-1.5 bg-[#1e293b] text-text-secondary rounded-lg opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 border border-white/10 z-10"
                title={t('tooltips.deleteTask')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
            </button>
        )}
        
        <div className="flex justify-between items-center mb-1">
             <StatusBadge status={task.status} onClick={handleStatusClick} editable={canEdit} />
             <div className="flex gap-2">
                <PriorityBadge priority={task.priority} />
                {!selectedListId && projectList && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${projectList.color.replace('bg-', 'text-').replace('500', '400')} bg-white/5`}>
                        {projectList.name}
                    </span>
                )}
             </div>
        </div>

      <h4 className="font-semibold text-text-primary mb-1 text-sm leading-relaxed line-clamp-2 group-hover:text-primary transition-colors">{task.title}</h4>
      
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
          <div className="flex items-center gap-3">
                {user ? (
                <button 
                    onClick={(e) => { e.stopPropagation(); onOpenUserProfile(user); }} 
                    className="rounded-full focus:outline-none ring-2 ring-transparent hover:ring-primary/50 transition-all"
                    title={t('tooltips.viewProfile', { name: user.name })}
                >
                    <AvatarWithStatus user={user} className="w-6 h-6" />
                </button>
                ) : (
                <div className="w-6 h-6 rounded-full bg-secondary border border-dashed border-text-secondary/50 flex items-center justify-center text-[10px] font-bold text-text-secondary" title={t('tooltips.unassigned')}>
                    ?
                </div>
                )}
                <DependencyIndicator task={task} allTasks={allTasks} onBlockingClick={onOpenBlockingTasks} />
          </div>

          <div className={`flex items-center gap-1.5 text-xs ${isOverdue ? 'text-red-400 font-semibold bg-red-400/10 px-2 py-0.5 rounded' : 'text-text-secondary'}`} title={t('tooltips.dueDate', { date: new Date(task.dueDate).toLocaleDateString() })}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>{new Date(task.dueDate).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })}</span>
          </div>
      </div>
      
      {/* Footer Metadata */}
      {(task.subtasks.length > 0 || task.comments.length > 0) && (
        <div className="flex items-center gap-4 mt-1 text-[11px] text-text-secondary/70 font-medium">
            {task.subtasks.length > 0 && (
                 <div className="flex items-center gap-1.5" title={t('tooltips.subtasks')}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}</span>
                 </div>
            )}
            {task.comments.length > 0 && (
                <div className="flex items-center gap-1.5" title={t('modals.comments')}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                    </svg>
                    <span>{task.comments.length}</span>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
