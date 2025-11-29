
import React, { useMemo, useState, useEffect } from 'react';
import { User, Role, Task, Status } from '../../types';
import AvatarWithStatus from '../AvatarWithStatus';
import { useAppContext } from '../../contexts/AppContext';
import { useTranslation } from '../../i18n';
import StatCard from './StatCard';

// --- Subcomponents ---

const RoleBadge: React.FC<{ role: Role }> = ({ role }) => {
    const { t } = useTranslation();
    const config = {
        [Role.Admin]: 'bg-red-500/10 text-red-500 border-red-500/20',
        [Role.Manager]: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        [Role.Member]: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        [Role.Viewer]: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        [Role.Guest]: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    };

    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${config[role]}`}>
            {t(`common.${role.toLowerCase()}`)}
        </span>
    );
};

const Toggle: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void }> = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between py-5 border-b border-white/5 last:border-0">
        <span className="text-sm font-medium text-slate-200">{label}</span>
        <button 
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-900 ${checked ? 'bg-primary' : 'bg-slate-700'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);

const AdminSidebar: React.FC<{ activeTab: string; onSelect: (tab: string) => void }> = ({ activeTab, onSelect }) => {
    const { t } = useTranslation();
    const tabs = [
        { id: 'overview', label: t('admin.overview'), icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
        { id: 'users', label: t('admin.users'), icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
        { id: 'settings', label: t('admin.globalSettings'), icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
        { id: 'audit', label: t('admin.auditLog'), icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
        { id: 'billing', label: t('admin.billing'), icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
    ];

    return (
        <aside className="w-full md:w-64 bg-slate-900/50 md:border-r border-b md:border-b-0 border-white/10 flex flex-col md:h-full backdrop-blur-md flex-shrink-0 z-20">
            <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse"></span>
                    <span className="hidden md:inline">{t('header.appAdmin')}</span>
                    <span className="md:hidden">Admin</span>
                </h2>
            </div>
            <nav className="flex md:flex-col overflow-x-auto md:overflow-visible p-2 md:p-4 space-x-2 md:space-x-0 md:space-y-1 no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => onSelect(tab.id)}
                        className={`flex-shrink-0 flex items-center px-3 py-2 md:px-4 md:py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeTab === tab.id ? 'bg-primary/20 text-primary border border-primary/30 shadow-lg shadow-primary/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <span className={`mr-2 md:mr-3 ${activeTab === tab.id ? 'text-primary' : 'text-slate-500'}`}>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </nav>
            <div className="hidden md:block p-4 border-t border-white/10 mt-auto">
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    {t('admin.allSystemsOperational')}
                </div>
            </div>
        </aside>
    );
};

const SystemActivityChart: React.FC = () => {
    return (
        <div className="w-full h-48 flex items-end gap-1">
             {Array.from({ length: 40 }).map((_, i) => {
                 const height = Math.floor(Math.random() * 80) + 20;
                 return (
                     <div key={i} className="flex-1 bg-primary/30 hover:bg-primary transition-all duration-300 rounded-t-sm relative group" style={{ height: `${height}%` }}>
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none z-10 whitespace-nowrap transition-opacity">
                            {height} reqs
                        </div>
                     </div>
                 )
             })}
        </div>
    )
}

// --- Tabs Content ---

