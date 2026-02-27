import React, { useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Task as TaskType } from '../../../shared/types';
import { ItemTypes } from '../App';
import { useAppDispatch } from '../store/hooks';
import { setTask } from '../store/boardSlice';

interface TaskProps {
  task: TaskType;
  columnId: string;
  boardId: string;
  onUpdateTask: (columnId: string, updatedTask: TaskType) => void;
  onDeleteTask?: (columnId: string, taskId: string) => void;
}

const Task: React.FC<TaskProps> = ({ 
  task, 
  columnId, 
  boardId, 
  onUpdateTask,
  onDeleteTask 
}) => {
  const dispatch = useAppDispatch();

  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: ItemTypes.TASK,
    item: { 
      id: task.id, 
      columnId: columnId,
      type: ItemTypes.TASK,
      task: task 
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),

    // Добавляем логирование для отладки
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      console.log('Drag ended:', { item, dropResult });
    },

  }), [task.id, columnId]);

  // Скрываем стандартный призрак
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  const getTagClass = (tag?: string) => {
    if (tag === 'Без срока') return 'no-deadline';
    if (tag === 'Приоритетная задача') return 'high-priority';
    return '';
  };

  const handleTaskUpdate = (updates: Partial<TaskType>) => {
    const updatedTask = { ...task, ...updates };
    onUpdateTask(columnId, updatedTask);
  };

  return (
    <div 
      ref={drag}
      className={`task ${isDragging ? 'dragging' : ''}`}
      style={{ 
        opacity: isDragging ? 0.3 : 1,
        cursor: 'grab'
      }}
    >
      {task.tag && (
        <h3 className={`task-tag ${getTagClass(task.tag)}`}>
          {task.tag}
        </h3>
      )}
      <div className="task-content">
        <h3 
          className="task-name"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleTaskUpdate({ title: e.currentTarget.textContent || task.title })}
        >
          {task.title}
        </h3>
        <p 
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleTaskUpdate({ description: e.currentTarget.textContent || task.description })}
        >
          {task.description}
        </p>
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