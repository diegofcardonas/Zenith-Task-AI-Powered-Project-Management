import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { Task, User, Priority, Status } from '../types';
import AvatarWithStatus from './AvatarWithStatus';

const PRIORITY_COLORS: { [key in Priority]: { bg: string; border: string } } = {
    [Priority.High]: { bg: 'bg-priority-high/70', border: 'border-priority-high' },
    [Priority.Medium]: { bg: 'bg-priority-medium/70', border: 'border-priority-medium' },
    [Priority.Low]: { bg: 'bg-priority-low/70', border: 'border-priority-low' },
};

const getDaysDiff = (date1Str: string, date2Str: string) => {
    const d1 = new Date(date1Str);
    const d2 = new Date(date2Str);
    d1.setUTCHours(0, 0, 0, 0);
    d2.setUTCHours(0, 0, 0, 0);
    const diffTime = d2.getTime() - d1.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const Tooltip: React.FC<{ task: Task; user: User | undefined; left: number; top: number; }> = ({ task, user, left, top }) => {
    return (
        <div 
            className="absolute z-30 p-3 bg-secondary rounded-lg shadow-lg border border-border text-sm w-64 animate-fadeIn"
            style={{ left: `${left}px`, top: `${top}px`, transform: 'translateY(-100%)' }}
        >
            <p className="font-bold text-text-primary">{task.title}</p>
            <p className="text-text-secondary">{new Date(task.createdAt).toLocaleDateString()} - {new Date(task.dueDate).toLocaleDateString()}</p>
            {user && <p className="text-text-secondary">Asignado: {user.name}</p>}
            <p className="text-text-secondary">Estado: {task.status}</p>
        </div>
    );
};

const TimelineHeader: React.FC<{ dateRange: Date[]; dayWidth: number }> = React.memo(({ dateRange, dayWidth }) => {
    const months = useMemo(() => {
        const monthMap: { [key: string]: { name: string; colSpan: number } } = {};
        dateRange.forEach(day => {
            const monthKey = `${day.getFullYear()}-${day.getMonth()}`;
            if (!monthMap[monthKey]) {
                monthMap[monthKey] = {
                    name: day.toLocaleString('es-ES', { month: 'long', year: 'numeric' }),
                    colSpan: 0
                };
            }
            monthMap[monthKey].colSpan++;
        });
        return Object.values(monthMap);
    }, [dateRange]);

    return (
        // Set fixed height and flex layout to vertically center content across the two rows
        <div className="sticky top-0 bg-surface z-20 h-[68px] flex flex-col">
            {/* Months Row */}
            <div className="grid flex-1" style={{ gridTemplateColumns: `repeat(${dateRange.length}, ${dayWidth}px)` }}>
                {months.map((month, index) => (
                    <div key={index} style={{ gridColumn: `span ${month.colSpan}` }} className="flex items-center justify-center text-center font-semibold text-text-primary py-1 border-b border-r border-border">
                        {month.name}
                    </div>
                ))}
            </div>
            {/* Days Row */}
            <div className="grid flex-1" style={{ gridTemplateColumns: `repeat(${dateRange.length}, ${dayWidth}px)` }}>
                {dateRange.map((day, index) => (
                    <div key={index} className="flex items-center justify-center text-center text-xs text-text-secondary py-1 border-b border-r border-border">
                        {day.getDate()}
                    </div>
                ))}
            </div>
        </div>
    );
});


interface GanttViewProps {
    tasks: Task[];
    allTasks: Task[];
    onSelectTask: (task: Task) => void;
    users: User[];
}

const GanttView: React.FC<GanttViewProps> = ({ tasks, allTasks, onSelectTask, users }) => {
    const [tooltip, setTooltip] = useState<{ task: Task; user: User | undefined; x: number; y: number } | null>(null);
    const [sidebarWidth, setSidebarWidth] = useState(300);
    const isResizing = useRef(false);
    
    const timelineRef = useRef<HTMLDivElement>(null);
    const taskListRef = useRef<HTMLDivElement>(null);
    const syncTimeout = useRef<number | null>(null);

    const sortedTasks = useMemo(() => {
        return [...tasks]
            .filter(t => t.createdAt && t.dueDate)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }, [tasks]);

    const { dateRange, startDate, totalDays } = useMemo(() => {
        if (sortedTasks.length === 0) {
            const today = new Date();
            const start = new Date(today);
            start.setDate(today.getDate() - 15);
            const end = new Date(today);
            end.setDate(today.getDate() + 15);
            const range = [];
            let current = new Date(start);
            while (current <= end) {
                range.push(new Date(current));
                current.setDate(current.getDate() + 1);
            }
            return { dateRange: range, startDate: start, totalDays: range.length };
        }
        
        const startDates = sortedTasks.map(t => new Date(t.createdAt).getTime());
        const endDates = sortedTasks.map(t => new Date(t.dueDate).getTime());
        const minDate = new Date(Math.min(...startDates));
        const maxDate = new Date(Math.max(...endDates));

        minDate.setDate(minDate.getDate() - 7);
        maxDate.setDate(maxDate.getDate() + 7);
        
        const range = [];
        let current = new Date(minDate);
        while (current <= maxDate) {
            range.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        const finalStartDate = new Date(minDate);
        finalStartDate.setUTCHours(0,0,0,0);
        return { dateRange: range, startDate: finalStartDate, totalDays: range.length };
    }, [sortedTasks]);

    const rowHeight = 50;

    const taskPositions = useMemo(() => {
        const positions: { [key: string]: { left: number; width: number; top: number; height: number; task: Task } } = {};
        
        sortedTasks.forEach((task, index) => {
            const leftDays = getDaysDiff(startDate.toISOString(), task.createdAt);
            let durationDays = getDaysDiff(task.createdAt, task.dueDate) + 1;
            if (durationDays < 1) durationDays = 1;

            positions[task.id] = {
                left: leftDays,
                width: durationDays,
                top: index * rowHeight,
                height: 30,
                task: task,
            };
        });

        return positions;
    }, [sortedTasks, startDate]);

    const dependencyLines = useMemo(() => {
        const lines = [];
        for (const task of sortedTasks) {
            if (task.dependsOn && task.dependsOn.length > 0) {
                const toPos = taskPositions[task.id];
                if (!toPos) continue;

                for (const depId of task.dependsOn) {
                    const fromTask = allTasks.find(t => t.id === depId);
                    if (!fromTask) continue;
                    
                    const fromPos = taskPositions[depId];
                    if (!fromPos) continue;

                    const fromX = (fromPos.left + fromPos.width) * 40;
                    const fromY = fromPos.top + fromPos.height / 2;
                    const toX = toPos.left * 40;
                    const toY = toPos.top + toPos.height / 2;

                    const path = `M ${fromX - 5} ${fromY} C ${fromX + 20} ${fromY}, ${toX - 25} ${toY}, ${toX - 5} ${toY}`;
                    lines.push({id: `${depId}-${task.id}`, path});
                }
            }
        }
        return lines;
    }, [sortedTasks, taskPositions, allTasks]);

    const handleMouseMove = (e: React.MouseEvent, task: Task, user: User | undefined) => {
        if (timelineRef.current) {
            const rect = timelineRef.current.getBoundingClientRect();
            setTooltip({ task, user, x: e.clientX - rect.left + timelineRef.current.scrollLeft, y: e.clientY - rect.top });
        }
    };
    
    const handleMouseLeave = () => {
        setTooltip(null);
    };

    const handleScroll = (source: 'list' | 'timeline') => {
        const listEl = taskListRef.current;
        const timelineEl = timelineRef.current;
        if (!listEl || !timelineEl) return;

        if (syncTimeout.current) {
            clearTimeout(syncTimeout.current);
        }

        if (source === 'list') {
            if (timelineEl.scrollTop !== listEl.scrollTop) {
                timelineEl.scrollTop = listEl.scrollTop;
            }
        } else {
            if (listEl.scrollTop !== timelineEl.scrollTop) {
                listEl.scrollTop = timelineEl.scrollTop;
            }
        }

        syncTimeout.current = window.setTimeout(() => {
            syncTimeout.current = null;
        }, 50);
    };
    
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isResizing.current = true;
        document.addEventListener('mousemove', handleMouseMoveDrag);
        document.addEventListener('mouseup', handleMouseUp, { once: true });
    }, []);

    const handleMouseMoveDrag = useCallback((e: MouseEvent) => {
        if (isResizing.current) {
            setSidebarWidth(prev => Math.max(200, Math.min(e.clientX, 600)));
        }
    }, []);

    const handleMouseUp = useCallback(() => {
        isResizing.current = false;
        document.removeEventListener('mousemove', handleMouseMoveDrag);
    }, []);

    const todayLinePosition = getDaysDiff(startDate.toISOString(), new Date().toISOString());

    if (sortedTasks.length === 0) {
        return <div className="flex items-center justify-center h-full bg-surface rounded-lg"><p className="text-text-secondary italic">No hay tareas con fechas para mostrar en el diagrama de Gantt.</p></div>;
    }

    const dayWidth = 40;
    const timelineWidth = totalDays * dayWidth;
    const ganttHeight = sortedTasks.length * rowHeight;

    return (
        <div className="bg-surface rounded-lg h-full flex flex-col overflow-hidden">
            {tooltip && <Tooltip task={tooltip.task} user={tooltip.user} left={tooltip.x + 15} top={tooltip.y} />}
            <div className="flex-grow grid h-full" style={{ gridTemplateColumns: `${sidebarWidth}px 2px 1fr` }}>
                {/* Task List */}
                <div className="border-r border-border flex flex-col" style={{ width: `${sidebarWidth}px` }}>
                    <div className="font-semibold text-text-primary p-2 h-[68px] flex items-center border-b border-border sticky top-0 bg-surface z-10">Nombre de la Tarea</div>
                    <div ref={taskListRef} className="overflow-y-scroll overflow-x-hidden" onScroll={() => handleScroll('list')}>
                        <div className="relative" style={{ height: `${ganttHeight}px` }}>
                             {Object.values(taskPositions).map(({ top, task }) => (
                                <div
                                    key={task.id}
                                    className="absolute w-full px-2 flex items-center border-b border-border/50 cursor-pointer hover:bg-secondary-focus overflow-hidden"
                                    style={{ top: `${top}px`, height: `${rowHeight}px` }}
                                    onClick={() => onSelectTask(task)}
                                    title={task.title}
                                >
                                    <span className="break-words leading-tight text-sm">{task.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* Resizer */}
                <div className="cursor-col-resize bg-border hover:bg-primary transition-colors w-0.5 h-full" onMouseDown={handleMouseDown}></div>
                {/* Timeline */}
                <div className="overflow-auto" ref={timelineRef} onScroll={() => handleScroll('timeline')}>
                     <div className="relative" style={{ width: `${timelineWidth}px` }}>
                        <TimelineHeader dateRange={dateRange} dayWidth={dayWidth} />
                        <div className="relative" style={{ height: `${ganttHeight}px` }}>
                            {/* Background grid */}
                            <div className="absolute top-0 left-0 w-full h-full pointer-events-none grid" style={{ gridTemplateColumns: `repeat(${totalDays}, ${dayWidth}px)` }}>
                                {dateRange.map((day, index) => {
                                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                                    return <div key={index} className={`border-r border-border/50 h-full ${isWeekend ? 'bg-secondary/50' : ''}`}></div>
                                })}
                            </div>
                            {Array.from({ length: sortedTasks.length }).map((_, i) => (
                                <div key={i} className="absolute w-full border-b border-border/50" style={{ top: `${(i + 1) * rowHeight - 1}px`, height: '1px' }}></div>
                            ))}
                             {/* Today marker */}
                            {todayLinePosition >= 0 && todayLinePosition < totalDays && (
                                <div className="absolute top-0 h-full w-0.5 bg-accent/70 z-10" style={{ left: `${todayLinePosition * dayWidth + dayWidth/2}px` }}>
                                    <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-accent rounded-full"></div>
                                </div>
                            )}

                            {/* Task bars */}
                             {Object.values(taskPositions).map(({ left, width, top, height, task }) => {
                                 const user = users.find(u => u.id === task.assigneeId);
                                 const progress = task.subtasks.length > 0 ? (task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100 : (task.status === Status.Done ? 100 : 0);
                                 return (
                                     <div 
                                         key={task.id} 
                                         className="absolute rounded group cursor-pointer flex items-center"
                                         style={{ 
                                             left: `${left * dayWidth}px`, 
                                             width: `${width * dayWidth}px`, 
                                             top: `${top + (rowHeight - height)/2}px`,
                                             height: `${height}px`,
                                         }}
                                         onClick={() => onSelectTask(task)}
                                         onMouseMove={(e) => handleMouseMove(e, task, user)}
                                         onMouseLeave={handleMouseLeave}
                                     >
                                         <div className={`h-full w-full rounded-sm flex items-center px-2 relative overflow-hidden border-2 ${PRIORITY_COLORS[task.priority].border} ${PRIORITY_COLORS[task.priority].bg}`}>
                                             <div className="absolute left-0 top-0 h-full bg-black/20" style={{ width: `${progress}%` }}></div>
                                             <div className="relative flex items-center gap-2 truncate w-full">
                                                {user && <AvatarWithStatus user={user} className="w-5 h-5 flex-shrink-0" />}
                                                <span className="text-white text-xs font-semibold truncate flex-grow">{task.title}</span>
                                             </div>
                                         </div>
                                     </div>
                                 );
                             })}
                             
                             {/* Dependency Lines */}
                             <svg width={timelineWidth} height={ganttHeight} className="absolute top-0 left-0 pointer-events-none">
                                <defs>
                                    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#a8a29e" />
                                    </marker>
                                </defs>
                                {dependencyLines.map(line => (
                                    <path key={line.id} d={line.path} stroke="#a8a29e" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
                                ))}
                             </svg>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default GanttView;