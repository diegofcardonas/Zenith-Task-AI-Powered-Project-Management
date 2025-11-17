import React from 'react';
import { Task, User, List } from '../types';
import Header from './Header';
import TaskRow from './TaskRow';
import { useAppContext } from '../contexts/AppContext';
import { useTranslation } from '../i18n';

const MyTasksView: React.FC = () => {
  const { t } = useTranslation();
  const { state, actions } = useAppContext();
  const { 
    tasks: allTasks, 
    lists: allLists, 
    currentUser 
  } = state;

  if (!currentUser) {
    return null; 
  }

  const onNavigateToList = (listId: string) => {
    const list = allLists.find(l => l.id === listId);
    if(list) {
      actions.setSelectedWorkspaceId(list.workspaceId);
      actions.setSelectedListId(list.id);
      actions.setActiveView('list');
    }
  };

  const myTasks = allTasks.filter(task => task.assigneeId === currentUser.id);

  const tasksByProject = myTasks.reduce((acc, task) => {
    const project = allLists.find(list => list.id === task.listId);
    if (project) {
      if (!acc[project.id]) {
        acc[project.id] = { project, tasks: [] };
      }
      acc[project.id].tasks.push(task);
    }
    return acc;
  }, {} as { [key: string]: { project: List; tasks: Task[] } });

  const projectGroups = Object.values(tasksByProject);

  return (
    <main className="flex-grow flex flex-col h-full overflow-y-auto">
      <Header title={t('header.myTasks')} />
      <div className="flex-grow p-3 sm:p-6 space-y-6">
        {projectGroups.length > 0 ? (
          projectGroups.map(({ project, tasks }) => (
            <div key={project.id} className="bg-surface rounded-lg">
              <div className="p-4 border-b border-border flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${project.color}`}></span>
                    <h2 className="font-semibold text-lg text-text-primary">{project.name}</h2>
                </div>
                <button 
                    onClick={() => onNavigateToList(project.id)}
                    className="text-sm text-primary hover:underline"
                >
                    {t('sidebar.viewProject')}
                </button>
              </div>
              <div className="divide-y divide-border">
                {tasks.map(task => (
                  <TaskRow
                    key={task.id}
                    task={task}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <h2 className="text-2xl font-semibold">{t('myTasks.noTasks')}</h2>
              <p className="text-text-secondary mt-1">{t('myTasks.goodJob')}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default MyTasksView;