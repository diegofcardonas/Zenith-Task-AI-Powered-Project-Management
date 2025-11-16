import React, { useMemo, useState } from 'react';
import { Task, User, Role, Workspace, List, Toast, Notification } from '../../types';
import Header from '../Header';
import StatCard from './StatCard';
import AvatarWithStatus from '../AvatarWithStatus';
import TaskListModal from './TaskListModal';
import UserListModal from './UserListModal';

const WorkspaceListModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  workspaces: Workspace[];
  onSelectWorkspace: (workspaceId: string) => void;
}> = ({ isOpen, onClose, workspaces, onSelectWorkspace }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm animate-fadeIn" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-surface rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-scaleIn" onClick={(e) => e.stopPropagation()}>
        <header className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-2xl font-bold text-text-primary">Todos los Espacios de Trabajo ({workspaces.length})</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Cerrar modal"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </header>
        <main className="p-6 overflow-y-auto flex-grow">
          <div className="space-y-3">
            {workspaces.map((workspace) => (
              <button key={workspace.id} onClick={() => { onSelectWorkspace(workspace.id); onClose(); }} className="w-full text-left bg-secondary p-3 rounded-lg flex items-center hover:bg-secondary-focus transition-colors">
                <div className="w-8 h-8 rounded-md bg-primary flex-shrink-0 flex items-center justify-center mr-4 font-bold text-white text-lg">{workspace.name.charAt(0).toUpperCase()}</div>
                <p className="font-semibold text-text-primary">{workspace.name}</p>
              </button>
            ))}
          </div>
        </main>
        <footer className="p-4 border-t border-border flex justify-end"><button onClick={onClose} className="px-5 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-focus transition-colors duration-200">Cerrar</button></footer>
      </div>
    </div>
  );
};

const ProjectListModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  lists: List[];
  onNavigateToList: (listId: string) => void;
}> = ({ isOpen, onClose, lists, onNavigateToList }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm animate-fadeIn" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-surface rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-scaleIn" onClick={(e) => e.stopPropagation()}>
        <header className="p-6 border-b border-border flex justify-between items-center"><h2 className="text-2xl font-bold text-text-primary">Todos los Proyectos ({lists.length})</h2><button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Cerrar modal"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></header>
        <main className="p-6 overflow-y-auto flex-grow">
          <div className="space-y-3">
            {lists.map((list) => (
              <button key={list.id} onClick={() => { onNavigateToList(list.id); onClose(); }} className="w-full text-left bg-secondary p-3 rounded-lg flex items-center hover:bg-secondary-focus transition-colors">
                <span className={`w-4 h-4 rounded-full mr-4 ${list.color}`}></span>
                <p className="font-semibold text-text-primary">{list.name}</p>
              </button>
            ))}
          </div>
        </main>
        <footer className="p-4 border-t border-border flex justify-end"><button onClick={onClose} className="px-5 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-focus transition-colors duration-200">Cerrar</button></footer>
      </div>
    </div>
  );
};

interface AppAdminPanelProps {
  workspaces: Workspace[];
  lists: List[];
  tasks: Task[];
  users: User[];
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  currentUser: User;
  onOpenUserProfile: () => void;
  onUpdateWorkspace: (workspace: Workspace) => void;
  onDeleteWorkspace: (workspaceId: string) => void;
  onUpdateUserRole: (userId: string, newRole: Role) => void;
  onDeleteUser: (userId: string) => void;
  onEditUser: (user: User) => void;
  onCreateUser: (name: string, role: Role) => void;
  onEditWorkspace: (workspace: Workspace) => void;
  addToast: (message: string, type: Toast['type']) => void;
  onSelectTask: (task: Task) => void;
  onNavigateToList: (listId: string) => void;
  setEditingUser: (user: User | null) => void;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  onSelectWorkspace: (workspaceId: string) => void;
}

