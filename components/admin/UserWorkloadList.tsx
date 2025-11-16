import React, { useMemo, useState, useEffect } from 'react';
import { Task, User } from '../../types';
import AvatarWithStatus from '../AvatarWithStatus';

interface UserWorkloadListProps {
  users: User[];
  tasks: Task[];
  onUserSelect: (userId: string) => void;
}

const ITEMS_PER_PAGE = 5;

const UserWorkloadList: React.FC<UserWorkloadListProps> = ({ users, tasks, onUserSelect }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const workloadData = useMemo(() => {
    const taskCounts = new Map<string, number>();
    tasks.forEach(task => {
      if (task.assigneeId) {
        taskCounts.set(task.assigneeId, (taskCounts.get(task.assigneeId) || 0) + 1);
      }
    });

    return users
      .map(user => ({
        ...user,
        taskCount: taskCounts.get(user.id) || 0,
      }))
      .filter(user => user.taskCount > 0)
      .sort((a, b) => b.taskCount - a.taskCount);
  }, [users, tasks]);
  
  // Reset to page 1 when the filter (tasks) changes
  useEffect(() => {
    setCurrentPage(1);
  }, [tasks]);

  const totalPages = Math.ceil(workloadData.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return workloadData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, workloadData]);

  if (workloadData.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-text-secondary italic">
        No hay usuarios para mostrar con el filtro actual.
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-text-secondary">
          <thead className="text-xs uppercase bg-secondary">
            <tr>
              <th scope="col" className="px-6 py-3">
                Miembros
              </th>
              <th scope="col" className="px-6 py-3">
                Equipo
              </th>
              <th scope="col" className="px-6 py-3">
                Rol
              </th>
              <th scope="col" className="px-6 py-3 text-right">
                Tareas Asignadas
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map(user => (
              <tr 
                key={user.id} 
                className="bg-surface border-b border-border hover:bg-secondary-focus cursor-pointer"
                onClick={() => onUserSelect(user.id)}
              >
                <th scope="row" className="px-6 py-4 font-medium text-text-primary whitespace-nowrap flex items-center">
                  <AvatarWithStatus user={user} className="w-8 h-8 mr-3" />
                  {user.name}
                </th>
                <td className="px-6 py-4">
                  {user.team}
                </td>
                <td className="px-6 py-4">
                  <span className="bg-primary/20 text-primary text-xs font-medium px-2.5 py-0.5 rounded-full">{user.role}</span>
                </td>
                <td className="px-6 py-4 text-right text-text-primary font-semibold text-base">
                  {user.taskCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-text-secondary">
            Página <span className="font-semibold text-text-primary">{currentPage}</span> de <span className="font-semibold text-text-primary">{totalPages}</span>
          </span>
          <div className="inline-flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-medium bg-secondary rounded-md hover:bg-secondary-focus disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm font-medium bg-secondary rounded-md hover:bg-secondary-focus disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserWorkloadList;
