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
    [Status.Todo]: { title: t('board.todo'), color: 'bg-status-todo' },
    [Status.InProgress]: { title: t('board.inProgress'), color: 'bg-status-inprogress' },
    [Status.Done]: { title: t('board.done'), color: 'bg-status-done' },
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
    <div className="flex flex-nowrap overflow-x-auto md:grid md:grid-cols-3 gap-4 lg:gap-6 h-full snap-x snap-mandatory pb-4 md:pb-0">
      {columns.map(({ status, tasks: columnTasks }) => (
        <div
          key={status}
          className={`
            flex-shrink-0 w-[85vw] md:w-auto snap-center h-full
            bg-surface rounded-lg flex flex-col transition-colors duration-200 
            border border-border md:border-none
            ${dragOverStatus === status ? 'bg-secondary-focus' : ''}
          `}
          onDragOver={(e) => handleDragOver(e, status)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, status)}
        >
          <div className="p-4 border-b border-border sticky top-0 bg-surface rounded-t-lg z-10">
            <h3 className="font-semibold text-lg flex items-center justify-between md:justify-start">
              <div className="flex items-center">
                <span className={`w-3 h-3 rounded-full mr-3 ${STATUS_CONFIG[status].color}`}></span>
                {STATUS_CONFIG[status].title}
              </div>
              <span className="ml-2 text-sm bg-secondary-focus text-text-secondary rounded-full px-2 py-0.5">{columnTasks.length}</span>
            </h3>
          </div>
          <div className="p-2 sm:p-4 space-y-3 sm:space-y-4 flex-grow overflow-y-auto min-h-0">
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
                <div className="flex items-center justify-center h-32 md:h-full text-text-secondary text-sm italic p-4 text-center">
                    {t('board.dropMessage')}
                </div>
            )}
          </div>
        </div>
      ))}
      {/* Spacer for mobile scroll to show last column properly if needed */}
      <div className="w-4 flex-shrink-0 md:hidden"></div>
    </div>
  );
};

export default BoardView;