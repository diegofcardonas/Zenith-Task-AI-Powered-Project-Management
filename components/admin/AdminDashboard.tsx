import React, { useMemo, useState } from 'react';
import { Task, User, Status, Priority, List, Notification } from '../../types';
import StatCard from './StatCard';
import TasksByStatusChart from './TasksByStatusChart';
import TasksByPriorityChart from './TasksByPriorityChart';
import UserWorkloadList from './UserWorkloadList';
import Header from '../Header';
import UserTasksModal from './UserTasksModal';
import TaskListModal from './TaskListModal';
import UserListModal from './UserListModal';
import { useAppContext } from '../../contexts/AppContext';
import { useTranslation } from '../../i18n';


interface AdminDashboardProps {
}

type TaskFilter = 'all' | 'completed' | 'overdue';

const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const { t } = useTranslation();
  const { state, actions } = useAppContext();
  const { tasks, users, currentUser } = state;
  const { setEditingUserId, setSelectedTaskId } = actions;
    
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<Priority | null>(null);
  const [isTaskListModalOpen, setIsTaskListModalOpen] = useState(false);
  const [modalTasks, setModalTasks] = useState<Task[]>([]);
  const [modalTitle, setModalTitle] = useState('');
  const [isUserListModalOpen, setIsUserListModalOpen] = useState(false);
  
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === Status.Done).length;
    const overdueTasks = tasks.filter(t => t.status !== Status.Done && new Date(t.dueDate) < new Date()).length;
    const totalUsers = users.length;
    return { totalTasks, completedTasks, overdueTasks, totalUsers };
  }, [tasks, users]);

  const filteredTasks = useMemo(() => {
    let tempTasks = tasks;

    switch(activeFilter) {
      case 'completed':
        tempTasks = tempTasks.filter(t => t.status === Status.Done);
        break;
      case 'overdue':
        tempTasks = tempTasks.filter(t => t.status !== Status.Done && new Date(t.dueDate) < new Date());
        break;
      case 'all':
      default:
        // No initial filter based on stats
        break;
    }

    if (selectedStatus) {
        tempTasks = tempTasks.filter(t => t.status === selectedStatus);
    }
    if (selectedPriority) {
        tempTasks = tempTasks.filter(t => t.priority === selectedPriority);
    }

    return tempTasks;
  }, [tasks, activeFilter, selectedStatus, selectedPriority]);

  const selectedUser = useMemo(() => users.find(u => u.id === selectedUserId), [users, selectedUserId]);
  const tasksForSelectedUser = useMemo(() => filteredTasks.filter(t => t.assigneeId === selectedUserId), [filteredTasks, selectedUserId]);
  
  const clearChartFilters = () => {
    setSelectedStatus(null);
    setSelectedPriority(null);
  };

  const handleTaskStatCardClick = (filter: TaskFilter, title: string) => {
    setActiveFilter(filter);
    let tasksToShow: Task[] = [];
     switch (filter) {
          case 'all':
              tasksToShow = tasks;
              break;
          case 'completed':
              tasksToShow = tasks.filter(t => t.status === Status.Done);
              break;
          case 'overdue':
              tasksToShow = tasks.filter(t => t.status !== Status.Done && new Date(t.dueDate) < new Date());
              break;
      }
      setModalTasks(tasksToShow);
      setModalTitle(title);
      setIsTaskListModalOpen(true);
  };

  return (
    <main className="flex-grow flex flex-col h-full overflow-y-auto">
      <Header title={t('header.adminDashboard')} />
      
      <div className="flex-grow p-3 sm:p-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard 
                title={t('admin.totalTasks')}
                value={stats.totalTasks} 
                icon="list" 
                onClick={() => handleTaskStatCardClick('all', t('modals.allTasks'))} 
                isActive={activeFilter === 'all'} 
            />
            <StatCard 
                title={t('admin.completed')}
                value={stats.completedTasks} 
                icon="check" 
                onClick={() => handleTaskStatCardClick('completed', `${t('admin.completed')} ${t('common.tasks')}`)}
                isActive={activeFilter === 'completed'}
            />
            <StatCard 
                title={t('admin.overdue')}
                value={stats.overdueTasks} 
                icon="alert" 
                onClick={() => handleTaskStatCardClick('overdue', `${t('admin.overdue')} ${t('common.tasks')}`)}
                isActive={activeFilter === 'overdue'}
            />
            <StatCard 
                title={t('admin.totalUsers')}
                value={stats.totalUsers} 
                icon="users" 
                onClick={() => setIsUserListModalOpen(true)}
            />
        </div>
        
        {/* Charts and Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-surface rounded-lg p-6 animate-fadeIn flex flex-col">
            <h2 className="text-xl font-semibold mb-4 flex-shrink-0">{t('admin.tasksByStatus')}</h2>
            <TasksByStatusChart tasks={filteredTasks} onStatusSelect={setSelectedStatus} selectedStatus={selectedStatus} />
          </div>
          <div className="lg:col-span-2 bg-surface rounded-lg p-6 animate-fadeIn flex flex-col" style={{ animationDelay: '100ms' }}>
            <h2 className="text-xl font-semibold mb-4 flex-shrink-0">{t('admin.tasksByPriority')}</h2>
            <TasksByPriorityChart tasks={filteredTasks} onPrioritySelect={setSelectedPriority} selectedPriority={selectedPriority} />
          </div>
          <div className="lg:col-span-3 bg-surface rounded-lg p-6 animate-fadeIn" style={{ animationDelay: '200ms' }}>
            <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                <h2 className="text-xl font-semibold">{t('admin.userWorkload')}</h2>
                {(selectedStatus || selectedPriority) && (
                    <button onClick={clearChartFilters} className="px-3 py-1 text-sm bg-secondary text-text-secondary font-semibold rounded-lg hover:bg-secondary-focus transition-colors flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        {t('admin.clearFilters')}
                    </button>
                )}
            </div>
             <UserWorkloadList 
                users={users} 
                tasks={filteredTasks} 
                onUserSelect={setSelectedUserId}
             />
          </div>
        </div>
      </div>
      {selectedUser && (
        <UserTasksModal
            isOpen={!!selectedUserId}
            onClose={() => setSelectedUserId(null)}
            user={selectedUser}
            tasks={tasksForSelectedUser}
            onSelectTask={(task) => {
                setSelectedTaskId(task.id);
                setSelectedUserId(null);
            }}
        />
      )}
      {isTaskListModalOpen && (
        <TaskListModal
            isOpen={isTaskListModalOpen}
            onClose={() => setIsTaskListModalOpen(false)}
            title={modalTitle}
            tasks={modalTasks}
            users={users}
            onSelectTask={setSelectedTaskId}
        />
      )}
      {isUserListModalOpen && (
        <UserListModal
            isOpen={isUserListModalOpen}
            onClose={() => setIsUserListModalOpen(false)}
            users={users}
            onSelectUser={(user) => {
                setEditingUserId(user.id);
                setIsUserListModalOpen(false);
            }}
        />
      )}
    </main>
  );
};

export default AdminDashboard;