import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: 'list' | 'check' | 'alert' | 'users';
  onClick?: () => void;
  isActive?: boolean;
}

const ICONS: { [key: string]: React.JSX.Element } = {
  list: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
  check: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  alert: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  users: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, onClick, isActive }) => {
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      className={`bg-surface rounded-lg p-5 flex items-center justify-between animate-fadeIn border border-border transition-all duration-200 ${isClickable ? 'cursor-pointer hover:border-primary/50 hover:-translate-y-1' : ''} ${isActive ? 'bg-primary/10 border-primary' : ''}`}
    >
      <div>
        <p className="text-sm text-text-secondary font-medium uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold text-text-primary mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${isActive ? 'text-primary bg-primary/20' : 'text-primary bg-primary/10'}`}>
        {ICONS[icon]}
      </div>
    </div>
  );
};

export default StatCard;