import React from 'react';
import { themes, ThemeName, ColorScheme } from '../themes';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, theme, setTheme, colorScheme, setColorScheme }) => {
  
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-surface rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-2xl font-bold text-text-primary">Configuración</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Cerrar">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="p-6 overflow-y-auto flex-grow">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-3">Apariencia</h3>
                    <div className="p-4 bg-secondary rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-text-primary">Modo de Color</label>
                            <div className="flex items-center gap-1 bg-surface p-1 rounded-full">
                                <button onClick={() => setColorScheme('light')} title="Modo Claro" className={`p-1.5 rounded-full ${colorScheme === 'light' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-secondary-focus'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 14.95a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707zm-2.12-10.607a1 1 0 011.414 0l.707.707a1 1 0 11-1.414-1.414l-.707-.707a1 1 0 010-1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" /></svg>
                                </button>
                                <button onClick={() => setColorScheme('dark')} title="Modo Oscuro" className={`p-1.5 rounded-full ${colorScheme === 'dark' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-secondary-focus'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="text-text-primary mb-2 block">Tema</label>
                            <div className="grid grid-cols-3 gap-3">
                                {Object.keys(themes).map(themeKey => {
                                    const t_theme = themes[themeKey as ThemeName][colorScheme];
                                    const themeName = themeKey.charAt(0).toUpperCase() + themeKey.slice(1);
                                    return (
                                        <button key={themeKey} onClick={() => setTheme(themeKey as ThemeName)} className={`p-2 rounded-lg text-center border-2 ${theme === themeKey ? 'border-primary' : 'border-border'}`} style={{ backgroundColor: t_theme.surface }}>
                                            <div className="flex items-center justify-center gap-1.5 mb-1">
                                                <span className="w-4 h-4 rounded-full" style={{backgroundColor: t_theme.primary}}></span>
                                                <span className="w-4 h-4 rounded-full" style={{backgroundColor: t_theme.accent}}></span>
                                            </div>
                                            <span className="text-xs font-semibold" style={{color: t_theme['text-primary']}}>{themeName}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
        
        <footer className="p-4 bg-secondary/50 border-t border-border flex justify-end">
            <button onClick={onClose} className="px-5 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-focus transition-colors duration-200">
                Hecho
            </button>
        </footer>
      </div>
    </div>
  );
};

export default SettingsModal;
