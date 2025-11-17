import React from 'react';
import { Notification } from '../types';
import { useTranslation } from '../i18n';
import { useTimeAgo } from '../hooks/useTimeAgo';

interface NotificationsPanelProps {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  onClose: () => void;
  onNotificationClick: (notification: Notification) => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ notifications, setNotifications, onClose, onNotificationClick }) => {
  const { t } = useTranslation();
  const timeAgo = useTimeAgo();

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleItemClick = (notification: Notification) => {
    onNotificationClick(notification);
    onClose();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="absolute top-full mt-2 right-0 w-80 bg-surface rounded-lg shadow-lg border border-border z-50 animate-fadeIn flex flex-col max-h-[500px]">
      <header className="p-4 border-b border-border flex justify-between items-center">
        <h3 className="font-semibold text-text-primary">{t('notifications.title')}</h3>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllAsRead} className="text-xs text-primary hover:underline">{t('notifications.markAllAsRead')}</button>
        )}
      </header>
      <div className="overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map(n => (
            <button key={n.id} onClick={() => handleItemClick(n)} className={`w-full text-left p-3 flex items-start gap-3 hover:bg-secondary-focus ${!n.read ? 'bg-primary/10' : ''}`}>
              {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>}
              <div className={`flex-grow ${n.read ? 'pl-5' : ''}`}>
                <p className="text-sm text-text-primary">{n.text}</p>
                <p className="text-xs text-text-secondary mt-0.5">{timeAgo(n.timestamp)}</p>
              </div>
            </button>
          ))
        ) : (
          <p className="p-4 text-center text-sm text-text-secondary italic">{t('notifications.noNotifications')}</p>
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;