
import React, { useState } from 'react';
import { Task, User, Priority, Status, Permission, TaskType } from '../types';
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

const TypeIcon: React.FC<{ type: TaskType }> = ({ type }) => {
    const iconClasses = "w-3.5 h-3.5 flex-shrink-0";
    switch (type) {
        case TaskType.Bug:
            return <div className="bg-red-500 p-0.5 rounded-sm"><svg className={`${iconClasses} text-white`} fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg></div>;
        case TaskType.Story:
            return <div className="bg-green-500 p-0.5 rounded-sm"><svg className={`${iconClasses} text-white`} fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" /></svg></div>;
        case TaskType.Epic:
            return <div className="bg-purple-500 p-0.5 rounded-sm"><svg className={`${iconClasses} text-white`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg></div>;
        default: // Task
            return <div className="bg-blue-500 p-0.5 rounded-sm"><svg className={`${iconClasses} text-white`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div>;
    }
};

const PriorityIcon: React.FC<{ priority: Priority }> = ({ priority }) => {
    switch (priority) {
        case Priority.High:
            return <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>; 
        case Priority.Low:
            return <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>; 
        default:
            return <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16" /></svg>; 
    }
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
      const nextStatus = { [Status.Todo]: Status.InProgress, [Status.InProgress]: Status.Done, [Status.Done]: Status.Todo };
      handleUpdateTask({ ...task, status: nextStatus[task.status] });
  };

  return (
    <div
      draggable={isDraggable}
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onSelectTask()}
      className={`
        bg-surface rounded-xl p-5 shadow-card border border-white/5 hover:border-primary/30
        transition-all duration-200 cursor-pointer group w-full flex flex-col gap-3
        ${isDraggable ? 'active:cursor-grabbing' : ''}
        hover:-translate-y-1 hover:shadow-card-hover
      `}
    >
        {/* Header: Type + Key + Actions */}
        <div className="flex justify-between items-start">
             <div className="flex items-center gap-2.5">
                 <TypeIcon type={task.type || TaskType.Task} />
                 <span className="text-xs font-mono text-text-secondary hover:text-primary transition-colors">{task.issueKey}</span>
             </div>
             <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={handleStatusClick}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors
                    ${task.status === Status.Todo ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20' : ''}
                    ${task.status === Status.InProgress ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20' : ''}
                    ${task.status === Status.Done ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20' : ''}`}
                >
                    {t(`common.${task.status.replace(/\s+/g, '').toLowerCase()}`)}
                </button>
                {canDelete && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
                        className="text-text-secondary hover:text-red-400 p-0.5 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                )}
             </div>
        </div>

      <h4 className={`text-sm font-medium text-text-primary leading-snug line-clamp-2 mb-1 group-hover:text-primary transition-colors ${task.status === Status.Done ? 'line-through opacity-60' : ''}`}>
          {task.title}
      </h4>
      
      {/* Footer: Priority, Avatar, Project Badge */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
          <div className="flex items-center gap-3">
                <PriorityIcon priority={task.priority} />
                {task.storyPoints !== undefined && task.storyPoints > 0 && (
                    <span className="bg-secondary text-[10px] font-bold text-text-secondary px-1.5 py-0.5 rounded-md border border-white/5">
                        {task.storyPoints}
                    </span>
                )}
                {/* Global View: Show Project Badge */}
                {!selectedListId && projectList && (
                    <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${projectList.color.replace('bg-', 'text-').replace('500', '400')} bg-white/5`}>
                        {projectList.key}
                    </span>
                )}
          </div>

          <div className="flex items-center gap-2">
             {isOverdue && (
                 <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold">
                     {new Date(task.dueDate).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short'})}
                 </span>
             )}
             {user ? (
                <button onClick={(e) => { e.stopPropagation(); onOpenUserProfile(user); }} className="transition-transform hover:scale-110">
                    <AvatarWithStatus user={user} className="w-6 h-6 ring-2 ring-surface" />
                </button>
             ) : (
                <div className="w-6 h-6 rounded-full bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-[9px] text-text-secondary">?</div>
             )}
          </div>
      </div>
    </div>
  );
};

export default React.memo(TaskCard);
