import React, { useMemo } from 'react';
import { Task, Priority } from '../../types';

interface TasksByPriorityChartProps {
  tasks: Task[];
  onPrioritySelect: (priority: Priority | null) => void;
  selectedPriority: Priority | null;
}

const TasksByPriorityChart: React.FC<TasksByPriorityChartProps> = ({ tasks, onPrioritySelect, selectedPriority }) => {
  
  const PRIORITY_CONFIG = useMemo(() => ({
    [Priority.Low]: { label: 'Baja', color: 'bg-priority-low' },
    [Priority.Medium]: { label: 'Media', color: 'bg-priority-medium' },
    [Priority.High]: { label: 'Alta', color: 'bg-priority-high' },
  }), []);

  const data = useMemo(() => {
    const counts = {
      [Priority.Low]: 0,
      [Priority.Medium]: 0,
      [Priority.High]: 0,
    };
    tasks.forEach(task => {
      counts[task.priority]++;
    });
    return Object.values(Priority).map(priority => ({
      priority,
      count: counts[priority],
      ...PRIORITY_CONFIG[priority],
    }));
  }, [tasks, PRIORITY_CONFIG]);
  
  const maxCount = Math.max(...data.map(d => d.count), 1); // Avoid division by zero, use 1 as minimum

  return (
    <div className="w-full flex-grow flex flex-col justify-around">
      {data.map(item => {
        const percentage = (item.count / maxCount) * 100;
        
        return (
          <div 
            key={item.priority}
            onClick={() => onPrioritySelect(selectedPriority === item.priority ? null : item.priority)}
            className="cursor-pointer transition-opacity"
            style={{ opacity: selectedPriority === null || selectedPriority === item.priority ? 1 : 0.5 }}
          >
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="font-semibold text-text-primary">{item.label}</span>
              <span className="text-text-secondary font-medium">{item.count} Tareas</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-4">
              <div 
                className={`${item.color} h-4 rounded-full transition-all duration-500 ease-out`} 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TasksByPriorityChart;