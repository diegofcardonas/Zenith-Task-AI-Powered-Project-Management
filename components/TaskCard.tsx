import React from 'react';
import { Task, User, Priority, Status } from '../types';
import AvatarWithStatus from './AvatarWithStatus';
import { useTranslation } from '../i18n';

interface TaskCardProps {
  task: Task;
  user?: User;
  onSelectTask: () => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  isDraggable: boolean;
  allTasks: Task[];
  onOpenBlockingTasks: () => void;
  onOpenUserProfile: (user: User) => void;
}

const PriorityIndicator: React.FC<{ priority: Priority }> = ({ priority }) => {
    const { t } = useTranslation();
    const priorityConfig = {
        [Priority.High]: { color: 'bg-priority-high', label: t('common.high') },
        [Priority.Medium]: { color: 'bg-priority-medium', label: t('common.medium') },
        [Priority.Low]: { color: 'bg-priority-low', label: t('common.low') },
    };
    const { color, label } = priorityConfig[priority];
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${color} text-white`}>{label}</span>;
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
      <div className="flex items-center gap-1 text-amber-500" title={t('tooltips.blocked')}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }

  if (blockingTasks.length > 0) {
    const taskTitles = blockingTasks.map(t => t.title).join(', ');
    return (
      <button onClick={(e) => { e.stopPropagation(); onBlockingClick(); }} className="flex items-center gap-1 hover:text-primary transition-colors" title={t('tooltips.isBlocking', { tasks: taskTitles })}>
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

const TaskCard: React.FC<TaskCardProps> = ({ task, user, onSelectTask, onDragStart, isDraggable, allTasks, onOpenBlockingTasks, onOpenUserProfile }) => {
  const { i18n, t } = useTranslation();
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== Status.Done;
  
  return (
    <div
      draggable={isDraggable}
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onSelectTask()}
      className={`bg-secondary rounded-lg p-4 shadow-md border border-border transition-all duration-200 transform hover:scale-[1.02] hover:border-primary hover:bg-secondary-focus ${isDraggable ? 'cursor-grab' : 'cursor-pointer'}`}
      aria-label={t('tooltips.openTask', { title: task.title })}
    >
      <h4 className="font-semibold text-text-primary mb-2">{task.title}</h4>
      
      <div className="flex flex-wrap items-center text-xs text-text-secondary mt-3 gap-x-4 gap-y-1">
        <DependencyIndicator task={task} allTasks={allTasks} onBlockingClick={onOpenBlockingTasks} />
        <div className={`flex items-center gap-1 ${isOverdue ? 'text-priority-high font-semibold' : ''}`} title={t('tooltips.dueDate', { date: new Date(task.dueDate).toLocaleDateString() })}>
           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
           </svg>
           <span>{new Date(task.dueDate).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })}</span>
        </div>
        {task.createdAt && (
            <div className="flex items-center gap-1" title={t('tooltips.createdAt', { date: new Date(task.createdAt).toLocaleDateString() })}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span>{new Date(task.createdAt).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })}</span>
            </div>
        )}
        {task.subtasks.length > 0 && (
            <div className="flex items-center gap-1" title={t('tooltips.subtasks')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2-2H6a2 2 0 01-2-2V5zm3 .5a.5.5 0 00-1 0v1a.5.5 0 001 0v-1zM7 8a.5.5 0 01.5.5v1a.5.5 0 11-1 0v-1A.5.5 0 017 8zm0 4a.5.5 0 01.5.5v1a.5.5 0 11-1 0v-1A.5.5 0 017 12zm2-4a.5.5 0 00-1 0v1a.5.5 0 001 0v-1zm0 4a.5.5 0 00-1 0v1a.5.5 0 001 0v-1zm2-4a.5.5 0 00-1 0v1a.5.5 0 001 0v-1zm0 4a.5.5 0 00-1 0v1a.5.5 0 001 0v-1z" clipRule="evenodd" />
                </svg>
                <span>{task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}</span>
            </div>
        )}
      </div>
      
      <div className="flex items-center justify-between text-sm text-text-secondary mt-4">
        <PriorityIndicator priority={task.priority} />
        {user ? (
          <button 
            onClick={(e) => { e.stopPropagation(); onOpenUserProfile(user); }} 
            className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-secondary focus:ring-primary"
            title={t('tooltips.viewProfile', { name: user.name })}
          >
            <AvatarWithStatus user={user} className="w-8 h-8" />
          </button>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold" title={t('tooltips.unassigned')}>
            ?
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;