import React, { useState, useRef, useEffect } from 'react';
import { User, Role, UserStatus } from '../types';
import { useTranslation } from '../i18n';

interface UserPanelProps {
  currentUser: User;
  onOpenUserProfile: () => void;
  onLogout: () => void;
  onClose: () => void;
  onUpdateUserStatus: (userId: string, status: UserStatus) => void;
}

const UserPanel: React.FC<UserPanelProps> = ({
  currentUser,
  onOpenUserProfile,
  onLogout,
  onClose,
  onUpdateUserStatus,
}) => {
  const { t } = useTranslation();
  const [isStatusSelectorOpen, setIsStatusSelectorOpen] = useState(false);
  const statusSelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        // This check ensures we don't close when clicking the main button that opens the dropdown
        if (statusSelectorRef.current && !statusSelectorRef.current.contains(event.target as Node)) {
            setIsStatusSelectorOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
    
  const statusOptions: { status: UserStatus; label: string; color: string }[] = [
    { status: UserStatus.Online, label: t('common.online'), color: 'bg-green-500' },
    { status: UserStatus.Away, label: t('common.away'), color: 'bg-yellow-500' },
    { status: UserStatus.Busy, label: t('common.busy'), color: 'bg-red-500' },
    { status: UserStatus.Offline, label: t('common.offline'), color: 'bg-gray-500' },
  ];

  const currentStatusOption = statusOptions.find(o => o.status === currentUser.status) || statusOptions[0];

  return (
    <div className="absolute bottom-full mb-2 w-72 bg-surface rounded-lg shadow-lg border border-border z-50 animate-fadeIn flex flex-col">
      <div className="p-2">
        <button onClick={() => { onOpenUserProfile(); onClose(); }} className="w-full text-left p-2 rounded-md hover:bg-secondary-focus flex items-center text-text-secondary hover:text-text-primary text-sm">{t('sidebar.viewProfile')}</button>
        
        <div className="border-t border-border my-1"></div>
        
        <div className="p-2">
            <p className="text-xs font-semibold text-text-secondary mb-2">{t('sidebar.setStatus')}</p>
            <div className="relative" ref={statusSelectorRef}>
                <button
                    onClick={() => setIsStatusSelectorOpen(p => !p)}
                    className="w-full text-left p-2 rounded-md hover:bg-secondary-focus flex items-center justify-between text-sm"
                >
                    <div className="flex items-center">
                        <span className={`w-3 h-3 rounded-full mr-3 ${currentStatusOption.color}`}></span>
                        <span className="text-text-primary">{currentStatusOption.label}</span>
                    </div>
                    <svg className={`w-4 h-4 text-text-secondary transition-transform ${isStatusSelectorOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
                {isStatusSelectorOpen && (
                    <div className="absolute bottom-full mb-1 w-full bg-secondary-focus rounded-lg shadow-lg border border-border z-20 animate-fadeIn p-1">
                        {statusOptions.map(({ status, label, color }) => (
                            <button
                                key={status}
                                onClick={() => {
                                    onUpdateUserStatus(currentUser.id, status);
                                    onClose();
                                }}
                                className="w-full text-left p-2 hover:bg-surface rounded-md flex items-center text-sm text-text-secondary hover:text-text-primary"
                            >
                                <span className={`w-3 h-3 rounded-full mr-3 ${color}`}></span>
                                <span>{label}</span>
                                {currentUser.status === status && (
                                     <svg className="w-4 h-4 text-primary ml-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

        <div className="border-t border-border my-1"></div>
        <button onClick={onLogout} className="w-full text-left p-2 rounded-md hover:bg-secondary-focus flex items-center text-red-400 hover:text-red-300 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
          {t('sidebar.logout')}
        </button>
      </div>
    </div>
  );
};

export default UserPanel;