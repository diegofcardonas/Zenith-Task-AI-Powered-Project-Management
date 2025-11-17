import React from 'react';
import Logo from './Logo';
import { useTranslation } from '../i18n';

const WelcomePage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-text-primary animate-fadeIn">
      <div className="animate-pulse">
        <Logo />
      </div>
      <p className="mt-4 text-text-secondary">{t('welcome.loading')}</p>
    </div>
  );
};

export default WelcomePage;