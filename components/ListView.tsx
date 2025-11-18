import React, { useState } from 'react';
import { Task, User, Role, Priority, Status, List, Permission } from '../types';
import TaskRow from './TaskRow';
import { useAppContext } from '../contexts/AppContext';
import { useTranslation } from '../i18n';

interface BulkActionBarProps {
    selectedCount: number;
    onClear: () => void;
    onUpdate: (updates: Partial<Task>) => void;
    onDelete: () => void;
    users: User[];
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({ selectedCount, onClear, onUpdate, onDelete, users }) => {
    const { t } = useTranslation();
    const selectionText = t('listView.selected', { count: selectedCount });
    
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 bg-secondary border-b border-border animate-fadeIn gap-2">
            <span className="font-semibold text-sm">{selectionText}</span>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                 <select 
                    onChange={(e) => onUpdate({ status: e.target.value as Status })}
                    defaultValue=""
                    className="bg-surface border border-border rounded-md px-2 py-1 text-xs focus:ring-primary focus:border-primary flex-grow sm:flex-grow-0"
                 >
                    <option value="" disabled>{t('listView.changeStatus')}</option>
                    {Object.values(Status).map(s => <option key={s} value={s}>{t(`common.${s.replace(/\s+/g, '').toLowerCase()}`)}</option>)}
                </select>
                 <select 
                    onChange={(e) => onUpdate({ priority: e.target.value as Priority })}
                    defaultValue=""
                    className="bg-surface border border-border rounded-md px-2 py-1 text-xs focus:ring-primary focus:border-primary flex-grow sm:flex-grow-0"
                 >
                    <option value="" disabled>{t('listView.changePriority')}</option>
                    {Object.values(Priority).map(p => <option key={p} value={p}>{t(`common.${p.toLowerCase()}`)}</option>)}
                </select>
                <select 
                    onChange={(e) => onUpdate({ assigneeId: e.target.value || null })}
                    defaultValue=""
                    className="bg-surface border border-border rounded-md px-2 py-1 text-xs focus:ring-primary focus:border-primary flex-grow sm:flex-grow-0"
                 >
                    <option value="" disabled>{t('listView.changeAssignee')}</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <div className="flex items-center gap-1 ml-auto sm:ml-0">
                    <button 
                        onClick={onDelete} 
                        className="p-2 text-xs font-semibold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        {t('common.delete')}
                    </button>
                    <button onClick={onClear} className="p-1 text-text-secondary hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

const ListView: React.FC = () => {
  const { state, actions, permissions } = useAppContext();
  const { filteredTasks: tasks, users, currentUser } = state;
  const { handleBulkUpdateTasks, handleTasksReorder: onTasksReorder, handleBulkDeleteTasks } = actions;
  const { t } = useTranslation();
  
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const dragItem = React.useRef<string | null>(null);
  const dragOverItem = React.useRef<string | null>(null);

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-surface rounded-lg">
        <p className="text-text-secondary italic">{t('listView.noTasks')}</p>
      </div>
    );
  }

  const isDraggable = permissions.has(Permission.DRAG_AND_DROP);
  const canEdit = permissions.has(Permission.EDIT_TASKS);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    dragItem.current = taskId;
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    dragOverItem.current = taskId;
  };

  const handleDragEnd = () => {
    if (dragItem.current && dragOverItem.current && dragItem.current !== dragOverItem.current) {
        let reorderedTasks = [...tasks];
        const dragItemIndex = reorderedTasks.findIndex(t => t.id === dragItem.current);
        const dragOverItemIndex = reorderedTasks.findIndex(t => t.id === dragOverItem.current);
        
        const [removed] = reorderedTasks.splice(dragItemIndex, 1);
        reorderedTasks.splice(dragOverItemIndex, 0, removed);
        
        onTasksReorder(reorderedTasks);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleToggleSelection = (taskId: string) => {
    setSelectedTaskIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(taskId)) {
            newSet.delete(taskId);
        } else {
            newSet.add(taskId);
        }
        return newSet;
    });
  };

  const handleToggleAll = () => {
      if (selectedTaskIds.size === tasks.length) {
          setSelectedTaskIds(new Set());
      } else {
          setSelectedTaskIds(new Set(tasks.map(t => t.id)));
      }
  };

  const handleBulkUpdate = (updates: Partial<Task>) => {
      handleBulkUpdateTasks(Array.from(selectedTaskIds), updates);
      setSelectedTaskIds(new Set());
  };

  const handleBulkDelete = () => {
    handleBulkDeleteTasks(Array.from(selectedTaskIds));
    setSelectedTaskIds(new Set());
  };

  return (
    <div className="bg-surface rounded-lg overflow-hidden h-full flex flex-col">
        {selectedTaskIds.size > 0 && canEdit && (
            <BulkActionBar 
                selectedCount={selectedTaskIds.size}
                onClear={() => setSelectedTaskIds(new Set())}
                onUpdate={handleBulkUpdate}
                onDelete={handleBulkDelete}
                users={users}
            />
        )}
        <div className="flex-shrink-0">
            {/* Header Row - Hidden on mobile, visible on tablet/desktop */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-border text-xs text-text-secondary uppercase font-semibold">
                <div className="col-span-1 flex items-center">
                    <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded text-primary bg-surface border-border focus:ring-primary disabled:opacity-50"
                        onChange={handleToggleAll}
                        checked={selectedTaskIds.size === tasks.length && tasks.length > 0}
                        disabled={!canEdit}
                    />
                </div>
                <div className="col-span-6 sm:col-span-3 md:col-span-2">{t('listView.task')}</div>
                <div className="col-span-2 hidden sm:block">{t('listView.assignee')}</div>
                <div className="col-span-3 sm:col-span-2">{t('listView.status')}</div>
                <div className="col-span-2 hidden sm:block md:col-span-1">{t('listView.dueDate')}</div>
                <div className="col-span-2 hidden md:block">{t('listView.priority')}</div>
                <div className="col-span-2 text-right">{t('listView.actions')}</div>
            </div>
             {/* Mobile "Select All" helper */}
             <div className="md:hidden p-3 border-b border-border flex items-center">
                <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase">
                     <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded text-primary bg-surface border-border focus:ring-primary disabled:opacity-50"
                        onChange={handleToggleAll}
                        checked={selectedTaskIds.size === tasks.length && tasks.length > 0}
                        disabled={!canEdit}
                    />
                    Select All
                </label>
             </div>
        </div>
        <div className="overflow-y-auto">
            {tasks.map(task => (
                <TaskRow
                    key={task.id}
                    task={task}
                    isSelected={selectedTaskIds.has(task.id)}
                    onToggleSelection={handleToggleSelection}
                    onDragStart={handleDragStart}
                    onDragEnter={handleDragEnter}
                    onDragEnd={handleDragEnd}
                />
            ))}
        </div>
    </div>
  );
};

export default ListView;