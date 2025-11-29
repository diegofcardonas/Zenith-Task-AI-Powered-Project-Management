
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
    
    return (
        <div className="fixed bottom-4 md:bottom-8 left-4 right-4 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 z-40 bg-surface border border-white/10 shadow-2xl shadow-black/50 rounded-xl p-2 md:p-3 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 animate-scaleIn justify-between sm:justify-start overflow-x-auto backdrop-blur-xl">
            <div className="flex items-center gap-3 pl-2 sm:border-r border-white/10 pr-4 whitespace-nowrap">
                 <div className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-md shadow-sm">{selectedCount}</div>
                 <span className="text-sm font-semibold text-text-primary">{t('listView.selected_plural', {count: selectedCount})}</span>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                 <select 
                    onChange={(e) => onUpdate({ status: e.target.value as Status })}
                    defaultValue=""
                    className="bg-white/5 border border-white/10 text-text-primary rounded-lg px-3 py-1.5 text-xs focus:ring-primary focus:border-primary flex-grow sm:flex-grow-0 hover:bg-white/10 transition-colors cursor-pointer"
                 >
                    <option value="" disabled>{t('listView.changeStatus')}</option>
                    {Object.values(Status).map(s => <option key={s} value={s}>{t(`common.${s.replace(/\s+/g, '').toLowerCase()}`)}</option>)}
                </select>
                 <select 
                    onChange={(e) => onUpdate({ priority: e.target.value as Priority })}
                    defaultValue=""
                    className="bg-white/5 border border-white/10 text-text-primary rounded-lg px-3 py-1.5 text-xs focus:ring-primary focus:border-primary hidden sm:block hover:bg-white/10 transition-colors cursor-pointer"
                 >
                    <option value="" disabled>{t('listView.changePriority')}</option>
                    {Object.values(Priority).map(p => <option key={p} value={p}>{t(`common.${p.toLowerCase()}`)}</option>)}
                </select>
                <select 
                    onChange={(e) => onUpdate({ assigneeId: e.target.value || null })}
                    defaultValue=""
                    className="bg-white/5 border border-white/10 text-text-primary rounded-lg px-3 py-1.5 text-xs focus:ring-primary focus:border-primary hidden md:block hover:bg-white/10 transition-colors cursor-pointer"
                 >
                    <option value="" disabled>{t('listView.changeAssignee')}</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>

                <div className="hidden sm:block w-px h-6 bg-white/10 mx-1"></div>

                <div className="flex items-center gap-1">
                    <button 
                        onClick={onDelete} 
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                        title={t('common.delete')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <button onClick={onClear} className="p-2 text-text-secondary hover:text-text-primary hover:bg-white/10 rounded-lg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
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
      <div className="flex flex-col items-center justify-center h-full bg-transparent rounded-lg border border-dashed border-white/5 p-12 animate-fadeIn">
         <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
             <svg className="w-8 h-8 text-text-secondary opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
         </div>
        <p className="text-text-secondary font-medium">{t('listView.noTasks')}</p>
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
    <div className="w-full h-full flex flex-col relative bg-[#0f172a] overflow-y-auto pb-20 md:pb-6 px-4 no-scrollbar">
        {selectedTaskIds.size > 0 && canEdit && (
            <BulkActionBar 
                selectedCount={selectedTaskIds.size}
                onClear={() => setSelectedTaskIds(new Set())}
                onUpdate={handleBulkUpdate}
                onDelete={handleBulkDelete}
                users={users}
            />
        )}
        <div className="max-w-[1600px] mx-auto w-full">
            <div className="sticky top-0 z-20 bg-[#0f172a]/95 backdrop-blur-md pb-2 pt-2 border-b border-white/5 md:border-none">
                {/* Header Row - CSS Grid matched to TaskRow (Desktop Only) */}
                <div className="hidden md:grid grid-cols-[40px_90px_1fr_150px_120px_80px_150px_80px] gap-4 px-6 py-3 text-[11px] text-text-secondary font-bold uppercase tracking-wider items-center rounded-xl bg-surface border border-white/5 shadow-sm">
                    <div className="flex items-center justify-center">
                        <div className="group relative">
                            <input 
                                type="checkbox" 
                                className="w-3.5 h-3.5 rounded bg-transparent border-white/20 checked:bg-primary focus:ring-0 focus:ring-offset-0 cursor-pointer transition-all appearance-none border checked:border-primary"
                                onChange={handleToggleAll}
                                checked={selectedTaskIds.size === tasks.length && tasks.length > 0}
                                disabled={!canEdit}
                            />
                            <svg className={`pointer-events-none absolute top-0.5 left-0.5 w-2.5 h-2.5 text-white ${selectedTaskIds.size === tasks.length && tasks.length > 0 ? 'opacity-100' : 'opacity-0'}`} viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <div>{t('common.key')}</div>
                    <div>{t('listView.task')}</div>
                    <div>{t('listView.assignee')}</div>
                    <div>{t('listView.dueDate')}</div>
                    <div className="text-center">{t('listView.priority')}</div>
                    <div>{t('listView.status')}</div>
                    <div className="text-right">{t('listView.actions')}</div>
                </div>
                 {/* Mobile "Select All" helper */}
                 <div className="md:hidden p-3 flex items-center justify-between bg-white/[0.02] rounded-lg border border-white/5 mb-2">
                    <label className="flex items-center gap-3 text-xs font-semibold text-text-secondary uppercase tracking-wide">
                         <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded bg-transparent border-white/30 checked:bg-primary focus:ring-0 cursor-pointer"
                            onChange={handleToggleAll}
                            checked={selectedTaskIds.size === tasks.length && tasks.length > 0}
                            disabled={!canEdit}
                        />
                        Select All
                    </label>
                    <span className="text-xs text-text-secondary">{tasks.length} tasks</span>
                 </div>
            </div>
            
            <div className="flex flex-col space-y-2 mt-2">
                {tasks.map((task, index) => (
                    <div key={task.id} className="animate-slideUpFade" style={{ animationDelay: `${Math.min(index * 50, 300)}ms`, animationFillMode: 'both' }}>
                        <TaskRow
                            task={task}
                            isSelected={selectedTaskIds.has(task.id)}
                            onToggleSelection={handleToggleSelection}
                            onDragStart={handleDragStart}
                            onDragEnter={handleDragEnter}
                            onDragEnd={handleDragEnd}
                        />
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default ListView;
