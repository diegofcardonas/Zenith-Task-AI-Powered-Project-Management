import React from 'react';
import { List, Task, User, ViewType, Role, Status, Priority, TaskTemplate, Notification, Activity } from '../types';
import BoardView from './BoardView';
import ListView from './ListView';
import Header from './Header';
import CalendarView from './CalendarView';
import ProjectDashboard from './ProjectDashboard';
import GanttView from './GanttView';

interface MainContentProps {
  workspaceName: string;
  lists: List[];
  tasks: Task[];
  allTasks: Task[];
  allLists: List[];
  selectedList: List | null | undefined;
  users: User[];
  onUpdateTask: (task: Task) => void;
  onAddTask: (listId: string, template?: TaskTemplate) => void;
  onAddTaskForDate: (date: Date) => void;
  onDeleteTask: (taskId: string) => void;
  onSelectTask: (task: Task) => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  currentUser: User;
  onOpenUserProfile: () => void;
  statusFilter: Status | 'all';
  onStatusFilterChange: (status: Status | 'all') => void;
  priorityFilter: Priority | 'all';
  onPriorityFilterChange: (priority: Priority | 'all') => void;
  onEditList: (list: List) => void;
  onDeleteList: (listId: string) => void;
  onOpenBlockingTasks: (task: Task) => void;
  setEditingUser: (user: User | null) => void;
  onGenerateSummary: () => void;
  taskTemplates: TaskTemplate[];
  onNavigateToList: (listId: string) => void;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  logActivity: (taskId: string, text: string, user: User) => void;
  onTasksReorder: (reorderedTasks: Task[]) => void;
  onBulkUpdateTasks: (taskIds: string[], updates: Partial<Task>) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  workspaceName,
  lists,
  tasks,
  allTasks,
  allLists,
  selectedList,
  users,
  onUpdateTask,
  onAddTask,
  onAddTaskForDate,
  onDeleteTask,
  onSelectTask,
  onToggleSidebar,
  isSidebarOpen,
  currentView,
  setCurrentView,
  currentUser,
  onOpenUserProfile,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  onEditList,
  onDeleteList,
  onOpenBlockingTasks,
  setEditingUser,
  onGenerateSummary,
  taskTemplates,
  onNavigateToList,
  notifications,
  setNotifications,
  logActivity,
  onTasksReorder,
  onBulkUpdateTasks,
}) => {
  const canCreateTasks = currentUser.role === Role.Admin || currentUser.role === Role.Member;
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

  const handleCreateTask = (template?: TaskTemplate) => {
    if (selectedList?.id) {
        onAddTask(selectedList.id, template);
    }
    setTemplateDropdownOpen(false);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case ViewType.Board:
        return <BoardView tasks={tasks} users={users} onUpdateTask={onUpdateTask} onSelectTask={onSelectTask} currentUser={currentUser} allTasks={allTasks} onOpenBlockingTasks={onOpenBlockingTasks} onOpenUserProfile={(user) => setEditingUser(user)} />;
      case ViewType.List:
        return <ListView tasks={tasks} users={users} onSelectTask={onSelectTask} onUpdateTask={onUpdateTask} onDeleteTask={onDeleteTask} currentUser={currentUser} allTasks={allTasks} allLists={allLists} onOpenBlockingTasks={onOpenBlockingTasks} logActivity={logActivity} onTasksReorder={onTasksReorder} onBulkUpdateTasks={onBulkUpdateTasks} />;
      case ViewType.Calendar:
        return <CalendarView tasks={tasks} onSelectTask={onSelectTask} onUpdateTask={onUpdateTask} onAddTaskForDate={onAddTaskForDate} currentUser={currentUser} />;
      case ViewType.Gantt:
        return <GanttView tasks={tasks} allTasks={allTasks} onSelectTask={onSelectTask} users={users} />;
      case ViewType.ProjectDashboard:
        return <ProjectDashboard tasks={tasks} users={users} />;
      default:
        return <BoardView tasks={tasks} users={users} onUpdateTask={onUpdateTask} onSelectTask={onSelectTask} currentUser={currentUser} allTasks={allTasks} onOpenBlockingTasks={onOpenBlockingTasks} onOpenUserProfile={(user) => setEditingUser(user)} />;
    }
  }

  return (
    <main className="flex-grow flex flex-col h-full overflow-y-auto">
      <Header
        title={selectedList ? selectedList.name : workspaceName}
        onToggleSidebar={onToggleSidebar}
        isSidebarOpen={isSidebarOpen}
        currentUser={currentUser}
        onOpenUserProfile={onOpenUserProfile}
        selectedList={selectedList}
        onEditList={onEditList}
        onDeleteList={onDeleteList}
        onGenerateSummary={onGenerateSummary}
        allTasks={allTasks}
        allLists={allLists}
        allUsers={users}
        onSelectTask={onSelectTask}
        onNavigateToList={onNavigateToList}
        setEditingUser={setEditingUser}
        notifications={notifications}
        setNotifications={setNotifications}
      />
      {selectedList ? (
        <>
        <div className="flex-shrink-0 p-3 sm:p-4 border-b border-border flex flex-wrap justify-between items-center gap-2">
            <div className="bg-secondary p-1 rounded-lg flex items-center flex-wrap">
                <button onClick={() => setCurrentView(ViewType.Board)} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${currentView === ViewType.Board ? 'bg-primary text-white' : 'text-text-secondary hover:bg-secondary-focus'}`}>Tablero</button>
                <button onClick={() => setCurrentView(ViewType.List)} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${currentView === ViewType.List ? 'bg-primary text-white' : 'text-text-secondary hover:bg-secondary-focus'}`}>Lista</button>
                <button onClick={() => setCurrentView(ViewType.Calendar)} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${currentView === ViewType.Calendar ? 'bg-primary text-white' : 'text-text-secondary hover:bg-secondary-focus'}`}>Calendario</button>
                <button onClick={() => setCurrentView(ViewType.Gantt)} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${currentView === ViewType.Gantt ? 'bg-primary text-white' : 'text-text-secondary hover:bg-secondary-focus'}`}>Gantt</button>
                <button onClick={() => setCurrentView(ViewType.ProjectDashboard)} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${currentView === ViewType.ProjectDashboard ? 'bg-primary text-white' : 'text-text-secondary hover:bg-secondary-focus'}`}>Dashboard</button>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
                <div className="relative">
                    <select
                        value={statusFilter}
                        onChange={(e) => onStatusFilterChange(e.target.value as Status | 'all')}
                        className="bg-secondary pl-3 pr-8 py-1.5 rounded-lg text-sm font-medium text-text-secondary appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label="Status"
                    >
                        <option value="all">Todos los Estados</option>
                        {Object.values(Status).map(s => <option key={s} value={s}>{s === Status.Todo ? 'Por Hacer' : s === Status.InProgress ? 'En Progreso' : 'Hecho'}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-secondary">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
                 <div className="relative">
                    <select
                        value={priorityFilter}
                        onChange={(e) => onPriorityFilterChange(e.target.value as Priority | 'all')}
                        className="bg-secondary pl-3 pr-8 py-1.5 rounded-lg text-sm font-medium text-text-secondary appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label="Priority"
                    >
                        <option value="all">Todas las Prioridades</option>
                        {Object.values(Priority).map(p => <option key={p} value={p}>{p === Priority.Low ? 'Baja' : p === Priority.Medium ? 'Media' : 'Alta'}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-secondary">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
                 <div className="relative" ref={templateDropdownRef}>
                    <button 
                        onClick={handleNewTaskButtonClick} 
                        disabled={!canCreateTasks || !selectedList}
                        className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-focus transition-colors duration-200 flex items-center disabled:bg-gray-500 disabled:cursor-not-allowed"
                        title={!canCreateTasks ? 'Los invitados no pueden crear tareas' : !selectedList ? 'Selecciona un proyecto para crear una tarea' : 'Crear una nueva tarea (N)'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="http://www.w3.org/2000/svg" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      <span className="hidden sm:inline">Nuevo</span>
                    </button>
                     {isTemplateDropdownOpen && taskTemplates.length > 0 && (
                        <div className="absolute right-0 mt-2 w-56 bg-surface rounded-lg shadow-lg border border-border z-20 animate-fadeIn">
                            <div className="p-1">
                                <button onClick={() => handleCreateTask()} className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-secondary-focus font-semibold">
                                    Nueva Tarea en Blanco
                                </button>
                                <div className="my-1 h-px bg-border"></div>
                                <div className="px-3 py-1 text-xs text-text-secondary uppercase tracking-wider">Plantillas</div>
                                {taskTemplates.map(template => (
                                    <button key={template.id} onClick={() => handleCreateTask(template)} className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-secondary-focus">
                                        {template.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
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
                <h2 className="mt-4 text-2xl font-semibold">Ningún Proyecto Seleccionado</h2>
                <p className="mt-1 text-text-secondary">Por favor, crea un nuevo proyecto en este espacio de trabajo o selecciona uno de la barra lateral.</p>
            </div>
        </div>
      )}
    </main>
  );
};

export default MainContent;