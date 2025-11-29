
import React from 'react';
import { Task, Status, Priority, Permission, TaskType } from '../types';
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

const TypeIcon: React.FC<{ type: TaskType }> = ({ type }) => {
    const iconClasses = "w-4 h-4 flex-shrink-0";
    switch (type) {
        case TaskType.Bug:
            return <div className="bg-red-500 p-0.5 rounded-sm" title="Bug"><svg className={`${iconClasses} text-white`} fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg></div>;
        case TaskType.Story:
            return <div className="bg-green-500 p-0.5 rounded-sm" title="Story"><svg className={`${iconClasses} text-white`} fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" /></svg></div>;
        case TaskType.Epic:
            return <div className="bg-purple-500 p-0.5 rounded-sm" title="Epic"><svg className={`${iconClasses} text-white`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg></div>;
        default: // Task
            return <div className="bg-blue-500 p-0.5 rounded-sm" title="Task"><svg className={`${iconClasses} text-white`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div>;
    }
};

const PriorityIcon: React.FC<{ priority: Priority }> = ({ priority }) => {
    switch (priority) {
        case Priority.High:
            return <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>;
        case Priority.Low:
            return <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>;
        default:
            return <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16" /></svg>;
    }
};

const StatusDot: React.FC<{ status: Status; onClick?: (e: React.MouseEvent) => void; editable: boolean }> = ({ status, onClick, editable }) => {
     const { t } = useTranslation();
     const dotColor = {
         [Status.Todo]: 'bg-blue-500',
         [Status.InProgress]: 'bg-amber-500',
         [Status.Done]: 'bg-emerald-500',
     };
     return (
         <div onClick={editable ? onClick : undefined} className={`flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-[10px] font-medium uppercase tracking-wide w-fit max-w-full ${editable ? 'cursor-pointer' : ''}`} title={editable ? t('tooltips.changeStatus') : ''}>
             <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor[status]}`}></div>
             <span className="text-text-secondary truncate">{t(`common.${status.replace(/\s+/g, '').toLowerCase()}`)}</span>
         </div>
     )
}

const TaskRow: React.FC<TaskRowProps> = ({ 
    task, 
    isSelected = false, 
    onToggleSelection = (_taskId) => {}, 
    onDragStart = (_e, _taskId) => {}, 
    onDragEnter = (_e, _taskId) => {}, 
    onDragEnd = () => {} 
}) => {
  const { state, actions, permissions } = useAppContext();
  const { users, lists, selectedListId } = state;
  const { handleUpdateTask, handleDeleteTask, setSelectedTaskId } = actions;
  const { t, i18n } = useTranslation();
    
  const canEdit = permissions.has(Permission.EDIT_TASKS);
  const canDelete = permissions.has(Permission.DELETE_TASKS);
  const isDraggable = permissions.has(Permission.DRAG_AND_DROP);

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== Status.Done;
  const assignee = users.find(u => u.id === task.assigneeId);
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
      onDragEnter={(e) => onDragEnter(e, task.id)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => setSelectedTaskId(task.id)}
      className={`
        group relative 
        flex flex-col md:grid md:grid-cols-[40px_90px_1fr_150px_120px_80px_150px_80px] 
        gap-2 md:gap-4 p-4 md:px-6 md:py-4
        rounded-xl border border-white/5 transition-all duration-200 
        md:items-center cursor-pointer 
        ${isSelected ? 'bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.1)]' : 'bg-surface hover:bg-white/[0.04] hover:border-white/10 hover:shadow-lg hover:-translate-y-0.5'}
        ${task.status === Status.Done ? 'opacity-60 grayscale-[0.5]' : 'opacity-100'}
        ${isDraggable ? 'active:cursor-grabbing' : ''}
      `}
    >
        {isDraggable && <div className="hidden md:block absolute left-0 top-0 bottom-0 w-1 group-hover:bg-white/10 transition-colors rounded-l-xl"></div>}

        {/* --- Mobile Header Row: Checkbox + Key + Actions --- */}
        <div className="flex md:hidden justify-between items-center w-full mb-2">
            <div className="flex items-center gap-3">
                <input type="checkbox" className="w-5 h-5 rounded bg-transparent border-white/20 checked:bg-primary checked:border-primary cursor-pointer appearance-none border" checked={isSelected} onChange={() => onToggleSelection(task.id)} disabled={!canEdit} onClick={(e) => e.stopPropagation()} />
                <div className="flex items-center gap-2">
                    <TypeIcon type={task.type || TaskType.Task} />
                    <span className="text-xs font-mono text-text-secondary">{task.issueKey}</span>
                </div>
            </div>
            {/* Mobile Actions */}
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {canEdit && <button onClick={() => setSelectedTaskId(task.id)} className="p-1.5 text-text-secondary hover:text-primary"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>}
                {canDelete && <button onClick={() => handleDeleteTask(task.id)} className="p-1.5 text-text-secondary hover:text-red-400"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>}
            </div>
        </div>

        {/* Checkbox (Desktop) */}
        <div className="hidden md:flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <input type="checkbox" className="peer w-4 h-4 rounded bg-transparent border-white/20 checked:bg-primary checked:border-primary cursor-pointer transition-all appearance-none border" checked={isSelected} onChange={() => onToggleSelection(task.id)} disabled={!canEdit} />
        </div>

        {/* Type & Key (Desktop) */}
        <div className="hidden md:flex items-center gap-2.5 min-w-0">
            <TypeIcon type={task.type || TaskType.Task} />
            <span className="text-xs font-mono text-text-secondary group-hover:text-primary transition-colors truncate">{task.issueKey}</span>
        </div>

        {/* Title & Project (Shared) */}
        <div className="flex flex-col justify-center min-w-0 pr-0 md:pr-4 w-full">
            <div className="flex items-center gap-2 min-w-0">
                <span className={`font-medium text-base md:text-sm truncate ${task.status === Status.Done ? 'text-text-secondary line-through' : 'text-text-primary'}`}>{task.title}</span>
                {task.storyPoints !== undefined && task.storyPoints > 0 && (
                    <span className="bg-secondary text-[9px] font-mono px-1.5 py-0.5 rounded text-text-secondary border border-white/5 flex-shrink-0">{task.storyPoints}</span>
                )}
                {task.approvalStatus === 'pending' && (
                    <span className="flex-shrink-0 flex items-center gap-1 bg-amber-500/20 text-amber-500 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-500/20 uppercase tracking-wider">
                        Review
                    </span>
                )}
            </div>
            {/* Mobile Metadata Row underneath Title */}
            <div className="flex md:hidden items-center gap-3 mt-2 text-xs text-text-secondary">
                 {!selectedListId && projectList && <span className={`text-[10px] px-1.5 py-0.5 rounded opacity-70 ${projectList.color.replace('bg-', 'text-').replace('500', '400')} bg-white/5 border border-white/10 truncate max-w-[100px]`}>{projectList.name}</span>}
                 {isOverdue && <span className="text-red-400 font-semibold">{new Date(task.dueDate).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })}</span>}
            </div>
            {/* Desktop Project Badge */}
            <div className="hidden md:block">
                {!selectedListId && projectList && <span className={`text-[10px] mt-1.5 inline-block w-fit px-1.5 py-0.5 rounded opacity-70 ${projectList.color.replace('bg-', 'text-').replace('500', '400')} bg-white/5 border border-white/10 truncate max-w-full`}>{projectList.name}</span>}
            </div>
        </div>

        {/* Mobile Footer: Assignee, Priority, Status */}
        <div className="flex md:hidden items-center justify-between mt-2 pt-2 border-t border-white/5">
             <div className="flex items-center gap-3">
                {assignee ? <AvatarWithStatus user={assignee} className="w-6 h-6 ring-1 ring-white/10" /> : <div className="w-6 h-6 rounded-full border border-dashed border-white/20 flex items-center justify-center text-[10px]">?</div>}
                <PriorityIcon priority={task.priority} />
             </div>
             <StatusDot status={task.status} onClick={handleStatusClick} editable={canEdit} />
        </div>

        {/* --- Desktop Columns --- */}

        {/* Assignee */}
        <div className="hidden md:flex items-center min-w-0">
            {assignee ? <div className="flex items-center gap-2.5 min-w-0" title={assignee.name}><AvatarWithStatus user={assignee} className="w-6 h-6 ring-2 ring-surface flex-shrink-0" /><span className="text-xs text-text-secondary truncate">{assignee.name.split(' ')[0]}</span></div> : <div className="text-xs text-text-secondary/50 flex items-center gap-1.5"><div className="w-6 h-6 rounded-full border border-dashed border-white/20 flex items-center justify-center">?</div></div>}
        </div>

        {/* Date */}
        <div className="hidden md:flex items-center text-xs min-w-0">
             <div className={`flex items-center gap-2 truncate ${isOverdue ? 'text-red-400 font-semibold' : 'text-text-secondary'}`}><span>{new Date(task.dueDate).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })}</span></div>
        </div>

        {/* Priority */}
        <div className="hidden md:flex items-center justify-center min-w-0">
            <PriorityIcon priority={task.priority} />
        </div>

        {/* Status */}
        <div className="hidden md:flex items-center min-w-0">
             <StatusDot status={task.status} onClick={handleStatusClick} editable={canEdit} />
        </div>

        {/* Actions (Desktop) - Always visible */}
        <div className="hidden md:flex items-center justify-end gap-1">
             {canEdit && <button onClick={(e) => { e.stopPropagation(); setSelectedTaskId(task.id); }} className="p-1.5 text-text-secondary hover:text-primary hover:bg-white/10 rounded-md transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>}
             {canDelete && <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }} className="p-1.5 text-text-secondary hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>}
        </div>
    </div>
  );
};

export default React.memo(TaskRow);
