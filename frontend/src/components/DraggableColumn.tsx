import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Column as ColumnType, TaskImage, Task as TaskType } from '../../../shared/types';
import Task from './Task';
import { ItemTypes } from '../types/dnd-types';
import {  updateColumn  } from '../store/boardSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import DraggableTask from './DraggableTask';


interface DraggableColumnProps {
  column: ColumnType;
  index: number;
  boardId: number;
  onMoveTask: (taskId: number, sourceColumnId: number, targetColumnId: number, targetIndex: number) => void;
  onMoveColumn: (dragIndex: number, hoverIndex: number) => void;
  onUpdateTask: (columnId: number, updatedTask: TaskType) => void;
  onAddTask?: (columnId: number, task: Omit<TaskType, 'id'>) => void; // ✅ Новый проп
  onDeleteColumn?: (columnId: number) => void;
  onDeleteTask?: (columnId: number, taskId: number) => void;
  onAddTaskImage?: (taskId: number, formData: FormData) => void;
  onDeleteTaskImage?: (taskId: number, imageId: number) => void;
}

interface DragItem {
  idx: number;
  id: number;
  type: string;
  columnId?: number;
  taskId?: number;
}


const DraggableColumn: React.FC<DraggableColumnProps> = ({
  column,
  index,
  boardId,
  onMoveTask,
  onMoveColumn,
  onUpdateTask,
  onAddTask,
  onDeleteColumn,
  onDeleteTask,
  onAddTaskImage,
  onDeleteTaskImage
}) => {
  const columnRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();

  const currectUser = useAppSelector(state => state.board.currentUser);

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTaskEndDate, setNewTaskEndDate] = useState('');

  //виды разрешений
  const usrCanDrag = currectUser?.permission !== 'view-only';
  const usrCanEdit = usrCanDrag && currectUser?.permission !== 'drag-n-drop';
  const usrIsOwner = currectUser?.permission === 'owner';
  const usrViewOnly = currectUser?.permission === 'view-only';

  // Настройка drag для колонки
  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.COLUMN,
    item: { 
      idx: index, 
      id: column.id,
      type: ItemTypes.COLUMN 
    },
    canDrag: usrCanDrag,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });


  // Настройка drop для колонки (принимает и задачи, и колонки)
  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>({
    accept: [ItemTypes.COLUMN, ItemTypes.TASK],
    drop: (item, monitor) => {
      if (item.type === ItemTypes.TASK) {
        // Получаем координаты мыши относительно колонки
        const clientOffset = monitor.getClientOffset();
        if (!clientOffset) return;
        
        // Находим все задачи в колонке
        const taskElements = document.querySelectorAll(`.column[data-column-id="${column.id}"] .task`);
        
        let targetIndex = column.tasks.length; // По умолчанию в конец
        
        // Ищем, между какими задачами находится курсор
        for (let i = 0; i < taskElements.length; i++) {
          const rect = taskElements[i].getBoundingClientRect();
          const middleY = (rect.top + rect.bottom) / 2;
          
          if (clientOffset.y < middleY) {
            targetIndex = i;
            break;
          }
        }
        
        console.log('Task dropped on column at index:', targetIndex);
        onMoveTask(item.id!, item.columnId!, column.id, targetIndex);
      }
  },
    hover: (item, monitor) => {
      if (item.type !== ItemTypes.COLUMN) {
        return; // ❌ Задачи не должны запускать перемещение колонок
      }

      if (!columnRef.current) return;

      // Обработка перетаскивания колонки
      if (item.type === ItemTypes.COLUMN) {
        const dragIndex = item.idx;
        const hoverIndex = index;

        if (dragIndex === hoverIndex) return;

        const hoverBoundingRect = columnRef.current.getBoundingClientRect();
        const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
        
        const clientOffset = monitor.getClientOffset();
        if (!clientOffset) return;
        
        const hoverClientX = clientOffset.x - hoverBoundingRect.left;

        // Определяем направление перетаскивания
        if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) return;
        if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) return;

        // Перемещаем колонку
        onMoveColumn(dragIndex, hoverIndex);
        item.idx = hoverIndex;
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Скрываем стандартный призрак браузера
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  // Обновление заголовка колонки
  const handleTitleChange = (newTitle: string) => {
    dispatch(updateColumn({ 
      ...column, 
      title: newTitle 
    }));
  };

  const handleAddTask = useCallback(async () => {
    if (!newTaskTitle.trim() || !onAddTask) return;

    try {
      setIsCreating(true);
      
      // Определяем порядок (последняя задача + 1)
      const maxOrder = column.tasks.reduce(
        (max, task) => Math.max(max, task.order || 0),
        -1
      );

      // Создаём задачу
      onAddTask(column.id, {
        startDate: '12 20 2004',
        title: newTaskTitle.trim(),
        description: '',
        order: maxOrder + 1,
        endDate: newTaskEndDate || undefined,
        tag: '',
      });

      // Очищаем форму
      setNewTaskTitle('');
      setNewTaskEndDate('');
      setIsAddingTask(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsCreating(false);
    }
  }, [newTaskTitle, column.id, column.tasks, boardId, onAddTask, newTaskEndDate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddTask();
    } else if (e.key === 'Escape') {
      setNewTaskTitle('');
      setNewTaskEndDate('');
      setIsAddingTask(false);
    }
  };

  const opacity = isDragging ? 0.4 : 1;

  // Объединяем ref для drag и drop
  if (!(currectUser?.permission === 'view-only'))
    drag(drop(columnRef));

  return (
    <div
      ref={columnRef}
      className={`column ${usrViewOnly ? 'column--read-only' : ''}`}
      style={{ 
        opacity
      }}
    >
      {/* Заголовок колонки */}
      <div className="column-header">
        <h3 className="column-title">{column.title}</h3>
        <span className="task-count">{column.tasks.length}</span>
        
        {!(usrCanEdit) && onDeleteColumn && (
          <button 
            className="btn-delete-column"
            onClick={() => onDeleteColumn(column.id)}
            title="Удалить колонку"
          >
            ✕
          </button>
        )}
      </div>

      {/* Список задач */}
      <div className="column-tasks">
        {column.tasks
          .slice()
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((task, idx) => (
            <DraggableTask
              key={task.id}
              task={task}
              index={idx}
              columnId={column.id}
              boardId={boardId}
              onMoveTask={onMoveTask}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
              onDeleteImage={onDeleteTaskImage}
              onAddImage={onAddTaskImage}
            >
              <Task
                task={task}
                columnId={column.id}
                boardId={boardId}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
                onDeleteImage={onDeleteTaskImage}
                onAddImage={onAddTaskImage}
              />
            </DraggableTask>
          ))}

        {/* Форма добавления задачи */}
        {!(usrCanDrag) 
        ? (
          isAddingTask ? (
            <div className="add-task-form">
              <textarea
                placeholder="Название задачи"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="task-input"
                rows={2}
                disabled={isCreating}
                autoFocus
              />
              
              {/* Поле выбора даты дедлайна */}
              <div className="task-form-group">
                <label className="task-form-label">
                  📅 Крайний срок (необязательно)
                </label>
                <input
                  type="date"
                  value={newTaskEndDate}
                  onChange={(e) => setNewTaskEndDate(e.target.value)}
                  className="task-date-input"
                  disabled={isCreating}
                  min={new Date().toISOString().split('T')[0]} // Нельзя выбрать прошедшую дату
                />
              </div>

              <div className="add-task-actions">
                <button 
                  onClick={handleAddTask}
                  disabled={!newTaskTitle.trim() || isCreating}
                  className="btn-add-task"
                >
                  {isCreating ? 'Создание...' : 'Добавить'}
                </button>
                <button 
                  onClick={() => {
                    setNewTaskTitle('');
                    setNewTaskEndDate('');
                    setIsAddingTask(false);
                  }}
                  className="btn-cancel"
                  disabled={isCreating}
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsAddingTask(true)}
              className="btn-add-task-toggle"
            >
              + Добавить задачу
            </button>
          )
        ) : (
          <div className="read-only-hint">
            <small>Только просмотр</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default DraggableColumn;