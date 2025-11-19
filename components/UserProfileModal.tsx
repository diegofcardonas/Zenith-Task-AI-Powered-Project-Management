import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, Task, Status } from '../types';
import AvatarWithStatus from './AvatarWithStatus';
import { useTranslation } from '../i18n';
import { useAppContext } from '../contexts/AppContext';
import { useTimeAgo } from '../hooks/useTimeAgo';

interface UserProfileModalProps {
  user: User;
  onClose: () => void;
  onUpdateUser: (user: User) => void;
  isEditingSelf: boolean;
}

const StatBox: React.FC<{ label: string; value: number | string; color?: string }> = ({ label, value, color = 'text-text-primary' }) => (
    <div className="bg-secondary p-4 rounded-lg text-center flex-1">
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        <div className="text-xs text-text-secondary uppercase font-semibold mt-1">{label}</div>
    </div>
);

const ProgressBar: React.FC<{ value: number; color: string }> = ({ value, color }) => (
    <div className="w-full bg-secondary rounded-full h-2.5">
        <div className={`${color} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}></div>
    </div>
);

const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onClose, onUpdateUser, isEditingSelf }) => {
  const { t } = useTranslation();
  const { state } = useAppContext();
  const { tasks: allTasks } = state;
  const [editedUser, setEditedUser] = useState(user);
  const [activeTab, setActiveTab] = useState<'profile' | 'performance' | 'activity'>('profile');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [newSkill, setNewSkill] = useState('');
  const timeAgo = useTimeAgo();

  useEffect(() => {
    setEditedUser(user);
  }, [user]);

  // Performance Metrics Calculation
  const userStats = useMemo(() => {
      const userTasks = allTasks.filter(t => t.assigneeId === user.id);
      const total = userTasks.length;
      const completed = userTasks.filter(t => t.status === Status.Done).length;
      const inProgress = userTasks.filter(t => t.status === Status.InProgress).length;
      
      // Calculate on-time completion
      const completedTasks = userTasks.filter(t => t.status === Status.Done);
      const onTime = completedTasks.filter(t => new Date(t.dueDate) >= new Date()).length; // Rough estimate: today vs due date logic usually needs completedAt timestamp
      
      const overdue = userTasks.filter(t => t.status !== Status.Done && new Date(t.dueDate) < new Date()).length;

      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return { total, completed, inProgress, overdue, completionRate, onTime };
  }, [allTasks, user.id]);

  const userActivity = useMemo(() => {
      // Gather activity logs from all tasks relevant to this user
      // In a real backend, this would be a separate API call
      let logs: { taskId: string; taskTitle: string; text: string; timestamp: string }[] = [];
      allTasks.forEach(task => {
          if (task.activityLog) {
              task.activityLog.forEach(log => {
                  if (log.user.id === user.id) {
                      logs.push({
                          taskId: task.id,
                          taskTitle: task.title,
                          text: log.text,
                          timestamp: log.timestamp
                      });
                  }
              });
          }
      });
      return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 20);
  }, [allTasks, user.id]);

  const handleSave = () => {
    if (!editedUser.name.trim()) {
        alert(t('modals.usernameEmptyError'));
        return;
    }
    onUpdateUser({ ...editedUser, name: editedUser.name.trim() });
    onClose();
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setEditedUser(prev => ({...prev, avatar: reader.result as string }));
        };
        reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
      avatarInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && newSkill.trim()) {
          e.preventDefault();
          if (!editedUser.skills?.includes(newSkill.trim())) {
            setEditedUser(prev => ({
                ...prev,
                skills: [...(prev.skills || []), newSkill.trim()]
            }));
          }
          setNewSkill('');
      }
  };

  const removeSkill = (skillToRemove: string) => {
      setEditedUser(prev => ({
          ...prev,
          skills: prev.skills?.filter(s => s !== skillToRemove) || []
      }));
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-end md:items-center z-50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-surface w-full h-full md:h-[85vh] md:max-w-3xl md:rounded-xl shadow-2xl flex flex-col animate-scaleIn overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Avatar & Cover feel */}
        <div className="bg-gradient-to-r from-primary/20 to-secondary/50 p-6 flex flex-col sm:flex-row items-center gap-6 border-b border-border relative">
             <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-white" aria-label={t('common.close')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="relative group">
                <AvatarWithStatus user={editedUser} className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-surface" />
                <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                <button 
                    onClick={handleAvatarClick}
                    className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 hover:bg-primary-focus transition-transform duration-200 transform hover:scale-110 shadow-md"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
                </button>
            </div>
            <div className="text-center sm:text-left flex-grow">
                <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">{editedUser.name}</h2>
                <p className="text-text-secondary text-lg">{editedUser.title}</p>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                     <span className="bg-secondary/80 px-3 py-1 rounded-full text-xs font-medium text-text-secondary">{editedUser.team}</span>
                     <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-medium">{t(`common.${editedUser.role.toLowerCase()}`)}</span>
                </div>
            </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-border bg-surface px-6">
            <button onClick={() => setActiveTab('profile')} className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>
                {t('modals.profile')}
            </button>
            <button onClick={() => setActiveTab('performance')} className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'performance' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>
                {t('modals.performance')}
            </button>
             <button onClick={() => setActiveTab('activity')} className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'activity' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>
                {t('modals.activity')}
            </button>
        </div>

        <main className="p-6 overflow-y-auto flex-grow bg-background/50">
            {activeTab === 'profile' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs uppercase font-bold text-text-secondary mb-1 block">{t('modals.fullName')}</label>
                            <input name="name" type="text" value={editedUser.name} onChange={handleInputChange} className="w-full p-2 bg-secondary rounded-md border border-border focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                             <label className="text-xs uppercase font-bold text-text-secondary mb-1 block">{t('modals.jobTitle')}</label>
                            <input name="title" type="text" value={editedUser.title} onChange={handleInputChange} className="w-full p-2 bg-secondary rounded-md border border-border focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                            <label className="text-xs uppercase font-bold text-text-secondary mb-1 block">{t('modals.email')}</label>
                            <input name="email" type="email" value={editedUser.email} onChange={handleInputChange} className="w-full p-2 bg-secondary rounded-md border border-border focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                             <label className="text-xs uppercase font-bold text-text-secondary mb-1 block">{t('modals.team')}</label>
                            <input name="team" type="text" value={editedUser.team} onChange={handleInputChange} className="w-full p-2 bg-secondary rounded-md border border-border focus:ring-primary focus:border-primary" />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs uppercase font-bold text-text-secondary mb-1 block">{t('modals.skills')}</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {editedUser.skills?.map((skill, i) => (
                                <span key={i} className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm flex items-center gap-1">
                                    {skill}
                                    <button onClick={() => removeSkill(skill)} className="hover:text-red-500"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414 1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
                                </span>
                            ))}
                            <input 
                                type="text" 
                                value={newSkill} 
                                onChange={(e) => setNewSkill(e.target.value)} 
                                onKeyDown={handleAddSkill}
                                placeholder={t('modals.addSkill')} 
                                className="bg-transparent text-sm focus:outline-none min-w-[100px]" 
                            />
                        </div>
                        <div className="h-px bg-border w-full"></div>
                    </div>

                    <div>
                        <label className="text-xs uppercase font-bold text-text-secondary mb-1 block">{t('modals.aboutMe')}</label>
                        <textarea name="bio" value={editedUser.bio} onChange={handleInputChange} rows={4} className="w-full p-2 bg-secondary rounded-md border border-border focus:ring-primary focus:border-primary" placeholder={t('modals.aboutMePlaceholder')} />
                    </div>
                </div>
            )}

            {activeTab === 'performance' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="flex flex-wrap gap-4">
                        <StatBox label={t('modals.tasksCompleted')} value={userStats.completed} color="text-green-400" />
                        <StatBox label={t('common.inProgress')} value={userStats.inProgress} color="text-yellow-400" />
                        <StatBox label={t('modals.overdueTasks')} value={userStats.overdue} color="text-red-400" />
                        <StatBox label={t('modals.totalWorkload')} value={userStats.total} />
                    </div>

                    <div className="bg-surface p-6 rounded-lg border border-border">
                        <h3 className="font-semibold text-text-primary mb-4">{t('modals.performanceOverview')}</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-text-secondary">{t('modals.completionRate')}</span>
                                    <span className="font-bold text-text-primary">{userStats.completionRate}%</span>
                                </div>
                                <ProgressBar value={userStats.completionRate} color="bg-green-500" />
                            </div>
                             <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-text-secondary">{t('modals.onTimeCompletion')}</span>
                                    <span className="font-bold text-text-primary">{userStats.total > 0 ? Math.round((userStats.onTime / userStats.completed) * 100) || 0 : 0}%</span>
                                </div>
                                <ProgressBar value={userStats.total > 0 ? Math.round((userStats.onTime / userStats.completed) * 100) || 0 : 0} color="bg-blue-500" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'activity' && (
                <div className="space-y-4 animate-fadeIn">
                    {userActivity.length > 0 ? (
                        <div className="relative pl-4 border-l-2 border-border space-y-6">
                            {userActivity.map((log, index) => (
                                <div key={index} className="relative">
                                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-surface"></div>
                                    <div className="text-sm text-text-primary">
                                        <span className="font-medium">{log.text}</span> en <span className="italic text-text-secondary">"{log.taskTitle}"</span>
                                    </div>
                                    <div className="text-xs text-text-secondary mt-0.5">{timeAgo(log.timestamp)}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-text-secondary py-10 italic">{t('modals.noActivity')}</div>
                    )}
                </div>
            )}
        </main>

        <footer className="p-4 sm:p-6 border-t border-border flex justify-end gap-3 bg-surface">
            <button onClick={onClose} className="px-4 py-2 bg-secondary text-text-primary font-semibold rounded-lg hover:bg-secondary-focus transition-colors duration-200">
                {t('common.cancel')}
            </button>
            <button onClick={handleSave} className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-focus transition-colors duration-200">
                {t('modals.saveChanges')}
            </button>
        </footer>
      </div>
    </div>
  );
};

export default UserProfileModal;