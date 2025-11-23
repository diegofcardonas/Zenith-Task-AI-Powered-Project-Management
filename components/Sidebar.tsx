
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { List, Workspace, Folder, Permission } from '../types';
import Logo from './Logo';
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
      <div ref={wrapperRef} className="relative mb-6 px-2">
        <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="w-full flex items-center justify-between p-2.5 hover:bg-white/5 rounded-xl transition-all duration-200 group border border-transparent hover:border-white/10"
        >
            <div className="flex items-center min-w-0 gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex-shrink-0 flex items-center justify-center shadow-lg shadow-primary/20 ring-1 ring-white/10">
                     <span className="font-bold text-white text-lg leading-none">{selectedWorkspace?.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex flex-col items-start min-w-0">
                    <span className="font-bold text-text-primary truncate text-sm w-full text-left group-hover:text-white transition-colors">{selectedWorkspace?.name}</span>
                </div>
            </div>
            <svg className={`w-4 h-4 text-text-secondary transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        </button>

        {isOpen && (
            <div className="absolute top-full mt-2 left-1 right-1 bg-[#1e293b] rounded-xl shadow-2xl border border-white/10 z-40 animate-scaleIn origin-top backdrop-blur-xl">
                <div className="p-2">
                    <span className="text-[10px] font-bold text-text-secondary px-3 uppercase tracking-wider opacity-70">{t('sidebar.workspace')}</span>
                </div>
                <ul className="py-1 space-y-1 px-1">
                    {workspaces.map(workspace => (
                        <li key={workspace.id}>
                            <button
                                onClick={() => {
                                    onSelectWorkspace(workspace.id);
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-3 py-2.5 hover:bg-white/5 rounded-lg flex items-center justify-between text-sm group transition-colors"
                            >
                                <span className="font-medium">{workspace.name}</span>
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
                    <div className="p-2 border-t border-white/10">
                        <button 
                            onClick={() => {
                                onAddWorkspace();
                                setIsOpen(false);
                            }}
                            className="w-full text-left p-2 rounded-lg hover:bg-primary/10 hover:text-primary flex items-center text-text-secondary text-sm transition-all duration-200"
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
    className?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, isActive, onClick, badge, className }) => (
    <button 
        onClick={onClick}
        className={`
            w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group text-sm relative overflow-hidden my-0.5
            ${isActive 
                ? 'bg-primary/10 text-primary font-semibold shadow-[0_0_15px_rgba(139,92,246,0.1)]' 
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5'} 
            ${className}
        `}
    >
        {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full shadow-[0_0_10px_var(--primary)]"></div>}
        <span className={`mr-3 transition-colors flex-shrink-0 duration-200 ${isActive ? 'text-primary scale-110' : 'text-text-secondary group-hover:text-text-primary'}`}>
            {icon}
        </span>
        <span className="flex-grow text-left truncate">{label}</span>
        {badge && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[1.25rem] text-center transition-colors ${isActive ? 'bg-primary text-white shadow-sm' : 'bg-white/5 text-text-secondary group-hover:bg-white/10'}`}>
                {badge}
            </span>
        )}
    </button>
);

const SidebarSection: React.FC<{ 
    title: string; 
    children: React.ReactNode; 
    action?: React.ReactNode; 
    defaultOpen?: boolean 
}> = ({ title, children, action, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between px-3 py-2 mb-1 group">
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center text-[11px] font-bold text-text-secondary/70 hover:text-text-secondary uppercase tracking-widest transition-colors flex-grow text-left"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 mr-1.5 transition-transform duration-200 opacity-50 ${isOpen ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    {title}
                </button>
                {action && <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-[-4px] group-hover:translate-x-0">{action}</div>}
            </div>
            <div className={`space-y-1 transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                {children}
            </div>
        </div>
    );
};

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
        chatChannels,
        isChatOpen
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
        handleSidebarReorder,
        setIsChatOpen,
    } = actions;

    const [openFolders, setOpenFolders] = useState<Set<string>>(new Set(folders.map(f => f.id)));
    const selectedWorkspace = workspaces.find(w => w.id === selectedWorkspaceId);

    const [draggedItem, setDraggedItem] = useState<{ id: string; type: 'folder' | 'list' } | null>(null);
    const [dropTarget, setDropTarget] = useState<{ targetId: string; position: 'top' | 'bottom' | 'middle' } | null>(null);

    const isDraggable = permissions.has(Permission.DRAG_AND_DROP);
    
    // Calculate total unread messages
    const totalUnreadChat = useMemo(() => chatChannels.reduce((acc, c) => acc + (c.unreadCount || 0), 0), [chatChannels]);

    const handleNavigation = (callback: () => void) => {
        callback();
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
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
                    className="fixed inset-0 bg-black/60 z-40 md:hidden animate-fadeIn backdrop-blur-sm" 
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 z-50 md:static md:z-auto
                flex-shrink-0 bg-[#141b2d] flex flex-col h-full 
                transition-all duration-300 ease-in-out overflow-hidden border-r border-white/5
                ${isSidebarOpen ? 'w-72 translate-x-0 shadow-2xl md:shadow-none' : 'w-0 -translate-x-full md:w-0 md:translate-x-0'}
            `}>
                <div className="w-72 flex flex-col h-full">
                    <div className="flex-shrink-0 p-5 flex items-center justify-between">
                        <Logo />
                        <button 
                            onClick={() => setIsSidebarOpen(false)} 
                            className="md:hidden p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-white/10 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-shrink-0 px-3">
                        <WorkspaceSwitcher 
                            workspaces={workspaces}
                            selectedWorkspace={selectedWorkspace}
                            onSelectWorkspace={(id) => handleNavigation(() => handleSelectWorkspace(id))}
                            onAddWorkspace={() => { setWorkspaceToEdit(null); setIsWorkspaceModalOpen(true); }}
                            canManage={permissions.has(Permission.MANAGE_WORKSPACES_AND_PROJECTS)}
                        />
                        <button 
                            onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
                            className="w-full flex items-center px-3 py-2.5 mb-6 text-sm text-text-secondary bg-[#1e293b] border border-white/5 rounded-lg hover:border-primary/50 hover:text-white focus:outline-none transition-all shadow-sm group"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-text-secondary group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {t('sidebar.search')}
                            <span className="ml-auto text-[10px] font-mono bg-white/5 text-text-secondary/70 border border-white/5 rounded px-1.5 py-0.5 group-hover:bg-white/10 transition-colors">⌘K</span>
                        </button>
                    </div>

                    <div className="flex-grow overflow-y-auto px-3 pb-4 space-y-6 custom-scrollbar">
                        
                        {/* Home Section */}
                        <SidebarSection title={t('sidebar.home')}>
                            <SidebarItem 
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>}
                                label={t('sidebar.myTasks')}
                                isActive={activeView === 'my_tasks'}
                                onClick={() => handleNavigation(() => { setActiveView('my_tasks'); setSelectedListId(null); })}
                            />
                            <SidebarItem 
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" /></svg>}
                                label={t('sidebar.allProjects')}
                                isActive={selectedListId === null && activeView === 'board'}
                                onClick={() => handleNavigation(() => { setSelectedListId(null); setActiveView('board'); })}
                            />
                            <SidebarItem 
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" /></svg>}
                                label={t('chat.teamChat')}
                                isActive={isChatOpen}
                                onClick={() => { setIsChatOpen(true); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                                badge={totalUnreadChat > 0 ? totalUnreadChat : undefined}
                            />
                            {permissions.has(Permission.VIEW_DASHBOARD) && (
                                <SidebarItem 
                                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>}
                                    label={t('sidebar.dashboard')}
                                    isActive={activeView === 'dashboard'}
                                    onClick={() => handleNavigation(() => { setActiveView('dashboard'); setSelectedListId(null); })}
                                />
                            )}
                        </SidebarSection>

                        {/* Projects Section */}
                        <SidebarSection 
                            title={t('sidebar.projects')}
                            action={permissions.has(Permission.MANAGE_WORKSPACES_AND_PROJECTS) ? (
                                <div className="flex items-center gap-1">
                                    <button onClick={(e) => { e.stopPropagation(); setFolderToEdit(null); setIsFolderModalOpen(true); }} className="text-text-secondary hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors" title={t('sidebar.newFolder')}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); setListToEdit(null); setIsProjectModalOpen(true); }} className="text-text-secondary hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors" title={t('sidebar.newProject')}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                            ) : undefined}
                        >
                            <nav className="space-y-1" onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
                                {folderStructure.structured.map(folder => (
                                    <div key={folder.id} className="relative"
                                        draggable={isDraggable}
                                        onDragStart={(e) => handleDragStart(e, folder.id, 'folder')}
                                        onDragEnd={handleDragEnd}
                                        onDragOver={(e) => handleDragOver(e, folder.id, 'folder')}
                                        onDragLeave={handleDragLeave}
                                    >
                                        {dropTarget?.targetId === folder.id && dropTarget.position === 'top' && <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary z-10"></div>}
                                        <div className={`rounded-lg transition-colors duration-200 ${draggedItem?.id === folder.id ? 'opacity-50' : ''} ${dropTarget?.targetId === folder.id && dropTarget.position === 'middle' ? 'bg-primary/10 ring-1 ring-primary inset-0' : ''}`}>
                                            <button 
                                                onClick={() => toggleFolder(folder.id)} 
                                                className="w-full flex items-center px-3 py-2.5 text-sm text-text-secondary hover:text-white font-medium hover:bg-white/5 rounded-lg group transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 mr-2 transition-transform duration-200 text-text-secondary group-hover:text-white ${openFolders.has(folder.id) ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                                                <span className="truncate">{folder.name}</span>
                                            </button>
                                            {openFolders.has(folder.id) && (
                                                <ul className="mt-0.5 space-y-0.5 relative">
                                                    <div className="absolute left-[19px] top-0 bottom-0 w-px bg-white/5"></div>
                                                    {folder.lists.map(list => (
                                                         <li key={list.id} className="relative" draggable={isDraggable} onDragStart={(e) => handleDragStart(e, list.id, 'list')} onDragEnd={handleDragEnd} onDragOver={(e) => handleDragOver(e, list.id, 'list')} onDragLeave={handleDragLeave}>
                                                            {dropTarget?.targetId === list.id && dropTarget.position === 'top' && <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary z-10"></div>}
                                                            <a href="#" onClick={(e) => { e.preventDefault(); handleNavigation(() => { setSelectedListId(list.id); setActiveView('list'); }); }} 
                                                               className={`block pl-8 pr-3 py-2.5 rounded-lg text-sm transition-all duration-200 relative overflow-hidden group ${selectedListId === list.id && activeView === 'list' ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-white/5 text-text-secondary hover:text-white'} ${draggedItem?.id === list.id ? 'opacity-50' : ''}`}
                                                            >
                                                                {selectedListId === list.id && activeView === 'list' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-r-full shadow-[0_0_8px_var(--primary)]"></div>}
                                                                <div className="flex items-center">
                                                                     <span className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 transition-transform group-hover:scale-110 ${list.color} ${selectedListId === list.id ? 'ring-2 ring-primary/30' : ''}`}></span>
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
                                        <a href="#" onClick={(e) => { e.preventDefault(); handleNavigation(() => { setSelectedListId(list.id); setActiveView('list'); }); }} 
                                           className={`block px-3 py-2.5 rounded-lg text-sm transition-all duration-200 relative overflow-hidden group ${selectedListId === list.id && activeView === 'list' ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-white/5 text-text-secondary hover:text-white'} ${draggedItem?.id === list.id ? 'opacity-50' : ''}`}
                                        >
                                            {selectedListId === list.id && activeView === 'list' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-r-full shadow-[0_0_8px_var(--primary)]"></div>}
                                             <div className="flex items-center">
                                                 <span className={`w-2.5 h-2.5 rounded-full mr-3 flex-shrink-0 transition-transform group-hover:scale-110 ${list.color} ${selectedListId === list.id ? 'ring-2 ring-primary/30' : ''}`}></span>
                                                 <span className="truncate">{list.name}</span>
                                             </div>
                                        </a>
                                        {dropTarget?.targetId === list.id && dropTarget.position === 'bottom' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary z-10"></div>}
                                    </div>
                                ))}
                            </nav>
                        </SidebarSection>

                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
