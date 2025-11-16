import React from 'react';
import { User } from '../../types';
import AvatarWithStatus from '../AvatarWithStatus';

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onSelectUser: (user: User) => void;
}

const UserListModal: React.FC<UserListModalProps> = ({ isOpen, onClose, users, onSelectUser }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-surface rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-2xl font-bold text-text-primary">Todos los Usuarios ({users.length})</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Cerrar modal">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="p-6 overflow-y-auto flex-grow">
          <div className="space-y-3">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => onSelectUser(user)}
                className="w-full text-left bg-secondary p-3 rounded-lg flex items-center hover:bg-secondary-focus transition-colors"
              >
                <AvatarWithStatus user={user} className="w-10 h-10" />
                <div className="ml-4 flex-grow">
                  <p className="font-semibold text-text-primary">{user.name}</p>
                  <p className="text-sm text-text-secondary">{user.title}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-text-secondary">{user.email}</p>
                    <span className="bg-primary/20 text-primary text-xs font-medium px-2.5 py-0.5 rounded-full">{user.role}</span>
                </div>
              </button>
            ))}
          </div>
        </main>
        
        <footer className="p-4 border-t border-border flex justify-end">
            <button onClick={onClose} className="px-5 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-focus transition-colors duration-200">
                Cerrar
            </button>
        </footer>
      </div>
    </div>
  );
};

export default UserListModal;