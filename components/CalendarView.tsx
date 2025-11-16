import React, { useState, useMemo, useRef } from 'react';
import { Task, Priority, User, Role } from '../types';

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
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
            <div className="bg-surface rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col animate-scaleIn" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-border flex justify-between items-center">
                    <h3 className="font-semibold text-text-primary">{day.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-secondary-focus" aria-label="Close">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </header>
                <div className="p-4 overflow-y-auto space-y-2">
                    {tasks.map(task => (
                        <div
                            key={task.id}
                            onClick={() => { onSelectTask(task); onClose(); }}
                            className={`p-2 text-sm rounded text-white font-semibold cursor-pointer hover:opacity-80 ${PRIORITY_COLORS[task.priority]}`}
                            title={task.title}
                        >
                            {task.title}
                        </div>
                    ))}
                </div>
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

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onSelectTask, onUpdateTask, onAddTaskForDate, currentUser }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [dragOverDate, setDragOverDate] = useState<string | null>(null);
    const [dayModal, setDayModal] = useState<{date: Date, tasks: Task[]} | null>(null);
    
    const canEdit = currentUser.role !== Role.Guest;
    const MAX_TASKS_SHOWN = 2;

    const calendarGrid = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const grid: { date: Date, isCurrentMonth: boolean }[] = [];

        const firstDayOfMonth = new Date(year, month, 1);
        const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

        const startDate = new Date(firstDayOfMonth);
        startDate.setDate(startDate.getDate() - startDayOfWeek);

        for (let i = 0; i < 42; i++) { // Always render 6 weeks for a consistent layout
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            grid.push({
                date,
                isCurrentMonth: date.getMonth() === month,
            });
        }

        return grid;
    }, [currentDate]);

    const tasksByDate = useMemo(() => {
        const map = new Map<string, Task[]>();
        tasks.forEach(task => {
            const dateKey = new Date(task.dueDate).toDateString();
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey)!.push(task);
        });
        return map;
    }, [tasks]);

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + offset);
            return newDate;
        });
    };

    const handleDragStart = (e: React.DragEvent, task: Task) => {
        if (!canEdit) return;
        e.dataTransfer.setData('taskId', task.id);
        setDraggedTaskId(task.id);
    };

    const handleDragOver = (e: React.DragEvent, day: Date | null) => {
        if (day && canEdit) {
            e.preventDefault();
            setDragOverDate(day.toDateString());
        }
    };

    const handleDragLeave = () => setDragOverDate(null);

    const handleDrop = (e: React.DragEvent, day: Date | null) => {
        if (!day || !canEdit) return;
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        const taskToMove = tasks.find(t => t.id === taskId);
        if (taskToMove && new Date(taskToMove.dueDate).toDateString() !== day.toDateString()) {
            onUpdateTask({ ...taskToMove, dueDate: day.toISOString().split('T')[0] });
        }
        setDraggedTaskId(null);
        setDragOverDate(null);
    };
    
    const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const today = new Date().toDateString();

    return (
        <div className="bg-surface rounded-lg h-full flex flex-col p-4">
            <header className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-secondary-focus" aria-label="Previous month">&lt;</button>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-secondary-focus" aria-label="Next month">&gt;</button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-sm font-medium bg-secondary rounded-lg hover:bg-secondary-focus transition-colors">Hoy</button>
                </div>
                <h2 className="text-xl font-bold text-center">
                    {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="w-28"></div> {/* Spacer to balance header */}
            </header>
            
            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-text-secondary text-sm">
                {WEEKDAYS.map(day => <div key={day} className="py-2">{day}</div>)}
            </div>

            <div className="grid grid-cols-7 grid-rows-6 gap-1 flex-grow">
                {calendarGrid.map(({ date, isCurrentMonth }, index) => {
                    const dayTasks = tasksByDate.get(date.toDateString()) || [];
                    const isToday = date.toDateString() === today;
                    const isDragOver = date.toDateString() === dragOverDate;
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    
                    return (
                        <div 
                            key={index} 
                            className={`group relative border border-border flex flex-col min-h-[120px] transition-colors
                                ${isDragOver ? 'bg-primary/20 border-primary/50' : isWeekend ? 'bg-secondary/50' : 'bg-secondary'}
                                ${isCurrentMonth ? '' : 'text-text-secondary/50'} rounded-md p-1 sm:p-2`}
                            onDragOver={(e) => handleDragOver(e, date)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, date)}
                        >
                            <div className="flex justify-between items-start">
                                <span className={`text-sm font-semibold ${isToday ? 'bg-primary text-white rounded-full flex items-center justify-center w-6 h-6' : 'p-1'}`}>{date.getDate()}</span>
                                {canEdit && isCurrentMonth && (
                                    <button
                                        onClick={() => onAddTaskForDate(date)}
                                        className="w-6 h-6 flex items-center justify-center rounded-full text-text-secondary bg-surface opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-white transition-all z-10"
                                        title={`Añadir tarea para ${date.toLocaleDateString()}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                    </button>
                                )}
                            </div>
                            <div className="space-y-1 overflow-y-auto flex-grow mt-1">
                                {dayTasks.slice(0, MAX_TASKS_SHOWN).map(task => (
                                    <div
                                        key={task.id}
                                        onClick={() => onSelectTask(task)}
                                        draggable={canEdit}
                                        onDragStart={(e) => handleDragStart(e, task)}
                                        className={`p-1.5 text-xs rounded truncate text-white font-semibold ${PRIORITY_COLORS[task.priority]} transition-opacity ${canEdit ? 'cursor-grab' : 'cursor-pointer'} ${draggedTaskId === task.id ? 'opacity-50' : 'hover:opacity-80'}`}
                                        title={task.title}
                                    >
                                        {task.title}
                                    </div>
                                ))}
                                {dayTasks.length > MAX_TASKS_SHOWN && (
                                    <button 
                                        onClick={() => setDayModal({ date, tasks: dayTasks })}
                                        className="text-xs font-semibold text-primary hover:underline text-left mt-1 px-1.5"
                                    >
                                        + {dayTasks.length - MAX_TASKS_SHOWN} más
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
            {dayModal && (
                <DayTasksModal
                    day={dayModal.date}
                    tasks={dayModal.tasks}
                    onClose={() => setDayModal(null)}
                    onSelectTask={onSelectTask}
                />
            )}
        </div>
    );
};

export default CalendarView;