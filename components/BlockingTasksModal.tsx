import React from 'react';
import { Task } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { useTranslation } from '../i18n';

interface BlockingTasksModalProps {
  isOpen: boolean;
  task: Task;
}

const BlockingTasksModal: React.FC<BlockingTasksModalProps> = ({ isOpen, task }) => {
  const { t } = useTranslation();
  const { state, actions } = useAppContext();
  const { allTasks } = state;
  const { setIsBlockingTasksModalOpen, setTaskForBlockingModal, setSelectedTaskId } = actions;
    
  if (!isOpen) return null;

  const blockingTasks = allTasks.filter(t => t.dependsOn?.includes(task.id));
  
  const onClose = () => {
    setIsBlockingTasksModalOpen(false);
    setTaskForBlockingModal(null);
  }

  const onSelectTask = (task: Task) => {
    setSelectedTaskId(task.id);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-surface rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-text-primary">{t('modals.taskDependencies')}</h2>
            <p className="text-sm text-text-secondary truncate" title={task.title}>{t('modals.taskIsBlocking', { title: task.title })}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label={t('common.close')}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="p-6 overflow-y-auto flex-grow">
          {blockingTasks.length > 0 ? (
            <ul className="space-y-2">
              {blockingTasks.map(blockedTask => (
                <li key={blockedTask.id}>
                  <button
                    onClick={() => { onSelectTask(blockedTask); }}
                    className="w-full text-left bg-secondary p-3 rounded-lg text-text-primary hover:bg-secondary-focus transition-colors"
                  >
                    {blockedTask.title}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
             <p className="text-text-secondary italic">{t('modals.taskIsNotBlocking')}</p>
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

export default BlockingTasksModal;