import React, { useState, useEffect } from 'react';
import { List, Folder } from '../types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, color: string, folderId: string | null) => void;
  listToEdit?: List | null;
  folders: Folder[];
  workspaceId: string;
}

const COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
  'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
  'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
  'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500',
];

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onSave, listToEdit, folders, workspaceId }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[10]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  useEffect(() => {
    if (listToEdit) {
      setName(listToEdit.name);
      setColor(listToEdit.color);
      setSelectedFolderId(listToEdit.folderId || null);
    } else {
      setName('');
      setColor(COLORS[10]);
      setSelectedFolderId(null);
    }
  }, [listToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSaveClick = () => {
    if (name.trim()) {
      onSave(name.trim(), color, selectedFolderId);
    } else {
      alert("El nombre del proyecto no puede estar vacío.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveClick();
    }
  };

  const isEditing = !!listToEdit;
  const availableFolders = folders.filter(f => f.workspaceId === workspaceId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm animate-fadeIn" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-surface rounded-xl shadow-2xl w-full max-w-md flex flex-col animate-scaleIn" onClick={e => e.stopPropagation()}>
        <header className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-2xl font-bold text-text-primary">{isEditing ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}</h2>
           <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Cerrar">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <main className="p-6 space-y-4">
            <div>
                <label htmlFor="projectName" className="text-sm font-semibold text-text-secondary">Nombre del Proyecto</label>
                <input
                    id="projectName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="p. ej. Rediseño de Sitio Web"
                    className="w-full mt-1 p-2 bg-secondary rounded-md border border-border focus:ring-primary focus:border-primary"
                    autoFocus
                />
            </div>
            {availableFolders.length > 0 && (
                <div>
                    <label htmlFor="folderId" className="text-sm font-semibold text-text-secondary">Carpeta (Opcional)</label>
                    <select
                        id="folderId"
                        value={selectedFolderId || ''}
                        onChange={(e) => setSelectedFolderId(e.target.value || null)}
                        className="w-full mt-1 p-2 bg-secondary rounded-md border border-border focus:ring-primary focus:border-primary"
                    >
                        <option value="">Sin carpeta</option>
                        {availableFolders.map(folder => (
                            <option key={folder.id} value={folder.id}>{folder.name}</option>
                        ))}
                    </select>
                </div>
            )}
            <div>
                <label className="text-sm font-semibold text-text-secondary">Color</label>
                <div className="grid grid-cols-8 gap-2 mt-2">
                    {COLORS.map(c => (
                        <button 
                            key={c}
                            onClick={() => setColor(c)}
                            className={`w-8 h-8 rounded-full ${c} transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary`}
                        >
                            {color === c && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white mx-auto" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </main>
        <footer className="p-6 border-t border-border flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-secondary text-text-primary font-semibold rounded-lg hover:bg-secondary-focus transition-colors duration-200">
            Cancelar
          </button>
          <button onClick={handleSaveClick} className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-focus transition-colors duration-200">
            {isEditing ? 'Guardar Cambios' : 'Crear Proyecto'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ProjectModal;