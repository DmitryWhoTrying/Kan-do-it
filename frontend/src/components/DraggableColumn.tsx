import React, { useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Column as ColumnType, Task as TaskType } from '../../../shared/types';
import Task from './Task';
import { ItemTypes } from '../types/dnd-types';
import {  updateColumn  } from '../store/boardSlice';
import { useAppDispatch } from '../store/hooks';


interface DraggableColumnProps {
  column: ColumnType;
  index: number;
  boardId: number;
  onMoveTask: (taskId: number, sourceColumnId: number, targetColumnId: number) => void;
  onMoveColumn: (dragIndex: number, hoverIndex: number) => void;
  onUpdateTask: (columnId: number, updatedTask: TaskType) => void;
}

interface DragItem {
  index: number;
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
  onUpdateTask
}) => {
  const columnRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();

  // Настройка drag для колонки
  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.COLUMN,
    item: { 
      index, 
      id: column.id,
      type: ItemTypes.COLUMN 
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });


  // Настройка drop для колонки (принимает и задачи, и колонки)
  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>({
    accept: [ItemTypes.COLUMN, ItemTypes.TASK],
    drop: (item) => 
      {
      // Если это задача - перемещаем её в эту колонку
      if (item.type === ItemTypes.TASK) {
        console.log('Task dropped on column:', item);
        if (item.columnId !== column.id) {
          onMoveTask(item.id, item.columnId!, column.id);
        }
      }
    },
    hover: (item, monitor) => {
      if (!columnRef.current) return;

      // Обработка перетаскивания колонки
      if (item.type === ItemTypes.COLUMN) {
        const dragIndex = item.index;
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
        item.index = hoverIndex;
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

  // Объединяем ref для drag и drop
  drag(drop(columnRef));

  return (
    <div
      ref={columnRef}
      className={`column ${isDragging ? 'column-dragging' : ''} ${isOver ? 'drag-over' : ''}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="column-header">
        <h2 
          className="column-name"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleTitleChange(e.currentTarget.textContent || column.title)}
        >
          {column.title}
        </h2>
        <span className="drag-handle">⋮⋮</span>
      </div>
      
      <div className="column-tasks">
        {column.tasks.map(task => (
          <Task
              key={task.id}
              task={task}
              columnId={column.id}
              boardId={boardId}
              onUpdateTask={onUpdateTask}
            />
        ))}
      </div>
    </div>
  );
};

export default DraggableColumn;