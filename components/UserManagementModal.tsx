import React, { useState, useMemo } from 'react';
import { User, Role } from '../types';
import AvatarWithStatus from './AvatarWithStatus';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onUpdateUserRole: (userId: string, role: Role) => void;
  onCreateUser: (name: string, role: Role) => void;
  onDeleteUser: (userId: string) => void;
  currentUser: User;
  onEditUser: (user: User) => void;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  users,
  onUpdateUserRole,
  onCreateUser,
  onDeleteUser,
  currentUser,
  onEditUser,
}) => {
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>(Role.Member);

  const adminCount = useMemo(() => users.filter(u => u.role === Role.Admin).length, [users]);

  if (!isOpen) return null;

  const canManageRoles = currentUser.role === Role.Admin;

  const handleAddUser = () => {
    if (newUserName.trim() === '') {
        alert("El nombre de usuario no puede estar vacío.");
        return;
    }
    onCreateUser(newUserName.trim(), newUserRole);
    setNewUserName('');
    setNewUserRole(Role.Member);
  };

  const handleDeleteUserClick = (user: User) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${user.name}? Todas sus tareas asignadas quedarán sin asignar.`)) {
        onDeleteUser(user.id);
    }
  };

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
          <h2 className="text-2xl font-bold text-text-primary">Gestionar Miembros</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Cerrar modal">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="p-6 overflow-y-auto flex-grow">
          <div className="space-y-4">
            {users.map((user) => {
              const isLastAdmin = user.role === Role.Admin && adminCount <= 1;
              return (
                <div key={user.id} className="flex items-center justify-between bg-secondary p-3 rounded-lg">
                  <div className="flex items-center">
                    <AvatarWithStatus user={user} className="w-10 h-10" />
                    <div className="ml-4">
                      <p className="font-semibold text-text-primary">{user.name} {user.id === currentUser.id ? <span className="text-xs font-normal text-text-secondary">(Tú)</span> : ""}</p>
                      <p className="text-sm text-text-secondary">{user.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={user.role}
                      onChange={(e) => onUpdateUserRole(user.id, e.target.value as Role)}
                      disabled={!canManageRoles || user.id === currentUser.id || isLastAdmin}
                      className="bg-surface border border-border rounded-md px-3 py-1.5 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={`Rol para ${user.name}`}
                      title={isLastAdmin ? 'No se puede cambiar el rol del último administrador' : ''}
                    >
                      {Object.values(Role).map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                     {canManageRoles && user.id !== currentUser.id && (
                      <>
                      <button
                          onClick={() => onEditUser(user)}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors"
                          aria-label={`Editar ${user.name}`}
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                              <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                          </svg>
                      </button>
                       <button
                          onClick={() => handleDeleteUserClick(user)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-400 disabled:hover:bg-transparent"
                          disabled={isLastAdmin}
                          aria-label={`Eliminar ${user.name}`}
                          title={isLastAdmin ? 'No se puede eliminar al último administrador' : ''}
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                          </svg>
                      </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {canManageRoles && (
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-lg font-semibold text-text-primary mb-3">Añadir Nuevo Miembro</h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Nombre Completo"
                  className="flex-grow p-2 bg-secondary rounded-md border border-border focus:ring-primary focus:border-primary"
                />
                <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as Role)}
                    className="bg-secondary border border-border rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                >
                    {Object.values(Role).filter(r => r !== Role.Admin).map(role => (
                        <option key={role} value={role}>{role}</option>
                    ))}
                </select>
                <button
                  onClick={handleAddUser}
                  className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-focus transition-colors duration-200"
                >
                  Añadir Usuario
                </button>
              </div>
            </div>
          )}
        </main>

        <footer className="p-4 bg-secondary/50 border-t border-border flex flex-col-reverse sm:flex-row sm:justify-between items-center text-sm">
          <p className="text-text-secondary mt-2 sm:mt-0">
            {canManageRoles ? "Puedes gestionar los roles de los usuarios." : "Solo los administradores pueden gestionar los roles."}
          </p>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 bg-secondary text-text-primary font-semibold rounded-lg hover:bg-secondary-focus transition-colors duration-200"
          >
            Hecho
          </button>
        </footer>
      </div>
    </div>
  );
};

export default UserManagementModal;
