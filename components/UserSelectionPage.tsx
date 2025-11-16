import React from 'react';
import { User } from '../types';
import AvatarWithStatus from './AvatarWithStatus';

interface UserSelectionPageProps {
  users: User[];
  onSelectUser: (userId: string) => void;
}

const UserSelectionPage: React.FC<UserSelectionPageProps> = ({ users, onSelectUser }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-text-primary mb-2">Bienvenido a Zenith Task</h1>
        <p className="text-lg text-text-secondary mb-8">Por favor, selecciona tu perfil para continuar</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {users.map(user => (
            <button
              key={user.id}
              onClick={() => onSelectUser(user.id)}
              className="flex flex-col items-center p-4 bg-surface rounded-lg border border-border hover:border-primary hover:bg-secondary-focus transition-all duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <AvatarWithStatus user={user} className="w-20 h-20 mb-3 ring-2 ring-border" />
              <p className="font-semibold text-text-primary">{user.name}</p>
              <p className="text-sm text-text-secondary">{user.role}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserSelectionPage;
