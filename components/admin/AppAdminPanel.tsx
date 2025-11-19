
import React, { useMemo, useState } from 'react';
import { User, Role, Task, Status, Priority } from '../../types';
import Header from '../Header';
import AvatarWithStatus from '../AvatarWithStatus';
import { useAppContext } from '../../contexts/AppContext';
import { useTranslation } from '../../i18n';

const RoleDescription: React.FC<{ role: Role, description: string }> = ({ role, description }) => {
    const { t } = useTranslation();
    const roleConfig = {
        [Role.Admin]: { color: 'text-red-400', name: t('common.admin') },
        [Role.Member]: { color: 'text-blue-400', name: t('common.member') },
        [Role.Viewer]: { color: 'text-yellow-400', name: t('common.viewer') },
        [Role.Guest]: { color: 'text-gray-400', name: t('common.guest') },
    };

    return (
        <div>
            <h4 className={`font-semibold ${roleConfig[role].color}`}>{roleConfig[role].name}</h4>
            <p className="text-sm text-text-secondary">{description}</p>
        </div>
    );
};

const UserCard: React.FC<{ 
    user: User, 
    tasks: Task[], 
    currentUser: User, 
    onEdit: () => void, 
    onDelete: () => void,
    onUpdateRole: (role: Role) => void,
    isLastAdmin: boolean 
}> = ({ user, tasks, currentUser, onEdit, onDelete, onUpdateRole, isLastAdmin }) => {
    const { t } = useTranslation();
    const activeTasks = tasks.filter(t => t.assigneeId === user.id && t.status !== Status.Done).length;
    const completedTasks = tasks.filter(t => t.assigneeId === user.id && t.status === Status.Done);
    const totalCompleted = completedTasks.length;
    
    // Calculate reliability: tasks completed on or before due date
    const onTimeTasks = completedTasks.filter(t => {
        if (!t.dueDate) return true;
        // A simple check: if today is past due date and it's done. 
        // Real apps would check a 'completedAt' timestamp vs 'dueDate'.
        // Here we assume if it's Done, it was done recently. 
        // To make it more visual with mock data, we'll simulate a score based on overdue count for active tasks + done tasks
        return new Date(t.dueDate) >= new Date(); 
    }).length;

    const reliabilityScore = totalCompleted > 0 ? Math.round((onTimeTasks / totalCompleted) * 100) : 100;

    const maxCapacity = 8; // Arbitrary capacity for visualization
    const workloadPercentage = Math.min((activeTasks / maxCapacity) * 100, 100);
    
    const workloadColor = workloadPercentage > 80 ? 'bg-red-500' : workloadPercentage > 50 ? 'bg-yellow-500' : 'bg-green-500';
    const reliabilityColor = reliabilityScore > 80 ? 'bg-green-500' : reliabilityScore > 50 ? 'bg-yellow-500' : 'bg-red-500';

    return (
        <div className="bg-secondary p-4 rounded-lg border border-border hover:border-primary/50 transition-all">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <AvatarWithStatus user={user} className="w-12 h-12" />
                    <div className="min-w-0">
                        <div className="font-bold text-text-primary truncate">{user.name}</div>
                        <div className="text-xs text-text-secondary truncate">{user.email}</div>
                        <div className="text-xs text-primary mt-0.5 truncate">{user.title}</div>
                    </div>
                </div>
                {user.id !== currentUser.id && (
                    <div className="flex gap-1 flex-shrink-0">
                        <button onClick={onEdit} className="p-1.5 text-text-secondary hover:text-blue-400 rounded-md hover:bg-blue-500/10">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                        </button>
                         <button onClick={onDelete} disabled={isLastAdmin} className="p-1.5 text-text-secondary hover:text-red-400 rounded-md hover:bg-red-500/10 disabled:opacity-50">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                    <div className="text-xs text-text-secondary">{t('admin.role')}</div>
                     <select
                        value={user.role}
                        onChange={(e) => onUpdateRole(e.target.value as Role)}
                        disabled={user.id === currentUser.id || isLastAdmin}
                        className="w-full mt-1 bg-surface border border-border rounded px-2 py-1 text-xs focus:ring-primary focus:border-primary disabled:opacity-50"
                    >
                        {Object.values(Role).map((role) => <option key={role} value={role}>{t(`common.${role.toLowerCase()}`)}</option>)}
                    </select>
                </div>
                 <div>
                    <div className="text-xs text-text-secondary">{t('admin.team')}</div>
                    <div className="font-medium text-text-primary mt-1 truncate bg-surface px-2 py-1 rounded border border-border text-xs">{user.team}</div>
                </div>
            </div>
            
            <div className="space-y-3">
                 <div>
                     <div className="flex justify-between text-xs text-text-secondary mb-1">
                        <span>{t('admin.workload')}</span>
                        <span>{activeTasks} {t('common.tasks')}</span>
                     </div>
                     <div className="w-full bg-surface rounded-full h-1.5">
                        <div className={`${workloadColor} h-1.5 rounded-full transition-all`} style={{ width: `${workloadPercentage}%` }}></div>
                     </div>
                 </div>
                 <div>
                     <div className="flex justify-between text-xs text-text-secondary mb-1">
                        <span>{t('modals.reliability')}</span>
                        <span>{reliabilityScore}%</span>
                     </div>
                     <div className="w-full bg-surface rounded-full h-1.5">
                        <div className={`${reliabilityColor} h-1.5 rounded-full transition-all`} style={{ width: `${reliabilityScore}%` }}></div>
                     </div>
                 </div>
            </div>
        </div>
    )
}


const AppAdminPanel: React.FC = () => {
    const { t } = useTranslation();
    const { state, actions } = useAppContext();
    const { users, currentUser, tasks } = state;
    const { 
        handleUpdateUserRole, 
        handleDeleteUser, 
        handleCreateUser,
        setEditingUserId,
    } = actions;

    const [newUserName, setNewUserName] = useState('');
    const [newUserRole, setNewUserRole] = useState<Role>(Role.Member);
    const [filterRole, setFilterRole] = useState<Role | 'all'>('all');
    const [filterTeam, setFilterTeam] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const adminCount = useMemo(() => users.filter(u => u.role === Role.Admin).length, [users]);
    const teams = useMemo(() => Array.from(new Set(users.map(u => u.team).filter(Boolean))), [users]);

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  u.title.toLowerCase().includes(searchTerm.toLowerCase());
            if (!matchesSearch) return false;
            if (filterRole !== 'all' && u.role !== filterRole) return false;
            if (filterTeam !== 'all' && u.team !== filterTeam) return false;
            return true;
        });
    }, [users, filterRole, filterTeam, searchTerm]);

    const handleAddUser = () => {
        if (newUserName.trim() === '') {
            actions.addToast({ message: t('modals.usernameEmptyError'), type: 'error' });
            return;
        }
        handleCreateUser(newUserName.trim(), newUserRole);
        setNewUserName('');
        setNewUserRole(Role.Member);
    };
    
    return (
        <main className="flex-grow flex flex-col h-full overflow-y-auto">
            <Header title={t('header.appAdmin')} />
            <div className="flex-grow p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: User Management */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Filters & Search */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center bg-surface p-2 rounded-lg border border-border">
                        <div className="relative flex-grow">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </span>
                            <input 
                                type="text" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={t('modals.searchUsers')}
                                className="w-full bg-secondary border-none rounded-md py-2 pl-9 pr-2 text-sm focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto">
                             <select 
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value as Role | 'all')}
                                className="bg-secondary border-none rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary cursor-pointer"
                             >
                                <option value="all">{t('modals.filterByRole')}</option>
                                {Object.values(Role).map(r => <option key={r} value={r}>{t(`common.${r.toLowerCase()}`)}</option>)}
                             </select>
                             <select 
                                value={filterTeam}
                                onChange={(e) => setFilterTeam(e.target.value)}
                                className="bg-secondary border-none rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary cursor-pointer"
                             >
                                <option value="all">{t('modals.filterByTeam')}</option>
                                {teams.map(team => <option key={team} value={team}>{team}</option>)}
                             </select>
                        </div>
                    </div>
                    
                    <div className="bg-surface rounded-lg p-6 animate-fadeIn min-h-[500px]">
                        <h2 className="text-xl font-semibold mb-4 flex justify-between items-center">
                            {t('admin.manageUsers')}
                            <span className="text-sm font-normal text-text-secondary bg-secondary px-2 py-1 rounded-full">{filteredUsers.length}</span>
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredUsers.map(user => {
                                const isLastAdmin = user.role === Role.Admin && adminCount <= 1;
                                return (
                                    <UserCard 
                                        key={user.id}
                                        user={user}
                                        tasks={tasks}
                                        currentUser={currentUser}
                                        onEdit={() => setEditingUserId(user.id)}
                                        onDelete={() => handleDeleteUser(user.id)}
                                        onUpdateRole={(role) => handleUpdateUserRole(user.id, role)}
                                        isLastAdmin={isLastAdmin}
                                    />
                                );
                            })}
                             {filteredUsers.length === 0 && (
                                <div className="col-span-full text-center p-8 text-text-secondary italic">
                                    {t('admin.noUsersWithFilter')}
                                </div>
                             )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Add User & Role Descriptions */}
                <div className="lg:col-span-1 space-y-6 h-fit">
                    <div className="bg-surface rounded-lg p-6 animate-fadeIn">
                        <h2 className="text-xl font-semibold mb-4">{t('modals.addMember')}</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="newUserName" className="text-sm font-medium text-text-secondary">{t('modals.fullName')}</label>
                                <input
                                    id="newUserName"
                                    type="text"
                                    value={newUserName}
                                    onChange={(e) => setNewUserName(e.target.value)}
                                    placeholder={t('modals.fullName')}
                                    className="w-full mt-1 p-2 bg-secondary rounded-md border border-border focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <div>
                                <label htmlFor="newUserRole" className="text-sm font-medium text-text-secondary">{t('admin.role')}</label>
                                <select
                                    id="newUserRole"
                                    value={newUserRole}
                                    onChange={(e) => setNewUserRole(e.target.value as Role)}
                                    className="w-full mt-1 bg-secondary border border-border rounded-md p-2 focus:ring-primary focus:border-primary"
                                >
                                    {Object.values(Role).filter(r => r !== Role.Admin).map(role => (
                                        <option key={role} value={role}>{t(`common.${role.toLowerCase()}`)}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={handleAddUser}
                                className="w-full px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-focus transition-colors duration-200"
                            >
                                {t('modals.addUser')}
                            </button>
                        </div>
                    </div>
                    
                    <div className="bg-surface rounded-lg p-6 animate-fadeIn">
                        <h2 className="text-xl font-semibold mb-4">{t('admin.roleDescriptions')}</h2>
                        <div className="space-y-4">
                            <RoleDescription role={Role.Admin} description={t('admin.adminDescription')} />
                            <RoleDescription role={Role.Member} description={t('admin.memberDescription')} />
                            <RoleDescription role={Role.Viewer} description={t('admin.viewerDescription')} />
                            <RoleDescription role={Role.Guest} description={t('admin.guestDescription')} />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default AppAdminPanel;
