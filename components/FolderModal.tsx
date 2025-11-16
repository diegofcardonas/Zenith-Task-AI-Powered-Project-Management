import React, { useState, useEffect } from 'react';
import { Folder } from '../types';

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  folderToEdit?: Folder | null;
}

const FolderModal: React.FC<FolderModalProps> = ({ isOpen, onClose, onSave, folderToEdit }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (folderToEdit) {
      setName(folderToEdit.name);
    } else {
      setName('');
    }
  }, [folderToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSaveClick = () => {
    if (name.trim()) {
      onSave(name.trim());
      onClose();
    } else {
      alert("El nombre de la carpeta no puede estar vacío.");
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveClick();
    }
  };

  const isEditing = !!folderToEdit;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm animate-fadeIn" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-surface rounded-xl shadow-2xl w-full max-w-md flex flex-col animate-scaleIn" onClick={e => e.stopPropagation()}>
        <header className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-2xl font-bold text-text-primary">{isEditing ? 'Editar Carpeta' : 'Crear Nueva Carpeta'}</h2>
           <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Cerrar">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <main className="p-6">
          <label htmlFor="folderName" className="text-sm font-semibold text-text-secondary">Nombre de la Carpeta</label>
          <input
            id="folderName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="p. ej. Iniciativas Q3"
            className="w-full mt-1 p-2 bg-secondary rounded-md border border-border focus:ring-primary focus:border-primary"
            autoFocus
          />
        </main>
        <footer className="p-6 border-t border-border flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-secondary text-text-primary font-semibold rounded-lg hover:bg-secondary-focus transition-colors duration-200">
            Cancelar
          </button>
          <button onClick={handleSaveClick} className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-focus transition-colors duration-200">
            {isEditing ? 'Guardar Cambios' : 'Crear Carpeta'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default FolderModal;