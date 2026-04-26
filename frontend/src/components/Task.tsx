import React, { useEffect, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { TaskImage, Task as TaskType } from '../../../shared/types';
import { ItemTypes } from '../types/dnd-types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { TaskImageUpload } from './TaskImageUpload/TaskImageUpload';

//import { setTask } from '../store/boardSlice';

interface TaskProps {
  task: TaskType;
  columnId: number;
  boardId: number;
  onUpdateTask: (columnId: number, updatedTask: TaskType) => void;
  onDeleteTask?: (columnId: number, taskId: number) => void;
  onDeleteImage?: (taskId: number, imageId: number) => void;
  onAddImage?: (taskId: number, formData: FormData) => void;
}

const Task: React.FC<TaskProps> = ({ 
  task, 
  columnId, 
  boardId, 
  onUpdateTask,
  onDeleteTask,
  onDeleteImage,
  onAddImage,
}) => {
  const dispatch = useAppDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>();

  const currentUser = useAppSelector(state => state.board.currentUser);
  const [editTitle, setEditTitle] = useState(task.title);
  const [isEditing, setIsEditing] = useState(false);

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

  const getTagClass = (tag?: string) => {
    if (tag === 'Без срока') return 'no-deadline';
    if (tag === 'Приоритетная задача') return 'high-priority';
    return '';
  };

  const handleTaskUpdate = (updates: Partial<TaskType>) => {
    const updatedTask = { ...task, ...updates };
    onUpdateTask(columnId, updatedTask);
  };

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    await onAddImage?.(task.id, formData);
  };

  const handleImageDelete = async (imageId: number) => {
    if (window.confirm('Удалить это изображение?')) {
      await onDeleteImage?.(task.id, imageId);
    }
  };


  return (
    <div
      ref={ref}
      className={`task ${currentUser?.permission === 'view-only' ? 'task--read-only' : ''} ${isOverdue ? 'task--overdue' : ''}`}

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
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
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
        {/* Метаданные задачи */}
      <div className="task-meta">
        {/* Дата окончания */}
        {task.endDate && (
          <span className={`task-due-date ${isOverdue ? 'task-due-date--overdue' : ''}`}>
            📅 Дедлайн: {formatDate(task.endDate)}
          </span>
        )}

        {/* Тег */}
        {task.tag && (
          <span className="task-tag">{task.tag}</span>
        )}
        </div>
      </div>
      {/*// После мета-информации задачи:*/}
      <h4 style={{margin:'0px'}}>Прикрепленные файлы</h4>
        {(task.images?.length || 0) > 0 && (
          <div className="task-images">
            {task.images?.map((img, idx) => (
              <div key={img.id} className="task-image-item">
                <img 
                  src={img.thumbnailUrl || img.url} 
                  alt={img.filename}
                  className="task-image-thumb"
                  onClick={() => window.open(img.url, '_blank')} // Открыть в полном размере
                />
                {/* Кнопка удаления (только для владельца/редактора) */}
                {currentUser?.permission === 'owner' || currentUser?.permission === 'edit' ? (
                  <button 
                    className="btn-delete-image"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageDelete(img.id);
                    }}
                  >
                    ✕
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        )}

        {/* Кнопка добавления изображения */}
        {(currentUser?.permission === 'owner' || currentUser?.permission === 'edit') && (
          <TaskImageUpload
            taskId={task.id}
            boardId={boardId}
            onImageAdded={(newImage) => {
              // Обновляем локальный стейт задачи
              onUpdateTask(columnId, {
                ...task,
                images: [...(task.images || []), newImage],
              });
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Task;