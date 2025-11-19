
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { List, User, Role, Workspace, Folder, Permission } from '../types';
import UserPanel from './UserPanel';
import Logo from './Logo';
import AvatarWithStatus from './AvatarWithStatus';
import { useAppContext } from '../contexts/AppContext';
import { useTranslation } from '../i18n';

interface WorkspaceSwitcherProps {
    workspaces: Workspace[];
    selectedWorkspace: Workspace | undefined;
    onSelectWorkspace: (id: string) => void;
    onAddWorkspace: () => void;
    canManage: boolean;
}

const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({ workspaces, selectedWorkspace, onSelectWorkspace, onAddWorkspace, canManage }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);
    
    return (
      <div ref={wrapperRef} className="relative mb-2">
        <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="w-full flex items-center justify-between p-2 hover:bg-secondary-focus rounded-lg transition-colors group"
        >
            <div className="flex items-center min-w-0 gap-3">
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-primary-focus flex-shrink-0 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                     <span className="font-bold text-white text-lg">{selectedWorkspace?.name.charAt(0).toUpperCase()}</span>
                </div>
                <span className="font-bold text-text-primary truncate text-sm">{selectedWorkspace?.name}</span>
            </div>
            <svg className={`w-4 h-4 text-text-secondary transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        </button>

        {isOpen && (
            <div className="absolute top-full mt-1 left-0 w-full bg-surface rounded-lg shadow-xl border border-border z-40 animate-scaleIn origin-top">
                <ul className="py-1">
                    {workspaces.map(workspace => (
                        <li key={workspace.id}>
                            <button
                                onClick={() => {
                                    onSelectWorkspace(workspace.id);
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-secondary-focus flex items-center justify-between text-sm"
                            >
                                {workspace.name}
                                {workspace.id === selectedWorkspace?.id && (
                                    <svg className="w-4 h-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
                {canManage && (
                    <div className="p-2 border-t border-border">
                        <button 
                            onClick={() => {
                                onAddWorkspace();
                                setIsOpen(false);
                            }}
                            className="w-full text-left p-2 rounded-md hover:bg-secondary-focus flex items-center text-text-secondary hover:text-text-primary text-sm transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            {t('sidebar.newWorkspace')}
                        </button>
                    </div>
                )}
            </div>
        )}
      </div>
    );
};

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
    onClick: () => void;
    badge?: number | string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, isActive, onClick, badge }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200 group ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-secondary-focus text-text-secondary hover:text-text-primary'}`}
    >
        <span className={`mr-3 transition-colors ${isActive ? 'text-primary' : 'text-text-secondary group-hover:text-text-primary'}`}>
            {icon}
        </span>
        <span className={`font-medium text-sm flex-grow text-left ${isActive ? 'font-semibold' : ''}`}>{label}</span>
        {badge && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-primary text-white' : 'bg-surface text-text-secondary group-hover:bg-secondary'}`}>
                {badge}
            </span>
        )}
    </button>
);

