
import React from 'react';
import { Task, Status, Priority, Permission } from '../types';
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

const PriorityIcon: React.FC<{ priority: Priority }> = ({ priority }) => {
    const { t } = useTranslation();
    
    const config = {
        [Priority.High]: { icon: (
            <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
        ), label: 'High' },
        [Priority.Medium]: { icon: (
            <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16" />
            </svg>
        ), label: 'Medium' },
        [Priority.Low]: { icon: (
            <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
        ), label: 'Low' },
    };

    return (
        <div className="flex items-center gap-2" title={t(`common.${priority.toLowerCase()}`)}>
            {config[priority].icon}
            <span className="text-xs text-text-secondary font-medium">{t(`common.${priority.toLowerCase()}`)}</span>
        </div>
    );
};

const StatusDot: React.FC<{ status: Status; onClick?: (e: React.MouseEvent) => void; editable: boolean }> = ({ status, onClick, editable }) => {
     const { t } = useTranslation();
     
     const dotColor = {
         [Status.Todo]: 'bg-blue-500',
         [Status.InProgress]: 'bg-amber-500',
         [Status.Done]: 'bg-emerald-500',
     };

     return (
         <div 
            onClick={editable ? onClick : undefined}
            title={editable ? t('tooltips.changeStatus') : ''}
            className={`flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-[10px] font-medium uppercase tracking-wide w-fit max-w-full ${editable ? 'cursor-pointer' : ''}`}
         >
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
  const { handleUpdateTask, handleDeleteTask, setSelectedTaskId, setTaskForBlockingModal, setIsBlockingTasksModalOpen } = actions;
  const { t, i18n } = useTranslation();
    
  const canEdit = permissions.has(Permission.EDIT_TASKS);
  const canDelete = permissions.has(Permission.DELETE_TASKS);
  const isDraggable = permissions.has(Permission.DRAG_AND_DROP);

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== Status.Done;
  const assignee = users.find(u => u.id === task.assigneeId);
  const isDependent = task.dependsOn && task.dependsOn.length > 0;
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
      onDragEnter={(e) => onDragEnter(e, task.id)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => setSelectedTaskId(task.id)}
      className={`
        group relative grid grid-cols-1 md:grid-cols-[40px_1fr_150px_120px_100px_150px_80px] gap-4 px-4 py-3
        border-b border-white/5 transition-all duration-200 animate-fadeIn 
        hover:bg-white/[0.02] items-center cursor-pointer
        ${isDraggable ? 'active:cursor-grabbing' : ''} 
        ${isSelected ? 'bg-primary/5' : ''}
        ${task.status === Status.Done ? 'opacity-50' : 'opacity-100'}
      `}
    >
        {/* Drag Handle (Hidden but implied area) */}
        {isDraggable && <div className="absolute left-0 top-0 bottom-0 w-1 group-hover:bg-white/10 transition-colors"></div>}

        {/* Column 1: Checkbox */}
        <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <div className="relative flex items-center">
                <input 
                    type="checkbox"
                    className="peer w-4 h-4 rounded bg-transparent border-white/20 checked:bg-primary checked:border-primary focus:ring-0 focus:ring-offset-0 cursor-pointer transition-all appearance-none border"
                    checked={isSelected}
                    onChange={() => onToggleSelection(task.id)}
                    disabled={!canEdit}
                />
                <svg className="pointer-events-none absolute top-0.5 left-0.5 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            </div>
        </div>

        {/* Column 2: Title & Project Badge */}
        <div className="flex flex-col justify-center min-w-0 pr-4">
            <div className="flex items-center gap-2">
                {isDependent && (
                    <div className="text-amber-500 flex-shrink-0" title={t('modals.dependsOn')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
                <span className={`font-medium text-sm truncate ${task.status === Status.Done ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                    {task.title}
                </span>
            </div>
            {!selectedListId && projectList && (
                <span className={`text-[10px] mt-1 inline-block w-fit px-1.5 py-0.5 rounded opacity-70 ${projectList.color.replace('bg-', 'text-').replace('500', '400')}`}>
                    {projectList.name}
                </span>
            )}
        </div>

        {/* Column 3: Assignee (Desktop) */}
        <div className="hidden md:flex items-center">
            {assignee ? (
                 <div className="flex items-center gap-2" title={assignee.name}>
                     <AvatarWithStatus user={assignee} className="w-6 h-6" />
                     <span className="text-xs text-text-secondary truncate max-w-[120px]">{assignee.name.split(' ')[0]}</span>
                 </div>
            ) : (
                 <div className="text-xs text-text-secondary/50 flex items-center gap-1.5">
                     <div className="w-6 h-6 rounded-full border border-dashed border-white/20 flex items-center justify-center">?</div>
                 </div>
            )}
        </div>

        {/* Column 4: Date */}
        <div className="hidden md:flex items-center text-xs">
             <div className={`flex items-center gap-2 ${isOverdue ? 'text-red-400 font-semibold' : 'text-text-secondary'}`}>
                 <span>{new Date(task.dueDate).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })}</span>
             </div>
        </div>

        {/* Column 5: Priority */}
        <div className="hidden md:flex items-center">
            <PriorityIcon priority={task.priority} />
        </div>

        {/* Column 6: Status */}
        <div className="hidden md:flex items-center">
             <StatusDot status={task.status} onClick={handleStatusClick} editable={canEdit} />
        </div>

        {/* Column 7: Actions */}
        <div className="hidden md:flex items-center justify-end gap-1">
             {canEdit && (
                 <button 
                     onClick={(e) => { e.stopPropagation(); setSelectedTaskId(task.id); }}
                     className="p-1.5 text-text-secondary hover:text-primary hover:bg-white/10 rounded-md transition-colors"
                     title={t('tooltips.editTask')}
                 >
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                 </button>
             )}
             {canDelete && (
                 <button 
                     onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                     className="p-1.5 text-text-secondary hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                     title={t('tooltips.deleteTask')}
                 >
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                 </button>
             )}
        </div>

        {/* Mobile Layout Fallback (Simplified Row) */}
        <div className="md:hidden col-span-1 mt-2 flex items-center justify-between text-xs text-text-secondary border-t border-white/5 pt-2">
             <div className="flex items-center gap-3">
                 <span className={`${isOverdue ? 'text-red-400' : ''}`}>{new Date(task.dueDate).toLocaleDateString()}</span>
                 {assignee && <AvatarWithStatus user={assignee} className="w-4 h-4" />}
             </div>
             <StatusDot status={task.status} onClick={handleStatusClick} editable={canEdit} />
        </div>
    </div>
  );
};

export default TaskRow;
