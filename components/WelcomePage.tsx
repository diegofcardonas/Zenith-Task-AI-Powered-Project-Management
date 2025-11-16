import React from 'react';
import Logo from './Logo';

const WelcomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-text-primary animate-fadeIn">
      <div className="animate-pulse">
        <Logo />
      </div>
      <p className="mt-4 text-text-secondary">Cargando tu espacio de trabajo...</p>
    </div>
  );
};

export default WelcomePage;
