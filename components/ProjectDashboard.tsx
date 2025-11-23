
import React, { useMemo, useState } from 'react';
import { Task, User, Status, Permission } from '../types';
import { generateRiskAnalysis } from '../services/geminiService';
import { useTranslation } from '../i18n';
import { useAppContext } from '../contexts/AppContext';

const TasksByStatusChart: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
    const { t } = useTranslation();
    const STATUS_CONFIG = {
        [Status.Todo]: { label: t('common.todo'), color: 'bg-status-todo' },
        [Status.InProgress]: { label: t('common.inprogress'), color: 'bg-status-inprogress' },
        [Status.Done]: { label: t('common.done'), color: 'bg-status-done' },
    };
    const data = useMemo(() => {
        const counts = { [Status.Todo]: 0, [Status.InProgress]: 0, [Status.Done]: 0 };
        tasks.forEach(t => counts[t.status]++);
        return Object.values(Status).map(s => ({ ...STATUS_CONFIG[s], count: counts[s]}));
    }, [tasks, STATUS_CONFIG]);

    const total = tasks.length;
    if (total === 0) return <p className="text-text-secondary text-sm italic">{t('projectDashboard.noTasksToShow')}</p>;
    
    return (
        <div className="space-y-2">
            {data.map(item => (
                <div key={item.label}>
                    <div className="flex justify-between mb-1 text-sm font-medium text-text-secondary">
                        <span>{item.label}</span>
                        <span>{item.count}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2.5">
                        <div className={`${item.color} h-2.5 rounded-full`} style={{ width: `${(item.count / total) * 100}%` }}></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const TasksByAssigneeChart: React.FC<{ tasks: Task[], users: User[] }> = ({ tasks, users }) => {
    const { t } = useTranslation();
    const data = useMemo(() => {
        const counts: { [key: string]: { user: User | { id: 'unassigned', name: string, avatar: '' }; count: number } } = {};
        
        users.forEach(u => {
            counts[u.id] = { user: u, count: 0 };
        });
        counts['unassigned'] = { user: { id: 'unassigned', name: t('projectDashboard.unassigned'), avatar: '' }, count: 0 };

        tasks.forEach(t => {
            const key = t.assigneeId || 'unassigned';
            if(counts[key]) counts[key].count++;
        });

        return Object.values(counts).filter(d => d.count > 0).sort((a,b) => b.count - a.count);
    }, [tasks, users, t]);

    if (tasks.length === 0) return <p className="text-text-secondary text-sm italic">{t('projectDashboard.noTasksToShow')}</p>;

    return (
        <div className="space-y-3">
            {data.map(item => (
                <div key={item.user.id} className="flex items-center">
                    {item.user.id !== 'unassigned' ? 
                        <img src={item.user.avatar} alt={item.user.name} className="w-8 h-8 rounded-full mr-3" />
                        : <div className="w-8 h-8 rounded-full bg-secondary-focus mr-3"></div>
                    }
                    <span className="text-text-primary font-medium flex-grow">{item.user.name}</span>
                    <span className="text-text-secondary font-semibold">{item.count}</span>
                </div>
            ))}
        </div>
    );
};

const renderMarkdown = (text: string) => {
    if (!text) return { __html: '' };
    let html = text
      .replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-2 mb-1">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-3 mb-1">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-secondary px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/\n/g, '<br />');
    
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul class="list-disc ml-5">$1</ul>');
    return { __html: html };
};

interface ProjectDashboardProps {
  tasks: Task[];
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ tasks }) => {
  const { t } = useTranslation();
  const { state, permissions } = useAppContext();
  const { users } = state;
  const [riskAnalysis, setRiskAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyzeRisks = async () => {
      setIsAnalyzing(true);
      const analysis = await generateRiskAnalysis(tasks, t('modals.thisProject'));
      setRiskAnalysis(analysis);
      setIsAnalyzing(false);
  };
    
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-secondary rounded-lg p-6 animate-fadeIn">
        <h2 className="text-xl font-semibold mb-4">{t('projectDashboard.tasksByStatus')}</h2>
        <TasksByStatusChart tasks={tasks} />
      </div>
      <div className="bg-secondary rounded-lg p-6 animate-fadeIn" style={{ animationDelay: '100ms' }}>
        <h2 className="text-xl font-semibold mb-4">{t('projectDashboard.tasksByAssignee')}</h2>
        <TasksByAssigneeChart tasks={tasks} users={users} />
      </div>
      <div className="bg-secondary rounded-lg p-6 animate-fadeIn lg:col-span-3" style={{ animationDelay: '200ms' }}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{t('modals.riskAnalysis')}</h2>
            {permissions.has(Permission.EDIT_TASKS) && (
              <button onClick={handleAnalyzeRisks} disabled={isAnalyzing} className="px-3 py-1.5 text-sm bg-primary/20 text-primary rounded-full hover:bg-primary/30 disabled:opacity-50 disabled:cursor-wait flex items-center gap-1.5">
                  {isAnalyzing ? (
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : '✨'}
                  {isAnalyzing ? t('modals.analyzing') : t('modals.analyzeRisks')}
              </button>
            )}
        </div>
        {isAnalyzing ? (
            <div className="animate-pulse space-y-3">
                <div className="h-4 bg-secondary-focus rounded w-3/4"></div>
                <div className="h-4 bg-secondary-focus rounded w-full"></div>
                <div className="h-4 bg-secondary-focus rounded w-1/2"></div>
            </div>
        ) : riskAnalysis ? (
            <div className="prose prose-invert max-w-none text-text-primary text-sm" dangerouslySetInnerHTML={renderMarkdown(riskAnalysis)}></div>
        ) : (
            <p className="text-text-secondary text-sm italic">{tasks.length > 0 ? t('modals.riskAnalysisPrompt') : t('modals.noTasksToAnalyze')}</p>
        )}
      </div>
    </div>
  );
};

export default ProjectDashboard;