const OverviewTabContent: React.FC<{ stats: any }> = ({ stats }) => {
    const { t } = useTranslation();
    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8 animate-fadeIn h-full overflow-y-auto pb-24 md:pb-8">
            <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{t('admin.overview')}</h2>
                <p className="text-slate-400 text-sm md:text-base">Real-time system performance and user metrics.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-slate-800/50 border border-white/5 p-5 rounded-2xl hover:border-primary/30 transition-colors">
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{t('admin.totalUsers')}</p>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl md:text-3xl font-bold text-white">{stats.total}</span>
                        <span className="text-emerald-400 text-xs font-bold">+12%</span>
                    </div>
                </div>
                 <div className="bg-slate-800/50 border border-white/5 p-5 rounded-2xl hover:border-primary/30 transition-colors">
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{t('admin.activeMembers')}</p>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl md:text-3xl font-bold text-white">{stats.active}</span>
                        <span className="text-emerald-400 text-xs font-bold">+5%</span>
                    </div>
                </div>
                 <div className="bg-slate-800/50 border border-white/5 p-5 rounded-2xl hover:border-primary/30 transition-colors">
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{t('common.admin')}</p>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl md:text-3xl font-bold text-white">{stats.admins}</span>
                    </div>
                </div>
                 <div className="bg-slate-800/50 border border-white/5 p-5 rounded-2xl hover:border-primary/30 transition-colors">
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{t('admin.newMembers')}</p>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl md:text-3xl font-bold text-white">{stats.newUsers}</span>
                        <span className="text-slate-500 text-xs font-bold">This Month</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-800/50 p-6 rounded-2xl border border-white/10 shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-white">{t('admin.systemActivity')}</h3>
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-primary"></div>
                            <span className="text-xs text-slate-400">Requests</span>
                        </div>
                    </div>
                    <SystemActivityChart />
                </div>
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/10 shadow-xl flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-6">{t('admin.systemHealth')}</h3>
                        
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm mb-2 text-slate-400">
                                    <span>{t('admin.apiUsage')}</span>
                                    <span className="text-white font-medium">68%</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                    <div className="bg-blue-500 h-2 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: '68%' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-2 text-slate-400">
                                    <span>{t('admin.storage')}</span>
                                    <span className="text-white font-medium">42%</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                    <div className="bg-purple-500 h-2 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" style={{ width: '42%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                     
                     <div className="pt-4 border-t border-white/10 mt-4">
                         <div className="flex items-center gap-2">
                             <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                             <p className="text-xs text-slate-400">Last backup: <span className="text-white">2 hours ago</span></p>
                         </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

const UserTable: React.FC<{
    users: User[];
    currentUser: User;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onUpdateRole: (id: string, role: Role) => void;
    isLastAdmin: (user: User) => boolean;
    selectedUserIds: Set<string>;
    toggleSelection: (id: string) => void;
}> = ({ users, currentUser, onEdit, onDelete, onUpdateRole, isLastAdmin, selectedUserIds, toggleSelection }) => {
    const { t } = useTranslation();

    return (
        <div className="overflow-x-auto bg-slate-800/30 rounded-xl border border-white/10">
            <table className="w-full text-sm text-left text-slate-400">
                <thead className="text-xs text-slate-500 uppercase bg-white/5 border-b border-white/10">
                    <tr>
                        <th scope="col" className="p-4 w-4"></th>
                        <th scope="col" className="px-6 py-3">{t('common.name')}</th>
                        <th scope="col" className="px-6 py-3 hidden sm:table-cell">{t('common.status')}</th>
                        <th scope="col" className="px-6 py-3 hidden md:table-cell">{t('common.role')}</th>
                        <th scope="col" className="px-6 py-3 hidden lg:table-cell">{t('common.team')}</th>
                        <th scope="col" className="px-6 py-3 text-right">{t('common.actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${selectedUserIds.has(user.id) ? 'bg-primary/10' : ''}`}>
                            <td className="w-4 p-4">
                                <div className="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 text-primary bg-transparent border-slate-600 rounded focus:ring-primary focus:ring-offset-0"
                                        checked={selectedUserIds.has(user.id)}
                                        onChange={() => toggleSelection(user.id)}
                                    />
                                </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                                <div className="flex items-center">
                                    <AvatarWithStatus user={user} className="w-8 h-8 mr-3" />
                                    <div>
                                        <div className="text-base font-semibold">{user.name}</div>
                                        <div className="font-normal text-slate-500 text-xs">{user.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 hidden sm:table-cell">
                                <div className="flex items-center">
                                    <div className={`h-2 w-2 rounded-full mr-2 ${user.status === 'Online' ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : user.status === 'Busy' ? 'bg-red-500' : 'bg-slate-500'}`}></div>
                                    {t(`common.${user.status.toLowerCase()}`)}
                                </div>
                            </td>
                            <td className="px-6 py-4 hidden md:table-cell">
                                {user.role === Role.Manager ? (
                                    <RoleBadge role={Role.Manager} />
                                ) : (
                                    <select
                                        value={user.role}
                                        onChange={(e) => onUpdateRole(user.id, e.target.value as Role)}
                                        disabled={user.id === currentUser.id || isLastAdmin(user)}
                                        className="bg-slate-900/50 border border-white/10 text-white text-xs rounded-lg focus:ring-primary focus:border-primary block p-1.5"
                                    >
                                        {Object.values(Role).map((role) => (
                                            <option key={role} value={role}>{t(`common.${role.toLowerCase()}`)}</option>
                                        ))}
                                    </select>
                                )}
                            </td>
                            <td className="px-6 py-4 hidden lg:table-cell">
                                {user.team}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={() => onEdit(user.id)} className="font-medium text-blue-400 hover:text-blue-300 mr-3 transition-colors">{t('common.edit')}</button>
                                <button 
                                    onClick={() => onDelete(user.id)} 
                                    className="font-medium text-red-500 hover:text-red-400 disabled:opacity-50 disabled:hover:text-red-500 transition-colors"
                                    disabled={user.id === currentUser.id || isLastAdmin(user)}
                                >
                                    {t('common.delete')}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const UsersTabContent: React.FC<{
    users: User[];
    currentUser: User;
    tasks: Task[];
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onBulkDelete: (ids: string[]) => void;
    onUpdateRole: (id: string, role: Role) => void;
    isLastAdmin: (user: User) => boolean;
    onCreateUser: (name: string, role: Role) => void;
}> = ({ users, currentUser, tasks, onEdit, onDelete, onBulkDelete, onUpdateRole, isLastAdmin, onCreateUser }) => {
    const { t } = useTranslation();
    const [filterRole, setFilterRole] = useState<Role | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  u.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = filterRole === 'all' || u.role === filterRole;
            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, filterRole]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    
    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredUsers.slice(start, start + itemsPerPage);
    }, [filteredUsers, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterRole]);

    const toggleSelection = (userId: string) => {
        setSelectedUserIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(userId)) newSet.delete(userId);
            else newSet.add(userId);
            return newSet;
        });
    };

    const handleBulkDeleteClick = () => {
        onBulkDelete(Array.from(selectedUserIds));
        setSelectedUserIds(new Set());
    };

    return (
        <div className="p-4 md:p-8 space-y-6 h-full flex flex-col overflow-y-auto pb-24 md:pb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800/40 p-5 rounded-2xl border border-white/10">
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-grow w-full sm:w-auto group">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input 
                            type="text" 
                            placeholder={t('sidebar.search')} 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent w-full md:w-72 transition-all shadow-sm"
                        />
                    </div>
                    <select 
                        value={filterRole} 
                        onChange={(e) => setFilterRole(e.target.value as Role | 'all')}
                        className="bg-slate-900 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:ring-2 focus:ring-primary w-full sm:w-auto"
                    >
                        <option value="all">{t('common.allStatuses')}</option>
                        {Object.values(Role).map(r => <option key={r} value={r}>{t(`common.${r.toLowerCase()}`)}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    {selectedUserIds.size > 0 && (
                         <div className="flex items-center gap-2 animate-fadeIn bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                             <span className="text-sm font-semibold text-red-400">{t('admin.selectedUsers', {count: selectedUserIds.size})}</span>
                             <button onClick={handleBulkDeleteClick} className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors underline">
                                {t('common.delete')}
                             </button>
                         </div>
                    )}
                    <button 
                        onClick={() => {
                            const name = prompt(t('modals.fullName'));
                            if(name) onCreateUser(name, Role.Member);
                        }}
                        className="bg-primary hover:bg-primary-focus text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 transition-all flex items-center gap-2 hover:scale-[1.02]"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        {t('modals.addMember')}
                    </button>
                </div>
            </div>

            <div className="flex-grow flex flex-col">
                <UserTable 
                    users={paginatedUsers} 
                    currentUser={currentUser} 
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onUpdateRole={onUpdateRole}
                    isLastAdmin={isLastAdmin}
                    selectedUserIds={selectedUserIds}
                    toggleSelection={toggleSelection}
                />
                
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4 px-2">
                        <span className="text-sm text-slate-400">
                            {t('common.page')} <span className="font-semibold text-white">{currentPage}</span> {t('common.of')} <span className="font-semibold text-white">{totalPages}</span>
                        </span>
                        <div className="inline-flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 text-sm font-medium bg-slate-800 border border-white/10 rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
                            >
                                {t('common.previous')}
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 text-sm font-medium bg-slate-800 border border-white/10 rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
                            >
                                {t('common.next')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const SettingsTabContent: React.FC = () => {
    const { t } = useTranslation();
    const [guestAccess, setGuestAccess] = useState(false);
    const [publicProjects, setPublicProjects] = useState(false);
    const [enforce2FA, setEnforce2FA] = useState(false);

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto animate-fadeIn h-full overflow-y-auto pb-24 md:pb-10">
            <h2 className="text-3xl font-bold text-white mb-2">{t('admin.globalSettings')}</h2>
            <p className="text-slate-400 mb-8">Manage organization-wide configurations and security policies.</p>
            
            <div className="bg-slate-800/40 rounded-2xl border border-white/10 p-6 md:p-8 mb-8 shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    {t('admin.branding')}
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">{t('admin.workspaceName')}</label>
                        <input type="text" defaultValue="Zenith Workspace" className="w-full p-3 bg-slate-900 rounded-xl border border-white/10 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                    </div>
                </div>
            </div>

            <div className="bg-slate-800/40 rounded-2xl border border-white/10 p-6 md:p-8 mb-8 shadow-lg">
                 <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    {t('admin.accessControl')}
                 </h3>
                 <Toggle label={t('admin.allowGuestAccess')} checked={guestAccess} onChange={setGuestAccess} />
                 <Toggle label={t('admin.publicProjects')} checked={publicProjects} onChange={setPublicProjects} />
            </div>

            <div className="bg-slate-800/40 rounded-2xl border border-white/10 p-6 md:p-8 shadow-lg">
                 <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    {t('admin.security')}
                 </h3>
                 <Toggle label={t('admin.enforce2FA')} checked={enforce2FA} onChange={setEnforce2FA} />
            </div>
        </div>
    )
};

const AuditLogTabContent: React.FC = () => {
    const { t } = useTranslation();
    // Mock data
    const logs = [
        { id: 1, user: 'Alex Morgan', action: 'admin.auditAction_create_project', target: 'Website Redesign', time: new Date().toISOString() },
        { id: 2, user: 'Sarah Jenkins', action: 'admin.auditAction_delete_user', target: 'John Doe', time: new Date(Date.now() - 86400000).toISOString() },
        { id: 3, user: 'Mike Ross', action: 'admin.auditAction_change_role', target: 'Sarah Jenkins -> Admin', time: new Date(Date.now() - 172800000).toISOString() },
        { id: 4, user: 'Alex Morgan', action: 'admin.auditAction_create_project', target: 'Q4 Marketing', time: new Date(Date.now() - 200000000).toISOString() },
        { id: 5, user: 'System', action: 'Backup Completed', target: 'Database', time: new Date(Date.now() - 250000000).toISOString() },
    ];

    return (
        <div className="p-4 md:p-8 animate-fadeIn h-full overflow-y-auto pb-24 md:pb-8">
             <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{t('admin.auditLog')}</h2>
                <p className="text-slate-400 mb-8 text-sm md:text-base">Track all important activities within the workspace.</p>
            </div>
            <div className="bg-slate-800/30 rounded-2xl border border-white/10 overflow-hidden shadow-lg overflow-x-auto">
                 <table className="w-full text-sm text-left text-slate-400 min-w-[600px]">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-900/50 border-b border-white/10">
                        <tr>
                            <th className="px-6 py-4">{t('admin.user')}</th>
                            <th className="px-6 py-4">{t('admin.userAction')}</th>
                            <th className="px-6 py-4">{t('admin.details')}</th>
                            <th className="px-6 py-4">{t('admin.timestamp')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-medium text-white">{log.user}</td>
                                <td className="px-6 py-4">{log.action.startsWith('admin.') ? t(log.action) : log.action}</td>
                                <td className="px-6 py-4 text-slate-300">{log.target}</td>
                                <td className="px-6 py-4 font-mono text-xs text-slate-500">{new Date(log.time).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
            </div>
        </div>
    )
}

// --- Main Component ---

const AppAdminPanel: React.FC = () => {
    const { state, actions } = useAppContext();
    const { users, currentUser, tasks, isAdminPanelOpen } = state;
    const { 
        handleUpdateUserRole, 
        handleDeleteUser, 
        handleCreateUser,
        setEditingUserId,
        setIsAdminPanelOpen,
        handleBulkDeleteUsers
    } = actions;
    const [activeTab, setActiveTab] = useState('overview');
    
    // Stats calculation
    const stats = useMemo(() => {
        const total = users.length;
        const active = users.filter(u => u.status !== 'Offline').length;
        const admins = users.filter(u => u.role === Role.Admin).length;
        const newUsers = users.length; 
        return { total, active, admins, newUsers };
    }, [users]);
    
    const isLastAdmin = (user: User) => user.role === Role.Admin && stats.admins <= 1;

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsAdminPanelOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setIsAdminPanelOpen]);

    if (!isAdminPanelOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex justify-center items-center p-0 md:p-4 animate-fadeIn">
            <div 
                className="bg-[#0f172a] w-[100vw] h-[100vh] md:w-[95vw] md:h-[90vh] md:rounded-3xl shadow-2xl border-none md:border border-white/10 overflow-hidden flex flex-col md:flex-row animate-scaleIn relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button - Fixed position on Mobile to ensure visibility */}
                <button 
                    onClick={() => setIsAdminPanelOpen(false)}
                    className="absolute top-4 right-4 z-50 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-all shadow-lg border border-white/10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Sidebar */}
                <AdminSidebar activeTab={activeTab} onSelect={setActiveTab} />
                
                {/* Content */}
                <main className="flex-grow relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-100 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900/90"></div> {/* Overlay for readability over noise */}
                    <div className="relative h-full overflow-y-auto">
                        {activeTab === 'overview' && <OverviewTabContent stats={stats} />}
                        {activeTab === 'users' && (
                            <UsersTabContent 
                                users={users}
                                currentUser={currentUser!}
                                tasks={tasks}
                                onEdit={setEditingUserId}
                                onDelete={handleDeleteUser}
                                onBulkDelete={handleBulkDeleteUsers}
                                onUpdateRole={handleUpdateUserRole}
                                isLastAdmin={isLastAdmin}
                                onCreateUser={handleCreateUser}
                            />
                        )}
                        {activeTab === 'settings' && <SettingsTabContent />}
                        {activeTab === 'audit' && <AuditLogTabContent />}
                        {activeTab === 'billing' && (
                            <div className="p-20 flex flex-col items-center justify-center text-center h-full animate-fadeIn">
                                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-white/10">
                                    <svg className="w-10 h-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Billing Module</h2>
                                <p className="text-slate-400 max-w-md">Manage invoices, payment methods, and subscription plans. Currently under maintenance.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default AppAdminPanel;
