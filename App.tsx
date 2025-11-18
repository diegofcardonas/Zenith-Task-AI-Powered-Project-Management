import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import TaskModal from './components/TaskModal';
import AdminDashboard from './components/admin/AdminDashboard';
import UserProfileModal from './components/UserProfileModal';
import AppAdminPanel from './components/admin/AppAdminPanel';
import WorkspaceModal from './components/WorkspaceModal';
import ProjectModal from './components/ProjectModal';
import BlockingTasksModal from './components/BlockingTasksModal';
import AuthPage from './components/AuthPage';
import MyTasksView from './components/MyTasksView';
import CommandPalette from './components/CommandPalette';
import AISummaryModal from './components/AISummaryModal';
import AIChatbot from './components/AIChatbot';
import WelcomePage from './components/WelcomePage';
import SettingsModal from './components/SettingsModal';
import FolderModal from './components/FolderModal';
import ConfirmationModal from './components/ConfirmationModal';
import { useAppContext } from './contexts/AppContext';
import { Toast, Permission } from './types';
import { useTranslation } from './i18n';

const ToastComponent: React.FC<{ toast: Toast, onClose: () => void }> = ({ toast, onClose }) => {
    const { t } = useTranslation();
    const { message, type } = toast;
    const baseClasses = "flex items-center w-full max-w-xs p-4 space-x-4 text-gray-500 bg-white divide-x divide-gray-200 rounded-lg shadow-lg dark:text-gray-400 dark:divide-gray-700 space-x dark:bg-surface border dark:border-border";
    const typeClasses = {
        success: 'text-green-500 dark:text-green-400',
        error: 'text-red-500 dark:text-red-400',
        info: 'text-blue-500 dark:text-blue-400',
    };
    const Icon = () => {
        if (type === 'success') return <svg className={`w-5 h-5 ${typeClasses.success}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/></svg>;
        if (type === 'error') return <svg className={`w-5 h-5 ${typeClasses.error}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z"/></svg>;
        return <svg className={`w-5 h-5 ${typeClasses.info}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/></svg>;
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div role="alert" className={`${baseClasses} animate-fadeIn`}>
            <div className={`p-2 rounded-full ${typeClasses[type]} bg-opacity-10`}>
                <Icon />
            </div>
            <div className="pl-4 text-sm font-normal text-text-primary">{message}</div>
            <button 
                type="button" 
                className="-mx-1.5 -my-1.5 ml-auto inline-flex h-8 w-8 rounded-lg bg-white p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 focus:ring-2 focus:ring-gray-300 dark:bg-surface dark:text-gray-500 dark:hover:bg-secondary-focus dark:hover:text-white" 
                onClick={onClose} 
                aria-label={t('common.close')}
            >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
        </div>
    );
};


const App: React.FC = () => {
  const { state, actions, permissions } = useAppContext();
  const {
    currentUser,
    users,
    tasks,
    lists,
    folders,
    activeView,
    selectedTask,
    editingUser,
    isWorkspaceModalOpen,
    isProjectModalOpen,
    isFolderModalOpen,
    isBlockingTasksModalOpen,
    taskForBlockingModal,
    isCommandPaletteOpen,
    isSummaryModalOpen,
    isSettingsModalOpen,
    summaryData,
    isSummaryLoading,
    toasts,
    isLoading,
    workspaceToEdit,
    listToEdit,
    folderToEdit,
    selectedWorkspaceId,
    theme,
    colorScheme,
    isConfirmationModalOpen,
    confirmationModalProps,
  } = state;

  const {
    removeToast,
    hideConfirmation,
    handleLogout,
  } = actions;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (selectedTask || editingUser || isWorkspaceModalOpen || isProjectModalOpen || isFolderModalOpen || isCommandPaletteOpen || isSummaryModalOpen || isSettingsModalOpen || isBlockingTasksModalOpen || isConfirmationModalOpen) return;
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;

        switch (event.key.toLowerCase()) {
            case 'n':
                if (activeView === 'list' && state.selectedListId && permissions.has(Permission.CREATE_TASKS)) {
                    event.preventDefault();
                    actions.handleAddTask(state.selectedListId);
                }
                break;
            case 'f':
                event.preventDefault();
                window.dispatchEvent(new CustomEvent('focus-global-search'));
                break;
        }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeView, state.selectedListId, selectedTask, editingUser, isWorkspaceModalOpen, isProjectModalOpen, isFolderModalOpen, isCommandPaletteOpen, isSummaryModalOpen, isSettingsModalOpen, isBlockingTasksModalOpen, isConfirmationModalOpen, actions, permissions]);

  const handleCommand = (command: string, payload?: any) => {
      switch (command) {
          case 'navigate_list':
              const list = lists.find(l => l.id === payload);
              if(list) {
                actions.setSelectedWorkspaceId(list.workspaceId);
                actions.setSelectedListId(list.id);
                actions.setActiveView('list');
              }
              break;
          case 'navigate_my_tasks':
              actions.setActiveView('my_tasks');
              actions.setSelectedListId(null);
              break;
          case 'navigate_dashboard':
              if (permissions.has(Permission.VIEW_DASHBOARD)) {
                actions.setActiveView('dashboard');
                actions.setSelectedListId(null);
              }
              break;
          case 'navigate_admin':
              if (permissions.has(Permission.MANAGE_APP)) {
                actions.setActiveView('app_admin');
                actions.setSelectedListId(null);
              }
              break;
          case 'create_task':
              if (state.selectedListId && permissions.has(Permission.CREATE_TASKS)) {
                  actions.handleAddTask(state.selectedListId);
              } else {
                  actions.addToast({ id: Date.now(), message: 'Selecciona un proyecto para crear una tarea', type: 'info' });
              }
              break;
          case 'toggle_theme':
              actions.setColorScheme(state.colorScheme === 'dark' ? 'light' : 'dark');
              break;
          case 'logout':
              actions.showConfirmation(
                'Cerrar Sesión', 
                '¿Estás seguro de que quieres cerrar sesión?', 
                () => handleLogout()
              );
              break;
      }
      actions.setIsCommandPaletteOpen(false);
  };

  const renderContent = () => {
    if (isLoading) {
        return <WelcomePage />;
    }

    if (!currentUser) {
        return <AuthPage />;
    }

    return (
      <div className="flex h-screen bg-background text-text-primary">
        <Sidebar />
        
        {activeView === 'dashboard' && permissions.has(Permission.VIEW_DASHBOARD) ? (
          <AdminDashboard />
        ) : activeView === 'app_admin' && permissions.has(Permission.MANAGE_APP) ? (
          <AppAdminPanel />
        ) : activeView === 'my_tasks' ? (
          <MyTasksView />
        ) : (
          <MainContent />
        )}

        {selectedTask && <TaskModal />}
        {editingUser && <UserProfileModal user={editingUser} onClose={() => actions.setEditingUserId(null)} onUpdateUser={actions.handleUpdateUser} isEditingSelf={editingUser.id === currentUser.id} />}
        <WorkspaceModal isOpen={isWorkspaceModalOpen} workspaceToEdit={workspaceToEdit} onClose={() => actions.setIsWorkspaceModalOpen(false)} onSave={actions.handleSaveWorkspace} />
        <ProjectModal isOpen={isProjectModalOpen} listToEdit={listToEdit} onClose={() => actions.setIsProjectModalOpen(false)} onSave={actions.handleSaveList} folders={folders} workspaceId={selectedWorkspaceId!} />
        <FolderModal isOpen={isFolderModalOpen} folderToEdit={folderToEdit} onClose={() => actions.setIsFolderModalOpen(false)} onSave={actions.handleSaveFolder} />
        {taskForBlockingModal && (
            <BlockingTasksModal
              isOpen={isBlockingTasksModalOpen}
              task={taskForBlockingModal}
            />
        )}
         <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => actions.setIsCommandPaletteOpen(false)} lists={lists} currentUser={currentUser} onCommand={handleCommand} />
        <AISummaryModal
          isOpen={isSummaryModalOpen}
          onClose={() => actions.setIsSummaryModalOpen(false)}
          title={summaryData.title}
          content={summaryData.content}
          isLoading={isSummaryLoading}
        />
        <SettingsModal isOpen={isSettingsModalOpen} onClose={() => actions.setIsSettingsModalOpen(false)} theme={theme} setTheme={actions.setTheme} colorScheme={colorScheme} setColorScheme={actions.setColorScheme} />
        {isConfirmationModalOpen && confirmationModalProps && (
          <ConfirmationModal
              isOpen={isConfirmationModalOpen}
              onClose={hideConfirmation}
              onConfirm={confirmationModalProps.onConfirm}
              title={confirmationModalProps.title}
              message={confirmationModalProps.message}
          />
        )}
        <AIChatbot tasks={tasks} lists={lists} users={users} />
      </div>
    );
  };

  return (
    <>
      {renderContent()}
      <div className="fixed top-5 right-5 z-50 space-y-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
             <ToastComponent toast={toast} onClose={() => removeToast(toast.id)} />
          </div>
        ))}
      </div>
    </>
  );
};

export default App;