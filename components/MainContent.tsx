import React from 'react';
import { List, Task, User, ViewType, Role, Status, Priority, Permission } from '../types';
import BoardView from './BoardView';
import ListView from './ListView';
import Header from './Header';
// Fix: Changed to a named import for CalendarView as it does not have a default export.
import { CalendarView } from './CalendarView';
import ProjectDashboard from './ProjectDashboard';
import GanttView from './GanttView';
import { useAppContext } from '../contexts/AppContext';
import { useTranslation } from '../i18n';

const MainContent: React.FC = () => {
  const { t } = useTranslation();
  const { state, actions, permissions } = useAppContext();
  const {
    selectedList,
    users,
    currentUser,
    currentView,
    statusFilter,
    priorityFilter,
    taskTemplates,
    filteredTasks, 
    allTasks
  } = state;

  const {
    handleUpdateTask,
    handleAddTask,
    handleAddTaskOnDate,
    setSelectedTaskId,
    setCurrentView,
    setStatusFilter,
    setPriorityFilter,
    logActivity,
  } = actions;

  const canCreateTasks = permissions.has(Permission.CREATE_TASKS);
  const [isTemplateDropdownOpen, setTemplateDropdownOpen] = React.useState(false);
  const templateDropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (templateDropdownRef.current && !templateDropdownRef.current.contains(event.target as Node)) {
              setTemplateDropdownOpen(false);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
          document.removeEventListener("mousedown", handleClickOutside);
      };
  }, []);

  const handleNewTaskButtonClick = () => {
    if (taskTemplates.length > 0) {
        setTemplateDropdownOpen(p => !p);
    } else {
        handleCreateTask();
    }
  };

  const handleCreateTask = (template?: any) => {
    if (selectedList?.id) {
        handleAddTask(selectedList.id, template);
    }
    setTemplateDropdownOpen(false);
  };
  
  const translateStatus = (status: Status) => {
      const key = `common.${status.replace(/\s+/g, '').toLowerCase()}`;
      return t(key, { defaultValue: status });
  };

  const translatePriority = (priority: Priority) => {
      const key = `common.${priority.toLowerCase()}`;
      return t(key, { defaultValue: priority });
  };


  const renderCurrentView = () => {
    switch (currentView) {
      case ViewType.Board:
        return <BoardView />;
      case ViewType.List:
        return <ListView />;
      case ViewType.Calendar:
        return <CalendarView tasks={filteredTasks} onSelectTask={(task) => setSelectedTaskId(task.id)} onUpdateTask={handleUpdateTask} onAddTaskForDate={handleAddTaskOnDate} currentUser={currentUser!} />;
      case ViewType.Gantt:
        return <GanttView tasks={filteredTasks} allTasks={allTasks} onSelectTask={(task) => setSelectedTaskId(task.id)} users={users} onUpdateTask={handleUpdateTask} currentUser={currentUser!} logActivity={logActivity} />;
      case ViewType.ProjectDashboard:
        return <ProjectDashboard tasks={filteredTasks} />;
      default:
        return <BoardView />;
    }
  }

  return (
    <main className="flex-grow flex flex-col h-full overflow-y-auto">
      <Header title={selectedList?.name || t('sidebar.projects')} />
      {selectedList ? (
        <>
        <div className="flex-shrink-0 p-3 sm:p-4 border-b border-border flex flex-wrap justify-between items-center gap-2">
            <div className="bg-secondary p-1 rounded-lg flex items-center flex-wrap">
                <button onClick={() => setCurrentView(ViewType.Board)} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${currentView === ViewType.Board ? 'bg-primary text-white' : 'text-text-secondary hover:bg-secondary-focus'}`}>{t('mainContent.board')}</button>
                <button onClick={() => setCurrentView(ViewType.List)} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${currentView === ViewType.List ? 'bg-primary text-white' : 'text-text-secondary hover:bg-secondary-focus'}`}>{t('mainContent.list')}</button>
                <button onClick={() => setCurrentView(ViewType.Calendar)} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${currentView === ViewType.Calendar ? 'bg-primary text-white' : 'text-text-secondary hover:bg-secondary-focus'}`}>{t('mainContent.calendar')}</button>
                <button onClick={() => setCurrentView(ViewType.Gantt)} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${currentView === ViewType.Gantt ? 'bg-primary text-white' : 'text-text-secondary hover:bg-secondary-focus'}`}>{t('mainContent.gantt')}</button>
                <button onClick={() => setCurrentView(ViewType.ProjectDashboard)} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${currentView === ViewType.ProjectDashboard ? 'bg-primary text-white' : 'text-text-secondary hover:bg-secondary-focus'}`}>{t('mainContent.dashboard')}</button>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
                <div className="relative">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as Status | 'all')}
                        className="bg-secondary pl-3 pr-8 py-1.5 rounded-lg text-sm font-medium text-text-secondary appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label={t('modals.status')}
                    >
                        <option value="all">{t('common.allStatuses')}</option>
                        {Object.values(Status).map(s => <option key={s} value={s}>{translateStatus(s)}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-secondary">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
                 <div className="relative">
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
                        className="bg-secondary pl-3 pr-8 py-1.5 rounded-lg text-sm font-medium text-text-secondary appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label={t('modals.priority')}
                    >
                        <option value="all">{t('common.allPriorities')}</option>
                        {Object.values(Priority).map(p => <option key={p} value={p}>{translatePriority(p)}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-secondary">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
                 {canCreateTasks && (
                    <div className="relative" ref={templateDropdownRef}>
                        <button 
                            onClick={handleNewTaskButtonClick} 
                            disabled={!selectedList}
                            className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-focus transition-colors duration-200 flex items-center disabled:bg-gray-500 disabled:cursor-not-allowed"
                            title={!selectedList ? t('mainContent.createTaskNoProjectTooltip') : t('mainContent.createTaskTooltip')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          <span className="hidden sm:inline">{t('common.new')}</span>
                        </button>
                         {isTemplateDropdownOpen && taskTemplates.length > 0 && (
                            <div className="absolute right-0 mt-2 w-56 bg-surface rounded-lg shadow-lg border border-border z-20 animate-fadeIn">
                                <div className="p-1">
                                    <button onClick={() => handleCreateTask()} className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-secondary-focus font-semibold">
                                        {t('mainContent.newTaskFromTemplate')}
                                    </button>
                                    <div className="my-1 h-px bg-border"></div>
                                    <div className="px-3 py-1 text-xs text-text-secondary uppercase tracking-wider">{t('mainContent.templates')}</div>
                                    {taskTemplates.map(template => (
                                        <button key={template.id} onClick={() => handleCreateTask(template)} className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-secondary-focus">
                                            {template.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                 )}
            </div>
        </div>
        <div className="flex-grow p-3 sm:p-6">
            {renderCurrentView()}
        </div>
        </>
        ) : (
        <div className="flex-grow p-8 flex items-center justify-center">
            <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h2 className="mt-4 text-2xl font-semibold">{t('mainContent.noProjectSelected')}</h2>
                <p className="mt-1 text-text-secondary">{t('mainContent.noProjectSelectedMessage')}</p>
            </div>
        </div>
      )}
      <footer className="p-4 text-center text-xs text-text-secondary border-t border-border mt-auto flex-shrink-0">
          {t('footer.copyright', { year: new Date().getFullYear() })}
      </footer>
    </main>
  );
};

export default MainContent;