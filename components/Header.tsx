import React, { useState, useRef, useEffect } from 'react';
import { User, List, Role, Task, Notification } from '../types';
import GlobalSearch from './GlobalSearch';
import NotificationsPanel from './NotificationsPanel';
import AvatarWithStatus from './AvatarWithStatus';

interface HeaderProps {
    title: string;
    onToggleSidebar: () => void;
    isSidebarOpen: boolean;
    currentUser: User;
    onOpenUserProfile: () => void;
    selectedList?: List | null;
    onEditList?: (list: List) => void;
    onDeleteList?: (listId: string) => void;
    onGenerateSummary?: () => void;
    allTasks: Task[];
    allLists: List[];
    allUsers: User[];
    onSelectTask: (task: Task) => void;
    onNavigateToList: (listId: string) => void;
    setEditingUser: (user: User | null) => void;
    notifications: Notification[];
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const ProjectActionsMenu: React.FC<{
    list: List;
    onEdit: () => void;
    onDelete: () => void;
    onGenerateSummary: () => void;
}> = ({ onEdit, onDelete, onGenerateSummary }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(p => !p)} className="p-1.5 rounded-full hover:bg-secondary-focus">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-surface rounded-lg shadow-lg border border-border z-50 animate-fadeIn p-1">
                    <button onClick={() => { onGenerateSummary(); setIsOpen(false); }} className="w-full text-left p-2 rounded-md hover:bg-secondary-focus flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        Resumen con IA
                    </button>
                    <div className="my-1 h-px bg-border"></div>
                    <button onClick={() => { onEdit(); setIsOpen(false); }} className="w-full text-left p-2 rounded-md hover:bg-secondary-focus flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                        Editar Proyecto
                    </button>
                    <button onClick={() => { onDelete(); setIsOpen(false); }} className="w-full text-left p-2 rounded-md hover:bg-secondary-focus flex items-center text-sm text-red-400 hover:text-red-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                        Eliminar Proyecto
                    </button>
                </div>
            )}
        </div>
    );
};


const Header: React.FC<HeaderProps> = ({ 
    title, 
    onToggleSidebar, 
    isSidebarOpen,
    currentUser, 
    onOpenUserProfile, 
    selectedList, 
    onEditList, 
    onDeleteList, 
    onGenerateSummary,
    allTasks,
    allLists,
    allUsers,
    onSelectTask,
    onNavigateToList,
    setEditingUser,
    notifications,
    setNotifications,
}) => {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const notificationsPanelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationsPanelRef.current && !notificationsPanelRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <header className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-2 min-w-0">
                <button onClick={onToggleSidebar} className="p-1 text-text-secondary hover:text-text-primary" aria-label="Abrir barra lateral">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
                <h1 className="text-2xl font-bold text-text-primary truncate">{title}</h1>
                {selectedList && onEditList && onDeleteList && onGenerateSummary && currentUser.role !== Role.Guest && (
                    <ProjectActionsMenu
                        list={selectedList}
                        onEdit={() => onEditList(selectedList)}
                        onDelete={() => onDeleteList(selectedList.id)}
                        onGenerateSummary={onGenerateSummary}
                    />
                )}
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
                <GlobalSearch 
                    allTasks={allTasks}
                    allLists={allLists}
                    allUsers={allUsers}
                    onSelectTask={onSelectTask}
                    onSelectList={onNavigateToList}
                    onSelectUser={setEditingUser}
                />

                <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
                    className="flex-shrink-0 p-2 rounded-full hover:bg-secondary-focus text-text-secondary hover:text-text-primary transition-colors"
                    aria-label="Abrir paleta de comandos"
                    title="Comandos (⌘K)"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                </button>
                
                <div ref={notificationsPanelRef} className="relative">
                    {isNotificationsOpen && (
                        <NotificationsPanel
                            notifications={notifications}
                            setNotifications={setNotifications}
                            onClose={() => setIsNotificationsOpen(false)}
                            onSelectList={(listId) => {
                                onNavigateToList(listId);
                                setIsNotificationsOpen(false);
                            }}
                        />
                    )}
                    <button 
                        onClick={() => setIsNotificationsOpen(p => !p)} 
                        className="relative flex-shrink-0 p-2 rounded-full hover:bg-secondary-focus text-text-secondary hover:text-text-primary transition-colors"
                        aria-label="Toggle notifications"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-surface"></span>}
                    </button>
                </div>

                <button 
                    onClick={onOpenUserProfile}
                    className="flex items-center gap-3 p-1 rounded-full hover:bg-secondary-focus transition-colors"
                    aria-label="Abrir perfil de usuario"
                >
                    <span className="hidden sm:inline font-semibold text-text-primary">{currentUser.name}</span>
                    <AvatarWithStatus user={currentUser} className="w-9 h-9" />
                </button>
            </div>
      </header>
    );
}

export default Header;