import React from 'react';
import { Task, User, Status, Priority } from '../../types';
import AvatarWithStatus from '../AvatarWithStatus';
import { useTranslation } from '../../i18n';

const statusConfig: { [key in Status]: string } = {
  [Status.Todo]: 'bg-status-todo/20 text-status-todo',
  [Status.InProgress]: 'bg-status-inprogress/20 text-status-inprogress',
  [Status.Done]: 'bg-status-done/20 text-status-done',
};

const priorityConfig: { [key in Priority]: string } = {
    [Priority.High]: 'text-priority-high',
    [Priority.Medium]: 'text-priority-medium',
    [Priority.Low]: 'text-priority-low',
};


interface TaskListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  tasks: Task[];
  users: User[];
  onSelectTask: (taskId: string) => void;
}

const TaskListModal: React.FC<TaskListModalProps> = ({ isOpen, onClose, title, tasks, users, onSelectTask }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const getAssignee = (assigneeId: string | null): User | undefined => {
      return users.find(u => u.id === assigneeId);
  }

  const statusText: { [key in Status]: string } = {
    [Status.Todo]: t('common.todo'),
    [Status.InProgress]: t('common.inProgress'),
    [Status.Done]: t('common.done'),
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-surface rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-6 border-b border-border flex justify-between items-center">
            <h2 className="text-2xl font-bold text-text-primary">{title} ({tasks.length})</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label={t('common.close')}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="p-6 overflow-y-auto flex-grow">
          {tasks.length > 0 ? (
            <div className="space-y-3">
              <div className="hidden sm:grid grid-cols-12 gap-4 px-4 text-xs font-semibold text-text-secondary uppercase">
                  <div className="col-span-5">{t('listView.task')}</div>
                  <div className="col-span-2">{t('listView.assignee')}</div>
                  <div className="col-span-2">{t('listView.dueDate')}</div>
                  <div className="col-span-3">{t('listView.status')}</div>
              </div>
              {tasks.map((task) => {
                 const isOverdue = new Date(task.dueDate) < new Date() && task.status !== Status.Done;
                 const assignee = getAssignee(task.assigneeId);
                 return (
                    <button
                        key={task.id}
                        onClick={() => { onSelectTask(task.id); onClose(); }}
                        className="w-full text-left bg-secondary p-3 sm:px-4 sm:py-3 rounded-lg grid grid-cols-12 gap-4 items-center hover:bg-secondary-focus transition-colors"
                    >
                        <div className="col-span-12 sm:col-span-5">
                            <p className="font-semibold text-text-primary truncate">{task.title}</p>
                        </div>
                        <div className="col-span-6 sm:col-span-2 text-sm text-text-secondary flex items-center gap-2">
                             {assignee ? (
                                <>
                                 <AvatarWithStatus user={assignee} className="w-6 h-6 hidden sm:block"/>
                                 <span>{assignee.name}</span>
                                </>
                             ) : (
                                <span>{t('common.unassigned')}</span>
                             )}
                        </div>
                        <div className={`col-span-6 sm:col-span-2 text-sm ${isOverdue ? 'text-priority-high font-semibold' : 'text-text-secondary'}`}>
                            {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                        <div className="col-span-12 sm:col-span-3 flex items-center justify-start sm:justify-end gap-4">
                            <span className={`text-xs font-semibold ${priorityConfig[task.priority]}`}>{t(`common.${task.priority.toLowerCase()}`)}</span>
                            <span className={`text-xs font-medium rounded-full px-3 py-1 text-center ${statusConfig[task.status]}`}>
                                {statusText[task.status]}
                            </span>
                        </div>
                    </button>
                 );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-text-secondary italic">
              {t('modals.noTasksInCategory')}
            </div>
          )}
        </main>
        
        <footer className="p-4 border-t border-border flex justify-end">
            <button onClick={onClose} className="px-5 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-focus transition-colors duration-200">
                {t('common.close')}
            </button>
        </footer>
      </div>
    </div>
  );
};

export default TaskListModal;