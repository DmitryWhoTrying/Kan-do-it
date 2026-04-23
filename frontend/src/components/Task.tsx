import React, { useEffect, useRef, useState } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Task as TaskType } from '../../../shared/types';
import { ItemTypes } from '../types/dnd-types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
//import { setTask } from '../store/boardSlice';

interface TaskProps {
  task: TaskType;
  columnId: number;
  boardId: number;
  onUpdateTask: (columnId: number, updatedTask: TaskType) => void;
  onDeleteTask?: (columnId: number, taskId: number) => void;
}

const Task: React.FC<TaskProps> = ({ 
  task, 
  columnId, 
  boardId, 
  onUpdateTask,
  onDeleteTask 
}) => {
  const dispatch = useAppDispatch();
  const ref = useRef<HTMLDivElement>(null);

  const currentUser = useAppSelector(state => state.board.currentUser);
  const [editTitle, setEditTitle] = useState(task.title);
  const [isEditing, setIsEditing] = useState(false);

  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: ItemTypes.TASK,
    canDrag: currentUser?.permission !== 'view-only',
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

  // Форматирование даты
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const isOverdue = task.endDate ? new Date(task.endDate) < new Date() : false;

  const handleSave = () => {
    if (editTitle.trim()){
      onUpdateTask(columnId, {...task, title: editTitle.trim()});
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Вы точно хотите удалить эту задачу?')){
      onDeleteTask?.(columnId, task.id);
    }
  }

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

  const opacity = isDragging ? 0.4 : 1;

  drag(ref);

  return (
    <div
      ref={ref}
      className={`task ${currentUser?.permission === 'view-only' ? 'task--read-only' : ''} ${isOverdue ? 'task--overdue' : ''}`}
      //onDragStart={(e) => {e.stopPropagation()}}
      style={{ opacity }}
    >
      {/* Заголовок задачи */}
      <div className="task-content">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="task-edit-input"
            autoFocus
          />
        ) : (
          <h4 
            className="task-title"
            onClick={() => !(currentUser?.permission === 'view-only' || currentUser?.permission ==='drag-n-drop') && setIsEditing(true)}
            title={task.description || task.title}
          >
            {task.title}
          </h4>
        )}
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
        </div>
        {/* Кнопка удаления */}
        {!(currentUser?.permission === 'view-only' || currentUser?.permission ==='drag-n-drop') && onDeleteTask && (
          <button
            className="btn-delete-task"
            onClick={handleDelete}
            title="Удалить задачу"
            type="button"
          >
            ✕
          </button>
        )}
      </div>
        
      {/* Метаданные задачи */}
      <div className="task-meta">
        {/* Дата окончания */}
        {task.endDate && (
          <span className={`task-due-date ${isOverdue ? 'task-due-date--overdue' : ''}`}>
            📅 {formatDate(task.endDate)}
          </span>
        )}

        {/* Тег */}
        {task.tag && (
          <span className="task-tag">{task.tag}</span>
        )}
      </div>
    </div>
  );

  // return (
  //   <div 
  //     ref={drag}
  //     className={`task ${isDragging ? 'dragging' : ''}`}
  //     style={{ 
  //       opacity: isDragging ? 0.3 : 1,
  //       cursor: 'grab'
  //     }}
  //   >
  //     {task.tag && (
  //       <h3 className={`task-tag ${getTagClass(task.tag)}`}>
  //         {task.tag}
  //       </h3>
  //     )}
  //     {
  //       (currentUser?.permission === 'owner' || currentUser?.permission === 'edit')
  //     ?
  //       <div className="task-content">
  //       <h3 
  //         className="task-name"
  //         contentEditable
  //         suppressContentEditableWarning
  //         onBlur={(e) => handleTaskUpdate({ title: e.currentTarget.textContent || task.title })}
  //       >
  //         {task.title}
  //       </h3>
  //       <p 
  //         contentEditable
  //         suppressContentEditableWarning
  //         onBlur={(e) => handleTaskUpdate({ description: e.currentTarget.textContent || task.description })}
  //       >
  //         {task.description}
  //       </p>
  //       <div className="task-time-div">
  //         {task.startDate && (
  //           <time className="task-start-date" dateTime={task.startDate}>
  //             от {new Date(task.startDate).toLocaleDateString('ru-RU')}
  //           </time>
  //         )}
  //         {task.endDate && (
  //           <time className="task-end-date" dateTime={task.endDate}>
  //             до {new Date(task.endDate).toLocaleDateString('ru-RU')}
  //           </time>
  //         )}
  //       </div>
  //     </div>
  //     : 
  //       <div className="task-content">
  //       <h3 className="task-name">
  //         {task.title}
  //       </h3>
  //       <p >
  //         {task.description}
  //       </p>
  //       <div className="task-time-div">
  //         {task.startDate && (
  //           <time className="task-start-date" dateTime={task.startDate}>
  //             от {new Date(task.startDate).toLocaleDateString('ru-RU')}
  //           </time>
  //         )}
  //         {task.endDate && (
  //           <time className="task-end-date" dateTime={task.endDate}>
  //             до {new Date(task.endDate).toLocaleDateString('ru-RU')}
  //           </time>
  //         )}
  //       </div>
  //     </div>
  //     }      
  //   </div>
  // );
};

export default Task;