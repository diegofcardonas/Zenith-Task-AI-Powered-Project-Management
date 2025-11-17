import React, { useState, useEffect, useMemo } from 'react';
import { List, User } from '../types';
import { useTranslation } from '../i18n';

interface Command {
    id: string;
    name: string;
    category: string;
    action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  lists: List[];
  currentUser: User;
  onCommand: (command: string, payload?: any) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, lists, currentUser, onCommand }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: Command[] = useMemo(() => [
    ...lists.map(list => ({
        id: `list-${list.id}`,
        name: t('commandPalette.navigateToProject', { name: list.name }),
        category: t('commandPalette.navigateTo'),
        action: () => onCommand('navigate_list', list.id)
    })),
    { id: 'my-tasks', name: t('commandPalette.myTasks'), category: t('commandPalette.navigateTo'), action: () => onCommand('navigate_my_tasks') },
    ...(currentUser.role === 'Admin' ? [
        { id: 'admin-dashboard', name: t('commandPalette.adminDashboard'), category: t('commandPalette.navigateTo'), action: () => onCommand('navigate_dashboard') },
        { id: 'app-admin', name: t('commandPalette.appAdmin'), category: t('commandPalette.navigateTo'), action: () => onCommand('navigate_admin') }
    ] : []),
    { id: 'create-task', name: t('commandPalette.createTask'), category: t('commandPalette.create'), action: () => onCommand('create_task') },
    { id: 'toggle-theme', name: t('commandPalette.toggleTheme'), category: t('commandPalette.general'), action: () => onCommand('toggle_theme') },
    { id: 'logout', name: t('commandPalette.logout'), category: t('commandPalette.general'), action: () => onCommand('logout') },
  ], [lists, currentUser, onCommand, t]);

  const filteredCommands = useMemo(() => {
    if (!searchTerm) return commands;
    return commands.filter(cmd => cmd.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, commands]);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedIndex(0);
    }
  }, [isOpen]);
  
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + (filteredCommands.length || 1)) % (filteredCommands.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);
  
  const { groupedCommands, categoryOrder } = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    const order: string[] = [];

    filteredCommands.forEach(cmd => {
        if (!groups[cmd.category]) {
            groups[cmd.category] = [];
            order.push(cmd.category);
        }
        groups[cmd.category].push(cmd);
    });
    return { groupedCommands: groups, categoryOrder: order };
  }, [filteredCommands]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-20 z-50 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="bg-surface rounded-xl shadow-2xl w-full max-w-xl flex flex-col animate-scaleIn" onClick={e => e.stopPropagation()}>
        <div className="p-3 border-b border-border">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={t('modals.commandPalettePlaceholder')}
            className="w-full bg-transparent text-lg focus:outline-none placeholder-text-secondary px-2"
            autoFocus
          />
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
            {categoryOrder.map((category, categoryIndex) => {
                const commandsInCategory = groupedCommands[category];
                const commandsInPreviousCategories = categoryOrder.slice(0, categoryIndex)
                    .reduce((sum, cat) => sum + groupedCommands[cat].length, 0);

                return (
                    <div key={category}>
                        <h3 className="text-xs font-semibold text-text-secondary uppercase px-3 pt-2 pb-1">{category}</h3>
                        {commandsInCategory.map((cmd, cmdIndex) => {
                            const overallIndex = commandsInPreviousCategories + cmdIndex;
                            return (
                                <button
                                    key={cmd.id}
                                    onClick={cmd.action}
                                    className={`w-full text-left p-3 rounded-md text-base transition-colors ${selectedIndex === overallIndex ? 'bg-primary/20 text-primary' : 'hover:bg-secondary-focus'}`}
                                >
                                    {cmd.name}
                                </button>
                            );
                        })}
                    </div>
                )
            })}
            {filteredCommands.length === 0 && (
                <p className="p-4 text-center text-text-secondary">{t('modals.noResultsFound')}</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;