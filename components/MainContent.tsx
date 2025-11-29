
import React from 'react';
import { List, Task, User, ViewType, Role, Status, Priority, Permission } from '../types';
import BoardView from './BoardView';
import ListView from './ListView';
import Header from './Header';
import { CalendarView } from './CalendarView';
import ProjectDashboard from './ProjectDashboard';
import GanttView from './GanttView';
import EisenhowerView from './EisenhowerView';
import BacklogView from './BacklogView';
import ApprovalsView from './ApprovalsView';
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
    activeView,
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
    if (activeView === 'approvals') {
        return <ApprovalsView />;
    }

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
      case ViewType.Eisenhower:
        return <EisenhowerView tasks={filteredTasks} onSelectTask={(task) => setSelectedTaskId(task.id)} users={users} />;
      case ViewType.Backlog:
        return <BacklogView tasks={filteredTasks} onSelectTask={(task) => setSelectedTaskId(task.id)} onUpdateTask={handleUpdateTask} users={users} lists={state.lists} selectedListId={state.selectedListId} />;
      default:
        return <BoardView />;
    }
  }

  const title = activeView === 'approvals' 
    ? t('approvals.title')
    : selectedList ? selectedList.name : t('sidebar.allProjects');

  return (
    <main className="flex-grow flex flex-col h-full overflow-y-auto bg-[#0f172a] relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/30 via-[#0f172a] to-[#0f172a] pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col h-full">
          <Header title={title} />
          
            <>
            {activeView !== 'approvals' && (
                <div className="flex-shrink-0 p-4 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0f172a]/95 backdrop-blur-sm sticky top-[64px] z-20 shadow-sm">
                    <div className="w-full md:w-auto overflow-x-auto pb-1 md:pb-0 -mx-4 md:mx-0 px-4 md:px-0 no-scrollbar">
                        <div className="bg-surface p-1 rounded-lg flex items-center whitespace-nowrap w-max border border-white/5">
                            {[
                                { id: ViewType.Board, label: t('mainContent.board') },
                                { id: ViewType.List, label: t('mainContent.list') },
                                { id: ViewType.Backlog, label: t('mainContent.backlog') },
                                { id: ViewType.Calendar, label: t('mainContent.calendar') },
                                { id: ViewType.Gantt, label: t('mainContent.gantt') },
                                { id: ViewType.Eisenhower, label: t('mainContent.eisenhower') },
                                { id: ViewType.ProjectDashboard, label: t('mainContent.dashboard') },
                            ].map(view => (
                                <button 
                                    key={view.id}
                                    onClick={() => setCurrentView(view.id as ViewType)} 
                                    className={`px-3 md:px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-300 ${currentView === view.id ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
                                >
                                    {view.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap w-full md:w-auto justify-between md:justify-end">
                        <div className="flex gap-2">
                            <div className="relative group">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as Status | 'all')}
                                    className="bg-surface pl-3 pr-8 py-2 rounded-lg text-sm font-medium text-text-secondary appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 border border-white/5 hover:border-white/10 transition-colors w-full sm:w-auto cursor-pointer"
                                >
                                    <option value="all">{t('common.allStatuses')}</option>
                                    {Object.values(Status).map(s => <option key={s} value={s}>{translateStatus(s)}</option>)}
                                </select>
                            </div>
                            <div className="relative group">
                                <select
                                    value={priorityFilter}
                                    onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
                                    className="bg-surface pl-3 pr-8 py-2 rounded-lg text-sm font-medium text-text-secondary appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 border border-white/5 hover:border-white/10 transition-colors w-full sm:w-auto cursor-pointer"
                                >
                                    <option value="all">{t('common.allPriorities')}</option>
                                    {Object.values(Priority).map(p => <option key={p} value={p}>{translatePriority(p)}</option>)}
                                </select>
                            </div>
                        </div>
                        {canCreateTasks && (
                            <div className="relative" ref={templateDropdownRef}>
                                <button 
                                    onClick={handleNewTaskButtonClick} 
                                    disabled={!selectedList}
                                    className="px-3 md:px-4 py-2 bg-primary hover:bg-primary-focus text-white font-semibold rounded-lg transition-all duration-200 flex items-center shadow-lg shadow-primary/20 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none hover:scale-[1.05] active:scale-95"
                                    title={!selectedList ? t('mainContent.createTaskNoProjectTooltip') : t('mainContent.createTaskTooltip')}
                                >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                <span className="hidden md:inline">{t('common.new')}</span>
                                </button>
                                {isTemplateDropdownOpen && taskTemplates.length > 0 && (
                                    <div className="absolute right-0 mt-2 w-56 bg-surface rounded-xl shadow-2xl border border-white/10 z-50 animate-scaleIn backdrop-blur-xl origin-top-right">
                                        <div className="p-1">
                                            <button onClick={() => handleCreateTask()} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-white/5 font-semibold transition-colors">
                                                {t('mainContent.newTaskFromTemplate')}
                                            </button>
                                            <div className="my-1 h-px bg-white/10"></div>
                                            <div className="px-3 py-1 text-[10px] text-text-secondary uppercase tracking-wider font-bold">{t('mainContent.templates')}</div>
                                            {taskTemplates.map(template => (
                                                <button key={template.id} onClick={() => handleCreateTask(template)} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-white/5 transition-colors">
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
            )}
            <div className="flex-grow p-4 sm:p-6 overflow-x-hidden">
                <div key={activeView === 'approvals' ? 'approvals' : currentView} className="h-full animate-slideUpFade">
                    {renderCurrentView()}
                </div>
            </div>
            </>
          
          <footer className="p-4 text-center text-xs text-text-secondary/50 border-t border-white/5 mt-auto flex-shrink-0">
              {t('footer.copyright', { year: new Date().getFullYear() })}
          </footer>
      </div>
    </main>
  );
};

export default MainContent;
