import React, { useMemo } from 'react';
import { Task, Status } from '../../types';

interface TasksByStatusChartProps {
  tasks: Task[];
  onStatusSelect: (status: Status | null) => void;
  selectedStatus: Status | null;
}

const DonutSegment: React.FC<{ stroke: string; strokeWidth: number; radius: number; circumference: number; dasharray: number; dashoffset: number; }> = 
  ({ stroke, strokeWidth, radius, circumference, dasharray, dashoffset }) => (
    <circle
      stroke={stroke}
      fill="transparent"
      strokeWidth={strokeWidth}
      r={radius}
      cx="60"
      cy="60"
      style={{
        strokeDasharray: `${dasharray} ${circumference - dasharray}`,
        strokeDashoffset: -dashoffset,
        transition: 'stroke-dasharray 0.5s ease-out, stroke-dashoffset 0.5s ease-out',
      }}
    />
);

const TasksByStatusChart: React.FC<TasksByStatusChartProps> = ({ tasks, onStatusSelect, selectedStatus }) => {
  
  const STATUS_CONFIG = useMemo(() => ({
    [Status.Todo]: { label: 'Por Hacer', color: 'text-status-todo', hex: '#60a5fa' },
    [Status.InProgress]: { label: 'En Progreso', color: 'text-status-inprogress', hex: '#fbbf24' },
    [Status.Done]: { label: 'Hecho', color: 'text-status-done', hex: '#4ade80' },
  }), []);

  const data = useMemo(() => {
    const counts = {
      [Status.Todo]: 0,
      [Status.InProgress]: 0,
      [Status.Done]: 0,
    };
    tasks.forEach(task => {
      counts[task.status]++;
    });
    return Object.values(Status).map(status => ({
      status,
      count: counts[status],
      ...STATUS_CONFIG[status],
    }));
  }, [tasks, STATUS_CONFIG]);

  const total = tasks.length;
  const radius = 45;
  const strokeWidth = 15;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercentage = 0;

  return (
    <div className="flex-grow flex flex-col md:flex-row items-center justify-center gap-6">
      <div className="relative w-32 h-32 sm:w-40 sm:h-40">
        <svg viewBox="0 0 120 120" className="transform -rotate-90">
          <circle
            stroke="#374151" // border color
            fill="transparent"
            strokeWidth={strokeWidth}
            r={radius}
            cx="60"
            cy="60"
          />
          {data.map(({ status, count, hex }) => {
            const percentage = total > 0 ? (count / total) * 100 : 0;
            const dasharray = (circumference * percentage) / 100;
            const dashoffset = (circumference * accumulatedPercentage) / 100;
            accumulatedPercentage += percentage;
            return (
              <g 
                key={status} 
                onClick={() => onStatusSelect(selectedStatus === status ? null : status)}
                className="cursor-pointer transition-opacity"
                style={{ opacity: selectedStatus === null || selectedStatus === status ? 1 : 0.5 }}
              >
                <DonutSegment
                  stroke={hex}
                  strokeWidth={strokeWidth}
                  radius={radius}
                  circumference={circumference}
                  dasharray={dasharray}
                  dashoffset={dashoffset}
                />
              </g>
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-text-primary">{total}</span>
            <span className="text-sm text-text-secondary">Tareas</span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {data.map(({ status, label, count }) => (
          <div key={status} className="flex items-center text-sm">
            <span className={`w-3 h-3 rounded-full mr-2 ${STATUS_CONFIG[status].color.replace('text-', 'bg-')}`}></span>
            <span className="text-text-primary font-medium">{label}:</span>
            <span className="ml-auto text-text-secondary font-semibold">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksByStatusChart;