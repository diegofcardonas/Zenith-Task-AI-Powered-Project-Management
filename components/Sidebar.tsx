import React, { useState, useRef, useEffect, useMemo } from 'react';
import { List, User, Role, Workspace, Notification, UserStatus, Folder } from '../types';
import UserPanel from './UserPanel';
import Logo from './Logo';
import AvatarWithStatus from './AvatarWithStatus';

interface WorkspaceSwitcherProps {
    workspaces: Workspace[];
    selectedWorkspace: Workspace | undefined;
    onSelectWorkspace: (id: string) => void;
    onAddWorkspace: () => void;
    currentUser: User;
}

const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({ workspaces, selectedWorkspace, onSelectWorkspace, onAddWorkspace, currentUser }) => {
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
      <div ref={wrapperRef} className="relative mb-6">
        <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="w-full flex items-center justify-between p-3 bg-secondary rounded-lg hover:bg-secondary-focus transition-colors"
        >
            <div className="flex items-center min-w-0">
                <div className="w-8 h-8 rounded-md bg-primary flex-shrink-0 flex items-center justify-center mr-3 font-bold text-white text-lg">
                    {selectedWorkspace?.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-text-primary truncate">{selectedWorkspace?.name}</span>
            </div>
            <svg className={`w-5 h-5 text-text-secondary transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        </button>

        {isOpen && (
            <div className="absolute top-full mt-2 w-full bg-surface rounded-lg shadow-lg border border-border z-40 animate-fadeIn">
                <ul>
                    {workspaces.map(workspace => (
                        <li key={workspace.id}>
                            <button
                                onClick={() => {
                                    onSelectWorkspace(workspace.id);
                                    setIsOpen(false);
                                }}
                                className="w-full text-left p-3 hover:bg-secondary-focus flex items-center justify-between"
                            >
                                {workspace.name}
                                {workspace.id === selectedWorkspace?.id && (
                                    <svg className="w-5 h-5 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
                {(currentUser.role === Role.Admin || currentUser.role === Role.Member) && (
                    <div className="p-2 border-t border-border">
                        <button 
                            onClick={() => {
                                onAddWorkspace();
                                setIsOpen(false);
                            }}
                            className="w-full text-left p-2 rounded-md hover:bg-secondary-focus flex items-center text-text-secondary hover:text-text-primary"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Nuevo Espacio de Trabajo
                        </button>
                    </div>
                )}
            </div>
        )}
      </div>
    );
};


interface SidebarProps {
    workspaces: Workspace[];
    selectedWorkspaceId: string;
    onSelectWorkspace: (id: string) => void;
    onAddWorkspace: () => void;
    lists: List[];
    folders: Folder[];
    selectedListId: string | null;
    onSelectList: (id: string) => void;
    onAddList: () => void;
    onAddFolder: () => void;
    isOpen: boolean;
    onClose: () => void;
    currentUser: User;
    onOpenUserProfile: () => void;
    activeView: 'list' | 'dashboard' | 'app_admin' | 'my_tasks';
    onSelectView: (view: 'list' | 'dashboard' | 'app_admin' | 'my_tasks') => void;
    onLogout: () => void;
    onOpenSettings: () => void;
    onUpdateUserStatus: (userId: string, status: UserStatus) => void;
    onSidebarReorder: (folders: Folder[], lists: List[]) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    workspaces,
    selectedWorkspaceId,
    onSelectWorkspace,
    onAddWorkspace,
    lists,
    folders,
    selectedListId,
    onSelectList,
    onAddList,
    onAddFolder,
    isOpen,
    onClose,
    currentUser,
    onOpenUserProfile,
    activeView,
    onSelectView,
    onLogout,
    onOpenSettings,
    onUpdateUserStatus,
    onSidebarReorder,
}) => {
    const [isUserPanelOpen, setIsUserPanelOpen] = useState(false);
    const [openFolders, setOpenFolders] = useState<Set<string>>(new Set(folders.map(f => f.id)));
    const userPanelRef = useRef<HTMLDivElement>(null);
    const selectedWorkspace = workspaces.find(w => w.id === selectedWorkspaceId);

    const [draggedItem, setDraggedItem] = useState<{ id: string; type: 'folder' | 'list' } | null>(null);
    const [dropTarget, setDropTarget] = useState<{ targetId: string; position: 'top' | 'bottom' | 'middle' } | null>(null);

    const isDraggable = currentUser.role !== Role.Guest;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userPanelRef.current && !userPanelRef.current.contains(event.target as Node)) {
                setIsUserPanelOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

    const handleDragStart = (e: React.DragEvent, id: string, type: 'folder' | 'list') => {
        if (!isDraggable) return;
        e.dataTransfer.setData('application/json', JSON.stringify({ id, type }));
        setTimeout(() => setDraggedItem({ id, type }), 0);
    };

    const handleDragOver = (e: React.DragEvent, targetId: string, isFolder: boolean) => {
        e.preventDefault();
        if (!draggedItem || draggedItem.id === targetId) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;

        if (draggedItem.type === 'list' && isFolder && y > rect.height * 0.25 && y < rect.height * 0.75) {
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
        };

        const draggedInfo = JSON.parse(e.dataTransfer.getData('application/json'));
        if (draggedInfo.id === dropTarget.targetId) return;

        let newFolders = [...folders];
        let newLists = [...lists];

        if (draggedInfo.type === 'folder') {
            const draggedIndex = newFolders.findIndex(f => f.id === draggedInfo.id);
            const targetIndex = newFolders.findIndex(f => f.id === dropTarget.targetId);
            if(draggedIndex === -1 || targetIndex === -1) return;
            
            const [draggedFolder] = newFolders.splice(draggedIndex, 1);
            const finalIndex = dropTarget.position === 'top' ? targetIndex : targetIndex + 1;
            newFolders.splice(finalIndex > draggedIndex ? finalIndex -1 : finalIndex, 0, draggedFolder);

            onSidebarReorder(newFolders.map((f, i) => ({ ...f, order: i })), newLists);
        } else { // type is 'list'
            const draggedList = newLists.find(l => l.id === draggedInfo.id);
            if (!draggedList) return;

            newLists = newLists.filter(l => l.id !== draggedInfo.id);

            if (dropTarget.position === 'middle') { // Drop list into a folder
                draggedList.folderId = dropTarget.targetId;
                const listsInFolder = newLists.filter(l => l.folderId === dropTarget.targetId);
                const lastList = listsInFolder.sort((a,b) => a.order-b.order)[listsInFolder.length - 1];
                const dropIndex = lastList ? newLists.findIndex(l => l.id === lastList.id) + 1 : newLists.length;
                newLists.splice(dropIndex, 0, draggedList);

            } else { // Drop list on another list or on a folder edge
                const isTargetFolder = folders.some(f => f.id === dropTarget.targetId);
                if (isTargetFolder) { // Dropping on folder edge
                     draggedList.folderId = null; // Becomes a standalone list
                     const targetFolder = folders.find(f => f.id === dropTarget.targetId);
                     const standaloneLists = newLists.filter(l => !l.folderId);
                     const targetIndex = standaloneLists.findIndex(l => l.order > (targetFolder?.order || -1)); // approximation
                     newLists.splice(targetIndex, 0, draggedList);
                } else { // Dropping on another list
                    const targetList = newLists.find(l => l.id === dropTarget.targetId);
                    if (!targetList) return;
                    
                    draggedList.folderId = targetList.folderId;
                    let targetIndex = newLists.findIndex(l => l.id === targetList.id);
                    const finalIndex = dropTarget.position === 'top' ? targetIndex : targetIndex + 1;
                    newLists.splice(finalIndex, 0, draggedList);
                }
            }
            onSidebarReorder(newFolders, newLists.map((l, i) => ({ ...l, order: i })));
        }
        
        setDraggedItem(null);
        setDropTarget(null);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        setDropTarget(null);
    };


    const folderStructure = useMemo(() => {
        const sortedFolders = [...folders].sort((a, b) => a.order - b.order);
        const sortedLists = [...lists].sort((a, b) => a.order - b.order);

        const structured: (Folder & { lists: List[] })[] = sortedFolders.map(f => ({
            ...f,
            lists: sortedLists.filter(l => l.folderId === f.id)
        }));
        
        const standaloneLists: List[] = sortedLists.filter(list => !list.folderId);

        return { structured, standaloneLists };
    }, [folders, lists]);


    return (
        <aside className={`flex-shrink-0 bg-secondary flex flex-col h-full transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'w-72' : 'w-0'}`}>
            <div className="w-72 flex flex-col h-full">
                <div className="flex-shrink-0 p-4 border-b border-border">
                    <Logo />
                </div>
                <div className="p-4 flex-grow flex flex-col min-h-0">
                    <WorkspaceSwitcher 
                        workspaces={workspaces}
                        selectedWorkspace={selectedWorkspace}
                        onSelectWorkspace={onSelectWorkspace}
                        onAddWorkspace={onAddWorkspace}
                        currentUser={currentUser}
                    />
                    
                    <div className="mb-4 space-y-1">
                         <button 
                            onClick={() => onSelectView('my_tasks')}
                            className={`w-full flex items-center p-2 rounded-lg transition-colors ${activeView === 'my_tasks' ? 'bg-primary/20 text-primary' : 'hover:bg-surface text-text-secondary hover:text-text-primary'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                            <span className="font-semibold">Mis Tareas</span>
                        </button>
                        {currentUser.role === Role.Admin && (
                            <>
                                <button 
                                    onClick={() => onSelectView('dashboard')}
                                    className={`w-full flex items-center p-2 rounded-lg transition-colors ${activeView === 'dashboard' ? 'bg-primary/20 text-primary' : 'hover:bg-surface text-text-secondary hover:text-text-primary'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                                        <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                                    </svg>
                                    <span className="font-semibold">Dashboard</span>
                                </button>
                                <button 
                                    onClick={() => onSelectView('app_admin')}
                                    className={`w-full flex items-center p-2 rounded-lg transition-colors ${activeView === 'app_admin' ? 'bg-primary/20 text-primary' : 'hover:bg-surface text-text-secondary hover:text-text-primary'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.96.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-semibold">Admin de App</span>
                                </button>
                            </>
                        )}
                    </div>
                    
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-sm font-semibold uppercase text-text-secondary tracking-wider">Proyectos</h2>
                        {(currentUser.role === Role.Admin || currentUser.role === Role.Member) && (
                           <div className="flex items-center gap-1">
                                <button onClick={onAddFolder} className="text-text-secondary hover:text-text-primary p-1 rounded-md" title="Nueva Carpeta">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /></svg>
                                </button>
                                <button onClick={onAddList} className="text-text-secondary hover:text-text-primary p-1 rounded-md" title="Nuevo Proyecto">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                        )}
                    </div>

                    <nav className="flex-grow overflow-y-auto -mr-2 pr-2" onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
                        <ul>
                            {folderStructure.structured.map(folder => (
                                <li key={folder.id} className="relative"
                                    draggable={isDraggable}
                                    onDragStart={(e) => handleDragStart(e, folder.id, 'folder')}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={(e) => handleDragOver(e, folder.id, true)}
                                    onDragLeave={handleDragLeave}
                                >
                                    {dropTarget?.targetId === folder.id && dropTarget.position === 'top' && <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary z-10"></div>}
                                    <div className={`rounded-lg ${draggedItem?.id === folder.id ? 'opacity-50' : ''} ${dropTarget?.targetId === folder.id && dropTarget.position === 'middle' ? 'bg-primary/20 ring-2 ring-primary' : ''}`}>
                                        <button onClick={() => toggleFolder(folder.id)} className="w-full flex items-center p-2 text-text-secondary hover:text-text-primary font-semibold">
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 transition-transform ${openFolders.has(folder.id) ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                                            {folder.name}
                                        </button>
                                        {openFolders.has(folder.id) && (
                                            <ul className="pl-4">
                                                {folder.lists.map(list => (
                                                     <li key={list.id} className="relative" draggable={isDraggable} onDragStart={(e) => handleDragStart(e, list.id, 'list')} onDragEnd={handleDragEnd} onDragOver={(e) => handleDragOver(e, list.id, false)} onDragLeave={handleDragLeave}>
                                                        {dropTarget?.targetId === list.id && dropTarget.position === 'top' && <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary z-10"></div>}
                                                        <a href="#" onClick={(e) => { e.preventDefault(); onSelectList(list.id); }} className={`flex items-center p-2 rounded-lg transition-colors ${selectedListId === list.id && activeView === 'list' ? 'bg-primary/20 text-primary' : 'hover:bg-surface text-text-secondary hover:text-text-primary'} ${draggedItem?.id === list.id ? 'opacity-50' : ''}`}>
                                                            <span className={`w-3 h-3 rounded-full mr-3 ${list.color}`}></span>
                                                            <span className="font-semibold">{list.name}</span>
                                                        </a>
                                                        {dropTarget?.targetId === list.id && dropTarget.position === 'bottom' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary z-10"></div>}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    {dropTarget?.targetId === folder.id && dropTarget.position === 'bottom' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary z-10"></div>}
                                </li>
                            ))}
                             {folderStructure.standaloneLists.map(list => (
                                <li key={list.id} className="relative" draggable={isDraggable} onDragStart={(e) => handleDragStart(e, list.id, 'list')} onDragEnd={handleDragEnd} onDragOver={(e) => handleDragOver(e, list.id, false)} onDragLeave={handleDragLeave}>
                                     {dropTarget?.targetId === list.id && dropTarget.position === 'top' && <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary z-10"></div>}
                                    <a href="#" onClick={(e) => { e.preventDefault(); onSelectList(list.id); }} className={`flex items-center p-2 rounded-lg transition-colors ${selectedListId === list.id && activeView === 'list' ? 'bg-primary/20 text-primary' : 'hover:bg-surface text-text-secondary hover:text-text-primary'} ${draggedItem?.id === list.id ? 'opacity-50' : ''}`}>
                                        <span className={`w-3 h-3 rounded-full mr-3 ${list.color}`}></span>
                                        <span className="font-semibold">{list.name}</span>
                                    </a>
                                    {dropTarget?.targetId === list.id && dropTarget.position === 'bottom' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary z-10"></div>}
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                <div className="p-4 border-t border-border mt-auto">
                    <button onClick={onOpenSettings} className="w-full mb-2 flex items-center p-2 rounded-lg transition-colors hover:bg-surface text-text-secondary hover:text-text-primary" >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.96.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold">Configuración</span>
                    </button>
                    <div ref={userPanelRef} className="relative flex-grow">
                        {isUserPanelOpen && (
                            <UserPanel
                                currentUser={currentUser}
                                onOpenUserProfile={onOpenUserProfile}
                                onLogout={onLogout}
                                onClose={() => setIsUserPanelOpen(false)}
                                onUpdateUserStatus={onUpdateUserStatus}
                            />
                        )}
                        <button onClick={() => setIsUserPanelOpen(p => !p)} className="w-full flex items-center text-left p-2 rounded-lg hover:bg-surface">
                            <AvatarWithStatus user={currentUser} className="w-10 h-10" />
                            <div className="flex-grow min-w-0 ml-3">
                                <p className="font-semibold text-text-primary truncate">{currentUser.name}</p>
                                <p className="text-sm text-text-secondary truncate">{currentUser.title}</p>
                            </div>
                            <svg className="w-5 h-5 text-text-secondary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;