const Sidebar: React.FC = () => {
    const { t } = useTranslation();
    const { state, actions, permissions } = useAppContext();
    const {
        workspaces,
        selectedWorkspaceId,
        lists,
        folders,
        selectedListId,
        currentUser,
        activeView,
        isSidebarOpen,
    } = state;
    const {
        handleSelectWorkspace,
        setIsWorkspaceModalOpen,
        setWorkspaceToEdit,
        setSelectedListId,
        setActiveView,
        setIsSidebarOpen,
        setIsProjectModalOpen,
        setListToEdit,
        setIsFolderModalOpen,
        setFolderToEdit,
        setEditingUserId,
        handleLogout,
        setIsSettingsModalOpen,
        handleUpdateUserStatus,
        handleSidebarReorder,
        showConfirmation,
    } = actions;

    const [isUserPanelOpen, setIsUserPanelOpen] = useState(false);
    const [openFolders, setOpenFolders] = useState<Set<string>>(new Set(folders.map(f => f.id)));
    const userPanelRef = useRef<HTMLDivElement>(null);
    const selectedWorkspace = workspaces.find(w => w.id === selectedWorkspaceId);

    const [draggedItem, setDraggedItem] = useState<{ id: string; type: 'folder' | 'list' } | null>(null);
    const [dropTarget, setDropTarget] = useState<{ targetId: string; position: 'top' | 'bottom' | 'middle' } | null>(null);

    const isDraggable = permissions.has(Permission.DRAG_AND_DROP);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userPanelRef.current && !userPanelRef.current.contains(event.target as Node)) {
                setIsUserPanelOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNavigation = (callback: () => void) => {
        callback();
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    };

    const performLogout = () => {
        showConfirmation(
            t('sidebar.logout'),
            t('confirmations.logout'),
            () => handleLogout()
        );
    };

    const toggleFolder = (folderId: string) => {
        setOpenFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(folderId)) {
                newSet.delete(folderId);
            } else {
                newSet.add(folderId);
            }
            return newSet;
        });
    };

    // --- Drag and Drop Logic (Unchanged for stability) ---
    const handleDragStart = (e: React.DragEvent, id: string, type: 'folder' | 'list') => {
        if (!isDraggable) return;
        e.dataTransfer.setData('application/json', JSON.stringify({ id, type }));
        setTimeout(() => setDraggedItem({ id, type }), 0);
    };

    const handleDragOver = (e: React.DragEvent, targetId: string, targetType: 'folder' | 'list') => {
        e.preventDefault();
        if (!isDraggable || !draggedItem || draggedItem.id === targetId) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;

        if (draggedItem.type === 'list' && targetType === 'folder' && y > rect.height * 0.25 && y < rect.height * 0.75) {
            setDropTarget({ targetId, position: 'middle' });
        } else {
            const position = y < rect.height / 2 ? 'top' : 'bottom';
            setDropTarget({ targetId, position });
        }
    };
    
    const handleDragLeave = () => setDropTarget(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (!isDraggable || !draggedItem || !dropTarget) {
            setDraggedItem(null);
            setDropTarget(null);
            return;
        }

        const draggedInfo = JSON.parse(e.dataTransfer.getData('application/json'));
        if (draggedInfo.id === dropTarget.targetId) return;

        let newFolders = [...foldersInCurrentWorkspace];
        let newLists = [...listsInCurrentWorkspace];

        let displayItems: { id: string; type: 'folder' | 'list' }[] = [];
        const sortedFolders = [...newFolders].sort((a, b) => a.order - b.order);
        const sortedLists = [...newLists].sort((a, b) => a.order - b.order);
        
        sortedFolders.forEach(f => {
            displayItems.push({ id: f.id, type: 'folder' });
            sortedLists.filter(l => l.folderId === f.id).forEach(l => displayItems.push({ id: l.id, type: 'list' }));
        });
        sortedLists.filter(l => !l.folderId).forEach(l => displayItems.push({ id: l.id, type: 'list' }));

        const draggedItemIndex = displayItems.findIndex(item => item.id === draggedInfo.id);
        const [draggedDisplayItem] = displayItems.splice(draggedItemIndex, 1);
        
        const dropTargetIndex = displayItems.findIndex(item => item.id === dropTarget.targetId);

        if (draggedInfo.type === 'list' && dropTarget.position === 'middle') { 
            const list = newLists.find(l => l.id === draggedInfo.id)!;
            list.folderId = dropTarget.targetId;
            const lastIndexOfFolder = displayItems.map(i => i.id).lastIndexOf(dropTarget.targetId);
            displayItems.splice(lastIndexOfFolder + 1, 0, draggedDisplayItem);

        } else { 
            const finalIndex = dropTarget.position === 'top' ? dropTargetIndex : dropTargetIndex + 1;
            displayItems.splice(finalIndex, 0, draggedDisplayItem);

            if (draggedInfo.type === 'list') {
                const list = newLists.find(l => l.id === draggedInfo.id)!;
                const itemBefore = displayItems[finalIndex - 1];
                if (itemBefore) {
                    if (itemBefore.type === 'folder') {
                        list.folderId = itemBefore.id;
                    } else {
                        list.folderId = newLists.find(l => l.id === itemBefore.id)!.folderId || null;
                    }
                } else {
                    list.folderId = null;
                }
            }
        }

        let folderOrder = 0;
        let listOrder = 0;
        const finalFolders: Folder[] = [];
        const finalLists: List[] = [];

        displayItems.forEach(item => {
            if (item.type === 'folder') {
                const folder = newFolders.find(f => f.id === item.id)!;
                folder.order = folderOrder++;
                finalFolders.push(folder);
            } else {
                const list = newLists.find(l => l.id === item.id)!;
                list.order = listOrder++;
                finalLists.push(list);
            }
        });

        handleSidebarReorder(
            [...folders.filter(f => f.workspaceId !== selectedWorkspaceId), ...finalFolders],
            [...lists.filter(l => l.workspaceId !== selectedWorkspaceId), ...finalLists]
        );
        
        setDraggedItem(null);
        setDropTarget(null);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        setDropTarget(null);
    };
    // --- End Drag and Drop Logic ---

    const listsInCurrentWorkspace = useMemo(() => lists.filter(l => l.workspaceId === selectedWorkspaceId), [lists, selectedWorkspaceId]);
    const foldersInCurrentWorkspace = useMemo(() => folders.filter(f => f.workspaceId === selectedWorkspaceId), [folders, selectedWorkspaceId]);

    const folderStructure = useMemo(() => {
        const sortedFolders = [...foldersInCurrentWorkspace].sort((a, b) => a.order - b.order);
        const sortedLists = [...listsInCurrentWorkspace].sort((a, b) => a.order - b.order);

        const structured: (Folder & { lists: List[] })[] = sortedFolders.map(f => ({
            ...f,
            lists: sortedLists.filter(l => l.folderId === f.id)
        }));
        
        const standaloneLists: List[] = sortedLists.filter(list => !list.folderId);

        return { structured, standaloneLists };
    }, [foldersInCurrentWorkspace, listsInCurrentWorkspace]);

    if (!currentUser) return null;

    return (
        <>
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fadeIn" 
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 z-50 md:static md:z-auto
                flex-shrink-0 bg-secondary flex flex-col h-full 
                transition-all duration-300 ease-in-out overflow-hidden border-r border-border
                ${isSidebarOpen ? 'w-72 translate-x-0 shadow-2xl md:shadow-none' : 'w-0 -translate-x-full md:w-0 md:translate-x-0'}
            `}>
                <div className="w-72 flex flex-col h-full">
                    <div className="flex-shrink-0 p-4 flex items-center justify-between">
                        <Logo />
                        <button 
                            onClick={() => setIsSidebarOpen(false)} 
                            className="md:hidden p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-secondary-focus"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="px-4 pb-2">
                        <WorkspaceSwitcher 
                            workspaces={workspaces}
                            selectedWorkspace={selectedWorkspace}
                            onSelectWorkspace={(id) => handleNavigation(() => handleSelectWorkspace(id))}
                            onAddWorkspace={() => { setWorkspaceToEdit(null); setIsWorkspaceModalOpen(true); }}
                            canManage={permissions.has(Permission.MANAGE_WORKSPACES_AND_PROJECTS)}
                        />
                        <button 
                            onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
                            className="w-full flex items-center px-3 py-2 mb-4 text-sm text-text-secondary bg-surface border border-border rounded-lg hover:border-primary focus:outline-none transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {t('sidebar.search')}
                            <span className="ml-auto text-xs text-text-secondary/50 border border-border rounded px-1">⌘K</span>
                        </button>
                    </div>

                    <div className="flex-grow overflow-y-auto px-4 space-y-6">
                        {/* Main Menu Section */}
                        <section>
                            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 pl-3">{t('sidebar.menu')}</h3>
                            <div className="space-y-0.5">
                                <SidebarItem 
                                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>}
                                    label={t('sidebar.myTasks')}
                                    isActive={activeView === 'my_tasks'}
                                    onClick={() => handleNavigation(() => { setActiveView('my_tasks'); setSelectedListId(null); })}
                                />
                                {permissions.has(Permission.VIEW_DASHBOARD) && (
                                    <SidebarItem 
                                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>}
                                        label={t('sidebar.dashboard')}
                                        isActive={activeView === 'dashboard'}
                                        onClick={() => handleNavigation(() => { setActiveView('dashboard'); setSelectedListId(null); })}
                                    />
                                )}
                                {permissions.has(Permission.MANAGE_APP) && (
                                    <SidebarItem 
                                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.96.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>}
                                        label={t('sidebar.appAdmin')}
                                        isActive={activeView === 'app_admin'}
                                        onClick={() => handleNavigation(() => { setActiveView('app_admin'); setSelectedListId(null); })}
                                    />
                                )}
                            </div>
                        </section>

                        {/* Projects Section */}
                        <section>
                            <div className="flex justify-between items-center mb-2 pl-3 pr-1">
                                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">{t('sidebar.projects')}</h3>
                                {permissions.has(Permission.MANAGE_WORKSPACES_AND_PROJECTS) && (
                                   <div className="flex items-center gap-1">
                                        <button onClick={() => { setFolderToEdit(null); setIsFolderModalOpen(true); }} className="text-text-secondary hover:text-text-primary p-1 rounded hover:bg-secondary-focus transition-colors" title={t('sidebar.newFolder')}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /></svg>
                                        </button>
                                        <button onClick={() => { setListToEdit(null); setIsProjectModalOpen(true); }} className="text-text-secondary hover:text-text-primary p-1 rounded hover:bg-secondary-focus transition-colors" title={t('sidebar.newProject')}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <nav className="space-y-0.5 -mx-2" onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
                                {folderStructure.structured.map(folder => (
                                    <div key={folder.id} className="relative"
                                        draggable={isDraggable}
                                        onDragStart={(e) => handleDragStart(e, folder.id, 'folder')}
                                        onDragEnd={handleDragEnd}
                                        onDragOver={(e) => handleDragOver(e, folder.id, 'folder')}
                                        onDragLeave={handleDragLeave}
                                    >
                                        {dropTarget?.targetId === folder.id && dropTarget.position === 'top' && <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary z-10"></div>}
                                        <div className={`rounded-lg transition-colors ${draggedItem?.id === folder.id ? 'opacity-50' : ''} ${dropTarget?.targetId === folder.id && dropTarget.position === 'middle' ? 'bg-primary/10 ring-1 ring-primary inset-0' : ''}`}>
                                            <button 
                                                onClick={() => toggleFolder(folder.id)} 
                                                className="w-full flex items-center px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary font-medium hover:bg-secondary-focus rounded-lg"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 mr-2 transition-transform ${openFolders.has(folder.id) ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                                                <span className="truncate">{folder.name}</span>
                                            </button>
                                            {openFolders.has(folder.id) && (
                                                <ul className="mt-0.5 space-y-0.5">
                                                    {folder.lists.map(list => (
                                                         <li key={list.id} className="relative" draggable={isDraggable} onDragStart={(e) => handleDragStart(e, list.id, 'list')} onDragEnd={handleDragEnd} onDragOver={(e) => handleDragOver(e, list.id, 'list')} onDragLeave={handleDragLeave}>
                                                            {dropTarget?.targetId === list.id && dropTarget.position === 'top' && <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary z-10"></div>}
                                                            <a href="#" onClick={(e) => { e.preventDefault(); handleNavigation(() => { setSelectedListId(list.id); setActiveView('list'); }); }} className={`block pl-8 pr-3 py-1.5 rounded-lg text-sm transition-colors ${selectedListId === list.id && activeView === 'list' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-secondary-focus text-text-secondary hover:text-text-primary'} ${draggedItem?.id === list.id ? 'opacity-50' : ''}`}>
                                                                <div className="flex items-center">
                                                                     <span className={`w-2 h-2 rounded-full mr-2 ${list.color}`}></span>
                                                                     <span className="truncate">{list.name}</span>
                                                                </div>
                                                            </a>
                                                            {dropTarget?.targetId === list.id && dropTarget.position === 'bottom' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary z-10"></div>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                        {dropTarget?.targetId === folder.id && dropTarget.position === 'bottom' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary z-10"></div>}
                                    </div>
                                ))}
                                 {folderStructure.standaloneLists.map(list => (
                                    <div key={list.id} className="relative" draggable={isDraggable} onDragStart={(e) => handleDragStart(e, list.id, 'list')} onDragEnd={handleDragEnd} onDragOver={(e) => handleDragOver(e, list.id, 'list')} onDragLeave={handleDragLeave}>
                                         {dropTarget?.targetId === list.id && dropTarget.position === 'top' && <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary z-10"></div>}
                                        <a href="#" onClick={(e) => { e.preventDefault(); handleNavigation(() => { setSelectedListId(list.id); setActiveView('list'); }); }} className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${selectedListId === list.id && activeView === 'list' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-secondary-focus text-text-secondary hover:text-text-primary'} ${draggedItem?.id === list.id ? 'opacity-50' : ''}`}>
                                             <div className="flex items-center">
                                                 <span className={`w-2.5 h-2.5 rounded-full mr-3 ${list.color}`}></span>
                                                 <span className="truncate">{list.name}</span>
                                             </div>
                                        </a>
                                        {dropTarget?.targetId === list.id && dropTarget.position === 'bottom' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary z-10"></div>}
                                    </div>
                                ))}
                            </nav>
                        </section>
                    </div>

                    <div className="p-4 border-t border-border mt-auto space-y-2 bg-secondary">
                        <SidebarItem 
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.96.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>}
                            label={t('sidebar.settings')}
                            onClick={() => setIsSettingsModalOpen(true)}
                        />
                        <div ref={userPanelRef} className="relative">
                            {isUserPanelOpen && (
                                <UserPanel
                                    currentUser={currentUser}
                                    onOpenUserProfile={() => setEditingUserId(currentUser.id)}
                                    onLogout={performLogout}
                                    onClose={() => setIsUserPanelOpen(false)}
                                    onUpdateUserStatus={(status) => handleUpdateUserStatus(currentUser.id, status)}
                                />
                            )}
                            <button onClick={() => setIsUserPanelOpen(p => !p)} className="w-full flex items-center text-left p-2 rounded-lg hover:bg-surface transition-colors group">
                                <AvatarWithStatus user={currentUser} className="w-9 h-9 border border-border" />
                                <div className="flex-grow min-w-0 ml-3">
                                    <p className="font-semibold text-sm text-text-primary truncate group-hover:text-primary transition-colors">{currentUser.name}</p>
                                    <p className="text-xs text-text-secondary truncate">{currentUser.title}</p>
                                </div>
                                <svg className="w-4 h-4 text-text-secondary group-hover:text-text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
