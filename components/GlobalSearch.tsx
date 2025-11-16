import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Task, List, User } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import AvatarWithStatus from './AvatarWithStatus';

interface SearchResult {
    tasks: Task[];
    lists: List[];
    users: User[];
}

interface GlobalSearchProps {
    allTasks: Task[];
    allLists: List[];
    allUsers: User[];
    onSelectTask: (task: Task) => void;
    onSelectList: (listId: string) => void;
    onSelectUser: (user: User) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ allTasks, allLists, allUsers, onSelectTask, onSelectList, onSelectUser }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const debouncedQuery = useDebounce(query, 300);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (debouncedQuery.length > 1) {
            const lowerCaseQuery = debouncedQuery.toLowerCase();
            const filteredTasks = allTasks.filter(t => t.title.toLowerCase().includes(lowerCaseQuery) || t.description.toLowerCase().includes(lowerCaseQuery));
            const filteredLists = allLists.filter(l => l.name.toLowerCase().includes(lowerCaseQuery));
            const filteredUsers = allUsers.filter(u => u.name.toLowerCase().includes(lowerCaseQuery));
            
            setResults({
                tasks: filteredTasks.slice(0, 5),
                lists: filteredLists.slice(0, 3),
                users: filteredUsers.slice(0, 3),
            });
            setIsOpen(true);
        } else {
            setResults(null);
            setIsOpen(false);
        }
    }, [debouncedQuery, allTasks, allLists, allUsers]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        const handleFocusSearch = () => {
            inputRef.current?.focus();
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        window.addEventListener('focus-global-search', handleFocusSearch);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
            window.removeEventListener('focus-global-search', handleFocusSearch);
        };
    }, []);

    const handleSelectTask = (task: Task) => {
        onSelectTask(task);
        setIsOpen(false);
        setQuery('');
    };

    const handleSelectList = (listId: string) => {
        onSelectList(listId);
        setIsOpen(false);
        setQuery('');
    };

    const handleSelectUser = (user: User) => {
        onSelectUser(user);
        setIsOpen(false);
        setQuery('');
    };
    
    const hasResults = results && (results.tasks.length > 0 || results.lists.length > 0 || results.users.length > 0);

    return (
        <div className="relative" ref={searchRef}>
            <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-secondary absolute top-1/2 left-3 transform -translate-y-1/2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Buscar (F)..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length > 1 && setIsOpen(true)}
                    className="bg-secondary pl-10 pr-4 py-2 rounded-lg w-48 sm:w-64 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
            </div>
            {isOpen && (
                <div className="absolute top-full mt-2 w-80 bg-surface rounded-lg shadow-lg border border-border z-30 animate-fadeIn">
                    {hasResults ? (
                        <div className="max-h-96 overflow-y-auto">
                            {results.tasks.length > 0 && (
                                <div className="p-2">
                                    <h3 className="text-xs font-semibold text-text-secondary uppercase px-2 py-1">Tareas</h3>
                                    {results.tasks.map(task => (
                                        <button key={task.id} onClick={() => handleSelectTask(task)} className="w-full text-left p-2 hover:bg-secondary-focus rounded-md text-sm truncate">
                                            {task.title}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {results.lists.length > 0 && (
                                <div className="p-2 border-t border-border">
                                    <h3 className="text-xs font-semibold text-text-secondary uppercase px-2 py-1">Proyectos</h3>
                                    {results.lists.map(list => (
                                        <button key={list.id} onClick={() => handleSelectList(list.id)} className="w-full text-left p-2 hover:bg-secondary-focus rounded-md text-sm truncate flex items-center gap-2">
                                            <span className={`w-3 h-3 rounded-full ${list.color}`}></span>
                                            {list.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {results.users.length > 0 && (
                                <div className="p-2 border-t border-border">
                                    <h3 className="text-xs font-semibold text-text-secondary uppercase px-2 py-1">Usuarios</h3>
                                    {results.users.map(user => (
                                        <button key={user.id} onClick={() => handleSelectUser(user)} className="w-full text-left p-2 hover:bg-secondary-focus rounded-md text-sm truncate flex items-center gap-2">
                                            <AvatarWithStatus user={user} className="w-6 h-6" />
                                            {user.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="p-4 text-center text-sm text-text-secondary">No se encontraron resultados para "{query}".</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;