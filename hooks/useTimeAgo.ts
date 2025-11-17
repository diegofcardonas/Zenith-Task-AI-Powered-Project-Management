import { useCallback } from 'react';
import { useTranslation } from '../i18n';

export const useTimeAgo = () => {
    const { t } = useTranslation();

    const timeAgo = useCallback((date: string): string => {
        if (!date) return '';
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return t('common.yearsAgo', { count: Math.floor(interval) });
        interval = seconds / 2592000;
        if (interval > 1) return t('common.monthsAgo', { count: Math.floor(interval) });
        interval = seconds / 86400;
        if (interval > 1) return t('common.daysAgo', { count: Math.floor(interval) });
        interval = seconds / 3600;
        if (interval > 1) return t('common.hoursAgo', { count: Math.floor(interval) });
        interval = seconds / 60;
        if (interval > 1) return t('common.minutesAgo', { count: Math.floor(interval) });
        return t('common.justNow');
    }, [t]);

    return timeAgo;
};
