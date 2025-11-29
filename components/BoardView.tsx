
import React, { useMemo, useState } from 'react';
import { Task, Status, User, Role, Permission } from '../types';
import TaskCard from './TaskCard';
import { useAppContext } from '../contexts/AppContext';
import { useTranslation } from '../i18n';

const BoardView: React.FC = () => {
  const { state, actions, permissions } = useAppContext();
  const { filteredTasks: tasks, users, currentUser, allTasks, selectedListId } = state;
  const { handleUpdateTask, setSelectedTaskId, setTaskForBlockingModal, setIsBlockingTasksModalOpen, setEditingUserId, handleDeleteTask, handleAddTask } = actions;
  const { t } = useTranslation();

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<Status | null>(null);
  
  const canDrag = permissions.has(Permission.DRAG_AND_DROP);
  const canCreate = permissions.has(Permission.CREATE_TASKS);

  const STATUS_CONFIG = useMemo(() => ({
    [Status.Todo]: { 
        title: t('common.todo'), 
        color: 'bg-blue-500', 
        border: 'border-blue-500/20', 
        text: 'text-blue-400', 
        badge: 'bg-blue-500/10 text-blue-400' 
    },
    [Status.InProgress]: { 
        title: t('common.inprogress'), 
        color: 'bg-amber-500', 
        border: 'border-amber-500/20', 
        text: 'text-amber-400', 
        badge: 'bg-amber-500/10 text-amber-400' 
    },
    [Status.Done]: { 
        title: t('common.done'), 
        color: 'bg-emerald-500', 
        border: 'border-emerald-500/20', 
        text: 'text-emerald-400', 
        badge: 'bg-emerald-500/10 text-emerald-400' 
    },
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

  const onQuickAdd = () => {
      if (selectedListId) {
          handleAddTask(selectedListId);
      }
  };

  return (
    <div className="h-full overflow-x-auto overflow-y-hidden w-full snap-x snap-mandatory">
        {/* Container restricted to max-w for better visuals on ultra-wide screens */}
        <div className="flex flex-nowrap md:grid md:grid-cols-3 gap-6 h-full min-w-full md:max-w-[1600px] md:mx-auto px-4 pb-4">
        {columns.map(({ status, tasks: columnTasks }) => (
            <div
            key={status}
            className={`
                flex-shrink-0 w-[85vw] md:w-auto h-full snap-center
                rounded-2xl flex flex-col transition-all duration-300 
                bg-[#1e293b]/40 border border-white/5 backdrop-blur-sm
                ${dragOverStatus === status ? 'bg-[#1e293b]/80 ring-2 ring-primary/30 scale-[1.01]' : 'hover:border-white/10'}
            `}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
            >
            {/* Column Header */}
            <div className={`p-4 border-b border-white/5 sticky top-0 z-10 rounded-t-2xl flex items-center justify-between bg-[#1e293b]/80 backdrop-blur-xl shadow-sm`}>
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${STATUS_CONFIG[status].color} shadow-[0_0_10px_currentColor]`}></div>
                    <h3 className={`font-bold tracking-wide text-sm uppercase ${STATUS_CONFIG[status].text}`}>{STATUS_CONFIG[status].title}</h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold rounded-md px-2 py-0.5 border border-white/5 ${STATUS_CONFIG[status].badge}`}>
                        {columnTasks.length}
                    </span>
                    {/* Quick Add Button for Todo Column */}
                    {status === Status.Todo && canCreate && (
                        <button 
                            onClick={onQuickAdd}
                            className="p-1 rounded-md hover:bg-white/10 text-text-secondary hover:text-white transition-colors"
                            title={t('mainContent.createTaskTooltip')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
            
            {/* Column Content */}
            <div className="p-3 space-y-3 flex-grow overflow-y-auto min-h-0 custom-scrollbar scroll-smooth">
                {columnTasks.length > 0 ? (
                    columnTasks.map((task, index) => (
                        <div key={task.id} style={{ animationDelay: `${Math.min(index * 50, 300)}ms`}} className="animate-fadeIn">
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
                    <div className="flex flex-col items-center justify-center h-32 md:h-48 opacity-40 border-2 border-dashed border-white/5 rounded-xl m-2 bg-white/[0.01]">
                        <p className="text-sm font-medium text-text-secondary">{t('board.dropMessage') || 'Arrastra tareas aquí'}</p>
                    </div>
                )}
            </div>
            </div>
        ))}
        </div>
    </div>
  );
};

export default BoardView;
