import React from 'react';
import { Task as TaskType } from '../types';

interface TaskProps {
  task: TaskType;
  columnId: string;
  onDragStart: (e: React.DragEvent, taskId: string, columnId: string) => void;
}

const Task: React.FC<TaskProps> = ({ task, columnId, onDragStart }) => {
  const getTagClass = (tag?: string) => {
    if (tag === 'Без срока') return 'no-deadline';
    if (tag === 'Приоритетная задача') return 'high-priority';
    return '';
  };

  return (
    <div 
      className="task"
      draggable
      onDragStart={(e) => onDragStart(e, task.id, columnId)}
    >
      {task.tag && (
        <h3 className={`task-tag ${getTagClass(task.tag)}`}>
          {task.tag}
        </h3>
      )}
      <div className="task-content">
        <h3 className="task-name">{task.title}</h3>
        <p>{task.description}</p>
        <div className="task-time-div">
          {task.startDate && (
            <time className="task-start-date" dateTime={task.startDate}>
              от {new Date(task.startDate).toLocaleDateString('ru-RU')}
            </time>
          )}
          {task.endDate && (
            <time className="task-end-date" dateTime={task.endDate}>
              до {new Date(task.endDate).toLocaleDateString('ru-RU')}
            </time>
          )}
        </div>
      </div>
    </div>
  );
};

export default Task;