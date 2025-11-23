
import React, { useMemo, useState } from 'react';
import { Task, Status, User, Role, Permission } from '../types';
import TaskCard from './TaskCard';
import { useAppContext } from '../contexts/AppContext';
import { useTranslation } from '../i18n';

const BoardView: React.FC = () => {
  const { state, actions, permissions } = useAppContext();
  const { filteredTasks: tasks, users, currentUser, allTasks } = state;
  const { handleUpdateTask, setSelectedTaskId, setTaskForBlockingModal, setIsBlockingTasksModalOpen, setEditingUserId, handleDeleteTask } = actions;
  const { t } = useTranslation();

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<Status | null>(null);
  
  const canDrag = permissions.has(Permission.DRAG_AND_DROP);

  const STATUS_CONFIG = useMemo(() => ({
    [Status.Todo]: { title: t('board.todo'), color: 'bg-blue-500', border: 'border-blue-500/20' },
    [Status.InProgress]: { title: t('board.inprogress'), color: 'bg-amber-500', border: 'border-amber-500/20' },
    [Status.Done]: { title: t('board.done'), color: 'bg-emerald-500', border: 'border-emerald-500/20' },
  }), [t]);

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
      handleUpdateTask({ ...taskToMove, status: targetStatus });
    }
    
    setDraggedTaskId(null);
    setDragOverStatus(null);
  };

  return (
    <div className="flex flex-nowrap overflow-x-auto md:grid md:grid-cols-3 gap-6 h-full snap-x snap-mandatory pb-4 md:pb-0 px-2">
      {columns.map(({ status, tasks: columnTasks }) => (
        <div
          key={status}
          className={`
            flex-shrink-0 w-[85vw] md:w-auto snap-center h-full
            rounded-2xl flex flex-col transition-colors duration-200 
            bg-secondary/10 border border-white/5
            ${dragOverStatus === status ? 'bg-secondary/30 ring-2 ring-primary/30' : ''}
          `}
          onDragOver={(e) => handleDragOver(e, status)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, status)}
        >
          <div className={`p-4 border-b border-white/5 sticky top-0 z-10 rounded-t-2xl backdrop-blur-md bg-background/50 flex items-center justify-between`}>
             <div className="flex items-center gap-3">
                 <div className={`w-3 h-3 rounded-full ${STATUS_CONFIG[status].color} shadow-lg shadow-${STATUS_CONFIG[status].color}/50`}></div>
                 <h3 className="font-bold text-text-primary tracking-wide text-sm uppercase">{STATUS_CONFIG[status].title}</h3>
             </div>
             <span className="text-xs font-bold bg-surface text-text-secondary rounded-lg px-2.5 py-1 border border-white/5 shadow-sm">{columnTasks.length}</span>
          </div>
          
          <div className="p-4 space-y-4 flex-grow overflow-y-auto min-h-0 custom-scrollbar">
            {columnTasks.length > 0 ? (
                columnTasks.map((task, index) => (
                    <div key={task.id} style={{ animationDelay: `${index * 50}ms`}} className="animate-fadeIn">
                        <TaskCard
                            task={task}
                            user={users.find(u => u.id === task.assigneeId)}
                            onSelectTask={() => setSelectedTaskId(task.id)}
                            onDragStart={handleDragStart}
                            allTasks={allTasks}
                            onOpenBlockingTasks={() => { setTaskForBlockingModal(task); setIsBlockingTasksModalOpen(true); }}
                            onOpenUserProfile={(user) => setEditingUserId(user.id)}
                            onDeleteTask={handleDeleteTask}
                        />
                    </div>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center h-32 md:h-48 opacity-40 border-2 border-dashed border-white/5 rounded-xl m-2">
                    <p className="text-sm font-medium text-text-secondary">{t('board.dropMessage')}</p>
                </div>
            )}
          </div>
        </div>
      ))}
      {/* Spacer for mobile scroll */}
      <div className="w-4 flex-shrink-0 md:hidden"></div>
    </div>
  );
};

export default BoardView;