const AppAdminPanel: React.FC<AppAdminPanelProps> = ({
  workspaces,
  lists,
  tasks,
  users,
  onToggleSidebar,
  isSidebarOpen,
  currentUser,
  onOpenUserProfile,
  onUpdateWorkspace,
  onDeleteWorkspace,
  onUpdateUserRole,
  onDeleteUser,
  onEditUser,
  onCreateUser,
  onEditWorkspace,
  onSelectTask,
  onNavigateToList,
  setEditingUser,
  notifications,
  setNotifications,
  onSelectWorkspace,
}) => {
    const [newUserName, setNewUserName] = useState('');
    const [newUserRole, setNewUserRole] = useState<Role>(Role.Member);
    const [isWorkspaceListModalOpen, setIsWorkspaceListModalOpen] = useState(false);
    const [isProjectListModalOpen, setIsProjectListModalOpen] = useState(false);
    const [isTaskListModalOpen, setIsTaskListModalOpen] = useState(false);
    const [isUserListModalOpen, setIsUserListModalOpen] = useState(false);


    const globalStats = useMemo(() => ({
        totalWorkspaces: workspaces.length,
        totalLists: lists.length,
        totalTasks: tasks.length,
        totalUsers: users.length,
    }), [workspaces, lists, tasks, users]);

    const adminCount = useMemo(() => users.filter(u => u.role === Role.Admin).length, [users]);

    const handleWorkspaceDelete = (workspace: Workspace) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar el espacio de trabajo "${workspace.name}"? Esto eliminará todos los proyectos y tareas asociados.`)) {
            onDeleteWorkspace(workspace.id);
        }
    };

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
        <main className="flex-grow flex flex-col h-full overflow-y-auto">
            <Header
                title="Administración de la Aplicación"
                onToggleSidebar={onToggleSidebar}
                isSidebarOpen={isSidebarOpen}
                currentUser={currentUser}
                onOpenUserProfile={onOpenUserProfile}
                allTasks={tasks}
                allLists={lists}
                allUsers={users}
                onSelectTask={onSelectTask}
                onNavigateToList={onNavigateToList}
                setEditingUser={setEditingUser}
                notifications={notifications}
                setNotifications={setNotifications}
            />
            <div className="flex-grow p-3 sm:p-6 space-y-6">
                {/* Global Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Espacios de Trabajo" value={globalStats.totalWorkspaces} icon="list" onClick={() => setIsWorkspaceListModalOpen(true)} />
                    <StatCard title="Proyectos Totales" value={globalStats.totalLists} icon="check" onClick={() => setIsProjectListModalOpen(true)} />
                    <StatCard title="Tareas Totales" value={globalStats.totalTasks} icon="alert" onClick={() => setIsTaskListModalOpen(true)} />
                    <StatCard title="Usuarios Totales" value={globalStats.totalUsers} icon="users" onClick={() => setIsUserListModalOpen(true)} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Workspace Management */}
                    <div className="bg-surface rounded-lg p-6 animate-fadeIn">
                        <h2 className="text-xl font-semibold mb-4">Gestión de Espacios de Trabajo</h2>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {workspaces.map(ws => (
                                <div key={ws.id} className="bg-secondary p-3 rounded-lg flex justify-between items-center">
                                    <span className="font-semibold">{ws.name}</span>
                                    <div>
                                        <button onClick={() => onEditWorkspace(ws)} className="p-2 text-text-secondary hover:text-blue-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
                                        <button onClick={() => handleWorkspaceDelete(ws)} className="p-2 text-text-secondary hover:text-red-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Add User Form */}
                    <div className="bg-surface rounded-lg p-6 animate-fadeIn">
                        <h2 className="text-xl font-semibold mb-4">Añadir Nuevo Miembro</h2>
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
                </div>

                {/* User Management Table */}
                <div className="bg-surface rounded-lg p-6 animate-fadeIn lg:col-span-3">
                    <h2 className="text-xl font-semibold mb-4">Gestión de Usuarios</h2>
                     <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left text-text-secondary">
                          <thead className="text-xs uppercase bg-secondary">
                            <tr>
                              <th scope="col" className="px-6 py-3">Usuario</th>
                              <th scope="col" className="px-6 py-3">Correo</th>
                              <th scope="col" className="px-6 py-3">Rol</th>
                              <th scope="col" className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.map(user => {
                              const isLastAdmin = user.role === Role.Admin && adminCount <= 1;
                              return (
                                <tr key={user.id} className="bg-surface border-b border-border">
                                  <th scope="row" className="px-6 py-4 font-medium text-text-primary whitespace-nowrap flex items-center">
                                      <AvatarWithStatus user={user} className="w-8 h-8 mr-3" />
                                      {user.name}
                                  </th>
                                  <td className="px-6 py-4">{user.email}</td>
                                  <td className="px-6 py-4">
                                       <select
                                          value={user.role}
                                          onChange={(e) => onUpdateUserRole(user.id, e.target.value as Role)}
                                          disabled={user.id === currentUser.id || isLastAdmin}
                                          className="bg-secondary border border-transparent hover:border-border rounded-md px-2 py-1 text-sm focus:ring-primary focus:border-primary disabled:opacity-50"
                                          title={isLastAdmin ? 'No se puede cambiar el rol del último administrador' : ''}
                                      >
                                          {Object.values(Role).map((role) => <option key={role} value={role}>{role}</option>)}
                                      </select>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                       {user.id !== currentUser.id && (
                                          <div className="flex items-center justify-end gap-1">
                                              <button
                                                  onClick={() => onEditUser(user)}
                                                  className="p-2 text-text-secondary hover:text-blue-400 rounded-full hover:bg-blue-500/10 transition-colors"
                                                  aria-label={`Editar ${user.name}`}
                                                  title={`Editar ${user.name}`}
                                              >
                                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                                      <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                                                  </svg>
                                              </button>
                                              <button
                                                  onClick={() => handleDeleteUserClick(user)}
                                                  disabled={isLastAdmin}
                                                  className="p-2 text-text-secondary hover:text-red-400 rounded-full hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                  title={isLastAdmin ? 'No se puede eliminar al último administrador' : `Eliminar ${user.name}`}
                                                  aria-label={`Eliminar ${user.name}`}
                                              >
                                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                                  </svg>
                                              </button>
                                          </div>
                                       )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {isWorkspaceListModalOpen && (
                <WorkspaceListModal 
                    isOpen={isWorkspaceListModalOpen}
                    onClose={() => setIsWorkspaceListModalOpen(false)}
                    workspaces={workspaces}
                    onSelectWorkspace={onSelectWorkspace}
                />
            )}
            {isProjectListModalOpen && (
                <ProjectListModal
                    isOpen={isProjectListModalOpen}
                    onClose={() => setIsProjectListModalOpen(false)}
                    lists={lists}
                    onNavigateToList={onNavigateToList}
                />
            )}
            {isTaskListModalOpen && (
                <TaskListModal
                    isOpen={isTaskListModalOpen}
                    onClose={() => setIsTaskListModalOpen(false)}
                    title="Todas las Tareas"
                    tasks={tasks}
                    users={users}
                    onSelectTask={(task) => {
                        onSelectTask(task);
                        setIsTaskListModalOpen(false);
                    }}
                />
            )}
            {isUserListModalOpen && (
                <UserListModal
                    isOpen={isUserListModalOpen}
                    onClose={() => setIsUserListModalOpen(false)}
                    users={users}
                    onSelectUser={(user) => {
                        setEditingUser(user);
                        setIsUserListModalOpen(false);
                    }}
                />
            )}
        </main>
    );
}

export default AppAdminPanel;