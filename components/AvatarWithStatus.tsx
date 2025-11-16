import React from 'react';
import { User, UserStatus } from '../types';

interface AvatarWithStatusProps {
  user: User;
  className?: string; // e.g., "w-8 h-8"
}

const statusColorMap: Record<UserStatus, string> = {
  [UserStatus.Online]: 'bg-green-500',
  [UserStatus.Away]: 'bg-yellow-500',
  [UserStatus.Busy]: 'bg-red-500',
  [UserStatus.Offline]: 'bg-gray-500',
};

const AvatarWithStatus: React.FC<AvatarWithStatusProps> = ({ user, className = 'w-8 h-8' }) => {
  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <img
        src={user.avatar}
        alt={user.name}
        className="w-full h-full rounded-full object-cover"
      />
      <span
        className={`absolute bottom-0 right-0 block w-1/4 h-1/4 rounded-full border-2 border-surface ${statusColorMap[user.status]}`}
        title={`Estado: ${user.status}`}
      ></span>
    </div>
  );
};

export default AvatarWithStatus;
