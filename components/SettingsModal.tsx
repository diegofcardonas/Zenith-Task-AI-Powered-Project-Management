
import React, { useState, useEffect } from 'react';
import { themes, ThemeName, ColorScheme } from '../themes';
import { useTranslation } from '../i18n';
import { useAppContext } from '../contexts/AppContext';
import AvatarWithStatus from './AvatarWithStatus';
import { saveFirebaseConfig, resetFirebaseConfig } from '../src/firebase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
}

enum SettingsTab {
  Account = 'account',
  General = 'general',
  Appearance = 'appearance',
  Notifications = 'notifications',
  Integrations = 'integrations',
  Connection = 'connection' // New tab
}

const Switch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ checked, onChange }) => (
    <button 
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface ${checked ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
    >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, theme, setTheme, colorScheme, setColorScheme }) => {
  const { t, i18n } = useTranslation();
  const { state, actions } = useAppContext();
  const { currentUser } = state;
  const [activeTab, setActiveTab] = useState<SettingsTab>(SettingsTab.Account);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Simulated settings state
  const [timezone, setTimezone] = useState('UTC-5 (EST)');
  const [startOfWeek, setStartOfWeek] = useState('monday');
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [notifications, setNotifications] = useState({
      emailDigest: true,
      push: true,
      mentions: true,
      assignments: true,
      marketing: false
  });

  const [firebaseConfigJson, setFirebaseConfigJson] = useState('');

  useEffect(() => {
      const stored = localStorage.getItem('zenith_firebase_config');
      if (stored) setFirebaseConfigJson(stored);
  }, []);

  if (!isOpen) return null;

  const handleSaveConnection = () => {
      if (saveFirebaseConfig(firebaseConfigJson)) {
          alert("Configuración guardada. La aplicación se recargará.");
      } else {
          alert("JSON inválido. Por favor verifica el formato.");
      }
  };

  const tabs = [
      { id: SettingsTab.Account, label: t('modals.account'), icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
      { id: SettingsTab.General, label: t('modals.general'), icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
      { id: SettingsTab.Appearance, label: t('modals.appearance'), icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg> },
      { id: SettingsTab.Notifications, label: t('modals.notifications'), icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> },
      { id: SettingsTab.Integrations, label: t('modals.integrations'), icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
      { id: SettingsTab.Connection, label: 'Conexión Cloud', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
  ];

  const filteredTabs = tabs.filter(tab => tab.label.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div
      className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 backdrop-blur-sm animate-fadeIn p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-surface w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col md:flex-row animate-scaleIn overflow-hidden border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar */}
        <div className="w-full md:w-72 bg-secondary/40 backdrop-blur-md border-b md:border-b-0 md:border-r border-border flex flex-col">
            <div className="p-5 pb-4">
                <h2 className="text-xl font-bold text-text-primary mb-4 px-2">{t('modals.settings')}</h2>
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input 
                        type="text" 
                        placeholder={t('modals.searchSettings')} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-surface border border-border rounded-lg py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                </div>
            </div>
            <nav className="flex-grow px-3 pb-3 space-y-1 overflow-y-auto">
                {filteredTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as SettingsTab)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${activeTab === tab.id ? 'bg-primary text-white shadow-md shadow-primary/30' : 'text-text-secondary hover:bg-surface hover:text-text-primary'}`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
                {filteredTabs.length === 0 && (
                    <p className="text-center text-text-secondary text-sm py-4">No matching settings found.</p>
                )}
            </nav>
        </div>

        {/* Content Area */}
        <div className="flex-grow flex flex-col bg-surface overflow-hidden relative">
            <button onClick={onClose} className="absolute top-5 right-5 z-10 p-2 text-text-secondary hover:text-text-primary hover:bg-secondary rounded-full transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>

            <main className="flex-grow overflow-y-auto p-6 md:p-10">
                
                {/* Account Settings */}
                {activeTab === SettingsTab.Account && currentUser && (
                     <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
                        <div className="flex items-center gap-6 pb-8 border-b border-border">
                            <AvatarWithStatus user={currentUser} className="w-24 h-24 border-4 border-surface shadow-lg" />
                            <div>
                                <h3 className="text-2xl font-bold text-text-primary">{currentUser.name}</h3>
                                <p className="text-text-secondary">{currentUser.email}</p>
                                <button onClick={() => { actions.setEditingUserId(currentUser.id); onClose(); }} className="mt-3 text-sm font-medium text-primary hover:underline">
                                    {t('modals.editYourProfile')}
                                </button>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold text-text-primary mb-4">{t('modals.workspace')}</h4>
                             <div className="bg-secondary/30 p-4 rounded-xl border border-border flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-text-primary">Zenith Workspace</p>
                                    <p className="text-sm text-text-secondary">{t('common.role')}: {t(`common.${currentUser.role.toLowerCase()}`)}</p>
                                </div>
                                <button className="px-3 py-1.5 bg-surface border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors">
                                    {t('common.edit')}
                                </button>
                            </div>
                        </div>

                        <div className="pt-6">
                             <h4 className="text-lg font-semibold text-red-500 mb-4">{t('modals.dangerZone')}</h4>
                             <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl flex justify-between items-center">
                                 <div>
                                     <p className="font-medium text-red-600 dark:text-red-400">{t('modals.deleteAccount')}</p>
                                     <p className="text-sm text-red-600/70 dark:text-red-400/70">{t('modals.deleteAccountWarning')}</p>
                                 </div>
                                 <button 
                                    onClick={() => {
                                      actions.handleDeleteAccount();
                                      onClose();
                                    }}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                                >
                                     {t('common.delete')}
                                 </button>
                             </div>
                        </div>
                     </div>
                )}

                {/* Connection Settings */}
                {activeTab === SettingsTab.Connection && (
                    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
                        <div>
                            <h3 className="text-xl font-bold text-text-primary mb-1">Conexión Firebase</h3>
                            <p className="text-text-secondary mb-6 text-sm">Configura tu propia base de datos para persistencia real.</p>
                            
                            <div className="space-y-4">
                                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg text-sm text-blue-300">
                                    <p className="font-bold mb-1">Instrucciones:</p>
                                    <ol className="list-decimal list-inside space-y-1">
                                        <li>Ve a tu consola de Firebase > Project Settings.</li>
                                        <li>Copia el objeto <code>firebaseConfig</code>.</li>
                                        <li>Pégalo abajo y guarda.</li>
                                    </ol>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-text-secondary mb-2">Configuración JSON</label>
                                    <textarea
                                        value={firebaseConfigJson}
                                        onChange={(e) => setFirebaseConfigJson(e.target.value)}
                                        rows={10}
                                        placeholder='{ "apiKey": "...", "authDomain": "..." }'
                                        className="w-full p-3 bg-secondary rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-xs"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <button 
                                        onClick={handleSaveConnection}
                                        className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-focus transition-colors shadow-lg"
                                    >
                                        Guardar y Recargar
                                    </button>
                                    <button 
                                        onClick={resetFirebaseConfig}
                                        className="px-6 py-2 bg-secondary text-text-secondary font-semibold rounded-lg hover:text-white transition-colors"
                                    >
                                        Restaurar Default
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* General Settings */}
                {activeTab === SettingsTab.General && (
                    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
                         <div>
                            <h3 className="text-xl font-bold text-text-primary mb-1">{t('modals.general')}</h3>
                            <p className="text-text-secondary mb-6 text-sm">Customize your regional preferences.</p>
                            
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-text-secondary mb-2">{t('modals.language')}</label>
                                        <div className="relative">
                                            <select 
                                                value={i18n.language} 
                                                onChange={(e) => i18n.changeLanguage(e.target.value as 'es' | 'en')}
                                                className="w-full p-3 pl-10 bg-secondary rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="es">Español (ES)</option>
                                                <option value="en">English (US)</option>
                                            </select>
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xl">
                                                {i18n.language === 'es' ? '🇪🇸' : '🇺🇸'}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-text-secondary mb-2">{t('modals.timezone')}</label>
                                        <select 
                                            value={timezone}
                                            onChange={(e) => setTimezone(e.target.value)}
                                            className="w-full p-3 bg-secondary rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none cursor-pointer"
                                        >
                                            <option>UTC-8 (Pacific Time)</option>
                                            <option>UTC-5 (Eastern Time)</option>
                                            <option>UTC+0 (Greenwich Mean Time)</option>
                                            <option>UTC+1 (Central European Time)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-border">
                                    <label className="block text-sm font-semibold text-text-secondary mb-3">{t('modals.startOfWeek')}</label>
                                    <div className="flex gap-4">
                                        {['monday', 'sunday'].map((day) => (
                                            <label key={day} className={`flex-1 p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-center gap-2 ${startOfWeek === day ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-border hover:border-primary/30 text-text-secondary'}`}>
                                                <input type="radio" name="startOfWeek" value={day} checked={startOfWeek === day} onChange={() => setStartOfWeek(day)} className="hidden" />
                                                {t(`modals.${day}`)}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Appearance Settings */}
                {activeTab === SettingsTab.Appearance && (
                    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
                        <div>
                            <h3 className="text-xl font-bold text-text-primary mb-1">{t('modals.appearance')}</h3>
                            <p className="text-text-secondary mb-6 text-sm">Make Zenith Task look just right for you.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <section>
                                    <label className="block text-sm font-semibold text-text-secondary mb-3">{t('modals.colorMode')}</label>
                                    <div className="bg-secondary/30 p-1 rounded-xl flex">
                                        <button onClick={() => setColorScheme('light')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${colorScheme === 'light' ? 'bg-white text-gray-900 shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>
                                            ☀️ {t('modals.lightMode')}
                                        </button>
                                        <button onClick={() => setColorScheme('dark')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${colorScheme === 'dark' ? 'bg-gray-800 text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>
                                            🌙 {t('modals.darkMode')}
                                        </button>
                                    </div>
                                </section>

                                <section>
                                    <label className="block text-sm font-semibold text-text-secondary mb-3">{t('modals.density')}</label>
                                    <div className="bg-secondary/30 p-1 rounded-xl flex">
                                         <button onClick={() => setDensity('comfortable')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${density === 'comfortable' ? 'bg-surface shadow-sm text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
                                            {t('modals.comfortable')}
                                        </button>
                                        <button onClick={() => setDensity('compact')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${density === 'compact' ? 'bg-surface shadow-sm text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
                                            {t('modals.compact')}
                                        </button>
                                    </div>
                                </section>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border">
                            <label className="block text-sm font-semibold text-text-secondary mb-4">{t('modals.theme')}</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {Object.keys(themes).map(themeKey => {
                                    const t_theme = themes[themeKey as ThemeName][colorScheme];
                                    const themeName = themeKey.charAt(0).toUpperCase() + themeKey.slice(1);
                                    const isActive = theme === themeKey;
                                    return (
                                        <button 
                                            key={themeKey} 
                                            onClick={() => setTheme(themeKey as ThemeName)} 
                                            className={`relative group overflow-hidden rounded-xl border-2 transition-all duration-200 text-left ${isActive ? 'border-primary ring-2 ring-primary/20 scale-[1.02]' : 'border-border hover:border-primary/50'}`}
                                        >
                                            <div className="h-20 w-full flex">
                                                <div className="w-1/4 h-full" style={{backgroundColor: t_theme.background}}></div> {/* Sidebar */}
                                                <div className="w-3/4 h-full flex flex-col">
                                                     <div className="h-4 w-full" style={{backgroundColor: t_theme.surface, borderBottom: `1px solid ${t_theme.border}`}}></div> {/* Header */}
                                                     <div className="flex-grow p-2" style={{backgroundColor: t_theme.background}}>
                                                         <div className="w-full h-2 rounded-full mb-1 opacity-50" style={{backgroundColor: t_theme['text-secondary']}}></div>
                                                         <div className="w-1/2 h-2 rounded-full opacity-30" style={{backgroundColor: t_theme['text-secondary']}}></div>
                                                         <div className="mt-2 w-8 h-8 rounded-full shadow-md absolute bottom-2 right-2 flex items-center justify-center text-white" style={{backgroundColor: t_theme.primary}}>
                                                             {isActive && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                         </div>
                                                     </div>
                                                </div>
                                            </div>
                                            <div className="p-2 bg-surface border-t border-border">
                                                <span className="text-sm font-semibold" style={{color: t_theme['text-primary']}}>{themeName}</span>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Notifications Settings */}
                {activeTab === SettingsTab.Notifications && (
                    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
                         <div>
                            <h3 className="text-xl font-bold text-text-primary mb-1">{t('modals.notifications')}</h3>
                            <p className="text-text-secondary mb-6 text-sm">Manage how you receive updates.</p>
                            
                            <div className="space-y-1 bg-surface rounded-xl border border-border overflow-hidden">
                                <div className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                                    <div>
                                        <p className="text-text-primary font-medium">{t('modals.emailDigest')}</p>
                                        <p className="text-xs text-text-secondary">Daily summary at 9:00 AM</p>
                                    </div>
                                    <Switch checked={notifications.emailDigest} onChange={(c) => setNotifications(p => ({...p, emailDigest: c}))} />
                                </div>
                                <div className="h-px bg-border mx-4"></div>
                                <div className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                                    <div>
                                        <p className="text-text-primary font-medium">{t('modals.pushNotifications')}</p>
                                        <p className="text-xs text-text-secondary">Real-time browser alerts</p>
                                    </div>
                                    <Switch checked={notifications.push} onChange={(c) => setNotifications(p => ({...p, push: c}))} />
                                </div>
                                <div className="h-px bg-border mx-4"></div>
                                <div className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                                    <div>
                                        <p className="text-text-primary font-medium">{t('modals.mentions')}</p>
                                        <p className="text-xs text-text-secondary">When someone tags you (@user)</p>
                                    </div>
                                    <Switch checked={notifications.mentions} onChange={(c) => setNotifications(p => ({...p, mentions: c}))} />
                                </div>
                                <div className="h-px bg-border mx-4"></div>
                                <div className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                                    <div>
                                        <p className="text-text-primary font-medium">{t('modals.taskAssignments')}</p>
                                        <p className="text-xs text-text-secondary">When a task is assigned to you</p>
                                    </div>
                                    <Switch checked={notifications.assignments} onChange={(c) => setNotifications(p => ({...p, assignments: c}))} />
                                </div>
                            </div>
                         </div>
                    </div>
                )}

                {/* Integrations Settings */}
                {activeTab === SettingsTab.Integrations && (
                    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
                         <div>
                            <h3 className="text-xl font-bold text-text-primary mb-1">{t('modals.integrations')}</h3>
                            <p className="text-text-secondary mb-6 text-sm">Connect with your favorite tools.</p>

                            <div className="grid gap-4">
                                {[
                                    { name: 'Google Calendar', icon: '📅', desc: 'Sync deadlines to your calendar.', connected: true },
                                    { name: 'Slack', icon: '💬', desc: 'Get updates in your team channel.', connected: false },
                                    { name: 'GitHub', icon: '🐙', desc: 'Link PRs and commits to tasks.', connected: false },
                                    { name: 'Figma', icon: '🎨', desc: 'Embed designs directly in tasks.', connected: false }
                                ].map(integration => (
                                    <div key={integration.name} className="bg-surface border border-border p-5 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center text-2xl">
                                                {integration.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-text-primary flex items-center gap-2">
                                                    {integration.name}
                                                    {integration.connected && <span className="text-[10px] bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">{t('modals.connected')}</span>}
                                                </h4>
                                                <p className="text-sm text-text-secondary">{integration.desc}</p>
                                            </div>
                                        </div>
                                        <button 
                                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${integration.connected ? 'bg-secondary text-text-primary hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-transparent' : 'bg-primary text-white hover:bg-primary-focus shadow-lg shadow-primary/20'}`}
                                        >
                                            {integration.connected ? 'Configure' : t('modals.connect')}
                                        </button>
                                    </div>
                                ))}
                            </div>
                         </div>
                    </div>
                )}

            </main>
            
            <div className="p-4 sm:p-6 border-t border-border bg-surface flex justify-end gap-3">
                 <button onClick={onClose} className="px-5 py-2.5 text-text-secondary font-semibold hover:bg-secondary rounded-lg transition-colors">
                    {t('common.cancel')}
                 </button>
                <button 
                    onClick={onClose}
                    className="px-8 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-focus transition-colors shadow-lg shadow-primary/20"
                >
                    {t('common.save')}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
