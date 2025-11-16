import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <svg
        width="32"
        height="32"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        <path
          d="M5 10 L15 10 L25 30 L35 30"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M25 10 L35 10"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 30 L15 30"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* AI Sparkle */}
        <path
          d="M30 5 L31 7 L33 8 L31 9 L30 11 L29 9 L27 8 L29 7 Z"
          fill="var(--accent)"
        />
      </svg>
      <span className="text-xl font-bold text-text-primary">Zenith Task</span>
    </div>
  );
};

export default Logo;
