import React, { useState, useMemo, useRef } from 'react';
import { Task, Priority, User, Role, Permission } from '../types';
import { useTranslation } from '../i18n';
import { useAppContext } from '../contexts/AppContext';

const PRIORITY_COLORS: { [key in Priority]: string } = {
    [Priority.High]: 'bg-priority-high',
    [Priority.Medium]: 'bg-priority-medium',
    [Priority.Low]: 'bg-priority-low',
};

const DayTasksModal: React.FC<{
  day: Date;
  tasks: Task[];
  onClose: () => void;
  onSelectTask: (task: Task) => void;
}> = ({ day, tasks, onClose, onSelectTask }) => {
    const { i18n, t } = useTranslation();
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
            <div className="bg-surface rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col animate-scaleIn" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-border flex justify-between items-center">
                    <h3 className="font-semibold text-text-primary">{t('modals.dayTasksTitle', { day: day.toLocaleDateString(i18n.language, { weekday: 'long', month: 'long', day: 'numeric' }) })}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-secondary-focus" aria-label={t('common.close')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </header>
                <main className="p-4 overflow-y-auto">
                    <div className="space-y-2">
                        {tasks.sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map(task => (
                            <button key={task.id} onClick={() => { onSelectTask(task); onClose(); }} className="w-full text-left p-2 rounded-lg bg-secondary hover:bg-secondary-focus transition-colors flex items-start gap-2">
                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${PRIORITY_COLORS[task.priority]}`}></div>
                                <div className="flex-grow">
                                    <p className="font-semibold text-text-primary text-sm">{task.title}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};


interface CalendarViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  onAddTaskForDate: (date: Date) => void;
  currentUser: User;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onSelectTask, onAddTaskForDate, currentUser }) => {
    const { t, i18n } = useTranslation();
    const { permissions } = useAppContext();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [modalData, setModalData] = useState<{ day: Date; tasks: Task[] } | null>(null);
    const today = new Date();
    
    const canCreateTasks = permissions.has(Permission.CREATE_TASKS);

    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const daysInMonth = useMemo(() => {
        const days = [];
        const startingDay = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.
        const numDays = lastDayOfMonth.getDate();

        for (let i = 0; i < startingDay; i++) {
            days.push(null);
        }
        for (let i = 1; i <= numDays; i++) {
            days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
        }
        return days;
    }, [currentDate]);

    const tasksByDate = useMemo(() => {
        const map = new Map<string, Task[]>();
        tasks.forEach(task => {
            if (task.dueDate) {
                const date = new Date(task.dueDate);
                const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                if (!map.has(dateKey)) {
                    map.set(dateKey, []);
                }
                map.get(dateKey)!.push(task);
            }
        });
        return map;
    }, [tasks]);

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    };
    
    const weekdays = [t('weekdays.sun'), t('weekdays.mon'), t('weekdays.tue'), t('weekdays.wed'), t('weekdays.thu'), t('weekdays.fri'), t('weekdays.sat')];

    return (
        <div className="bg-surface rounded-lg h-full flex flex-col overflow-hidden border border-border md:border-none">
            <header className="p-3 md:p-4 border-b border-border flex justify-between items-center flex-wrap gap-2">
                <div className="flex items-center gap-2 order-2 md:order-1">
                    <button onClick={() => setCurrentDate(new Date())} className="px-2 py-1 md:px-3 text-xs md:text-sm border border-border rounded-md hover:bg-secondary-focus">{t('common.today')}</button>
                    <button onClick={goToPreviousMonth} className="p-1 rounded-full hover:bg-secondary-focus" aria-label={t('common.previous')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </button>
                     <button onClick={goToNextMonth} className="p-1 rounded-full hover:bg-secondary-focus" aria-label={t('common.next')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                    </button>
                </div>
                <h2 className="text-lg md:text-xl font-semibold text-text-primary order-1 md:order-2 w-full md:w-auto text-center md:text-left">
                    {currentDate.toLocaleString(i18n.language, { month: 'long', year: 'numeric' })}
                </h2>
                <div className="hidden md:block order-3"></div>
            </header>
            <div className="grid grid-cols-7 flex-shrink-0">
                {weekdays.map(day => (
                    <div key={day} className="text-center p-1 md:p-2 text-[10px] md:text-xs font-semibold uppercase text-text-secondary border-b border-r border-border truncate">{day}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 grid-rows-6 flex-grow overflow-y-auto">
                {daysInMonth.map((day, index) => {
                    if (!day) return <div key={`empty-${index}`} className="border-r border-b border-border bg-secondary/10"></div>;
                    
                    const dateKey = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
                    const dayTasks = tasksByDate.get(dateKey) || [];
                    const isToday = isSameDay(day, today);
                    const MAX_TASKS_VISIBLE = 2; // Keep low for mobile

                    return (
                        <div key={index} className="border-r border-b border-border p-1 md:p-2 flex flex-col group relative min-h-[80px]">
                            <div className="flex justify-between items-center">
                                <span className={`text-xs md:text-sm font-semibold ${isToday ? 'bg-primary text-white rounded-full h-5 w-5 md:h-6 md:w-6 flex items-center justify-center' : ''}`}>{day.getDate()}</span>
                                {canCreateTasks &&
                                    <button onClick={() => onAddTaskForDate(day)} title={t('tooltips.addTaskForDate', { date: day.toLocaleDateString()})} className="opacity-100 md:opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-secondary-focus transition-opacity">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                    </button>
                                }
                            </div>
                            <div className="mt-1 md:mt-2 space-y-1 overflow-hidden">
                                {dayTasks.slice(0, MAX_TASKS_VISIBLE).map(task => (
                                    <button key={task.id} onClick={() => onSelectTask(task)} className="w-full text-left p-0.5 md:p-1 rounded bg-secondary hover:bg-secondary-focus text-[10px] md:text-xs flex items-center gap-1 truncate">
                                        <div className={`w-1.5 h-1.5 rounded-full ${PRIORITY_COLORS[task.priority]}`}></div>
                                        <span className="truncate">{task.title}</span>
                                    </button>
                                ))}
                                {dayTasks.length > MAX_TASKS_VISIBLE && (
                                    <button onClick={() => setModalData({day, tasks: dayTasks})} className="w-full text-left text-[10px] md:text-xs text-primary hover:underline pl-1">
                                        {t('common.more', { count: dayTasks.length - MAX_TASKS_VISIBLE })}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
             {modalData && (
                <DayTasksModal
                    day={modalData.day}
                    tasks={modalData.tasks}
                    onClose={() => setModalData(null)}
                    onSelectTask={onSelectTask}
                />
            )}
        </div>
    );
};