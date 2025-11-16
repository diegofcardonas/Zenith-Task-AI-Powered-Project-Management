import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import AvatarWithStatus from './AvatarWithStatus';

interface UserProfileModalProps {
  user: User;
  onClose: () => void;
  onUpdateUser: (user: User) => void;
  isEditingSelf: boolean;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onClose, onUpdateUser, isEditingSelf }) => {
  const [editedUser, setEditedUser] = useState(user);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditedUser(user);
  }, [user]);

  const handleSave = () => {
    if (!editedUser.name.trim()) {
        alert("El nombre no puede estar vacío.");
        return;
    }
    onUpdateUser({ ...editedUser, name: editedUser.name.trim() });
    onClose();
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setEditedUser(prev => ({...prev, avatar: reader.result as string }));
        };
        reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
      avatarInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-surface rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-2xl font-bold text-text-primary">{isEditingSelf ? 'Editar Tu Perfil' : `Editar Perfil de ${user.name}`}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Cerrar modal">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="p-6 overflow-y-auto flex-grow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 flex flex-col items-center">
                    <div className="relative">
                        <AvatarWithStatus user={editedUser} className="w-32 h-32" />
                         <input
                            type="file"
                            ref={avatarInputRef}
                            onChange={handleAvatarChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <button 
                            onClick={handleAvatarClick}
                            className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 hover:bg-primary-focus transition-transform duration-200 transform hover:scale-110"
                            title="Cambiar avatar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="userName" className="text-sm font-semibold text-text-secondary">Nombre Completo</label>
                            <input id="userName" name="name" type="text" value={editedUser.name} onChange={handleInputChange} className="w-full mt-1 p-2 bg-secondary rounded-md border border-border focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                             <label htmlFor="userTitle" className="text-sm font-semibold text-text-secondary">Cargo</label>
                            <input id="userTitle" name="title" type="text" value={editedUser.title} onChange={handleInputChange} className="w-full mt-1 p-2 bg-secondary rounded-md border border-border focus:ring-primary focus:border-primary" />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="userEmail" className="text-sm font-semibold text-text-secondary">Correo</label>
                            <input id="userEmail" name="email" type="email" value={editedUser.email} onChange={handleInputChange} className="w-full mt-1 p-2 bg-secondary rounded-md border border-border focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                             <label htmlFor="userTeam" className="text-sm font-semibold text-text-secondary">Equipo</label>
                            <input id="userTeam" name="team" type="text" value={editedUser.team} onChange={handleInputChange} className="w-full mt-1 p-2 bg-secondary rounded-md border border-border focus:ring-primary focus:border-primary" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <label htmlFor="userBio" className="text-sm font-semibold text-text-secondary">Acerca de mí</label>
                <textarea
                    id="userBio"
                    name="bio"
                    value={editedUser.bio}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full mt-1 p-2 bg-secondary rounded-md border border-border focus:ring-primary focus:border-primary"
                    placeholder="Escribe una breve biografía..."
                />
            </div>
        </main>

        <footer className="p-6 border-t border-border flex justify-end gap-4">
            <button onClick={onClose} className="px-4 py-2 bg-secondary text-text-primary font-semibold rounded-lg hover:bg-secondary-focus transition-colors duration-200">
                Cancelar
            </button>
            <button onClick={handleSave} className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-focus transition-colors duration-200">
                Guardar Cambios
            </button>
        </footer>
      </div>
    </div>
  );
};

export default UserProfileModal;