// frontend/src/components/DraggableTask.tsx
import React, { useRef, useState, useCallback } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { ItemTypes } from '../types/dnd-types';
import { Task as TaskType } from '../../../shared/types';
import { useAppSelector } from '../store/hooks';

interface DraggableTaskProps {
  task: TaskType;
  index: number;
  columnId: number;
  boardId: number;
  onMoveTask: (taskId: number, sourceColumnId: number, targetColumnId: number, targetIndex: number) => void;
  onUpdateTask: (columnId: number, updatedTask: TaskType) => void;
  onDeleteTask?: (columnId: number, taskId: number) => void;
  onDeleteImage?: (taskId: number, imageId: number) => void;
  onAddImage?: (taskId: number, formData: FormData) => void;
  children: React.ReactNode;
}

const DraggableTask: React.FC<DraggableTaskProps> = ({
  task,
  index,
  columnId,
  onMoveTask,
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [dragIndex, setDragIndex] = useState<number>(index);
  const [dragColumnId, setDragColumnId] = useState<number>(columnId);

  const currentUser = useAppSelector(state => state.board.currentUser);

  const usrCanDrag = currentUser?.permission !== 'view-only';
  const usrCanEdit = usrCanDrag && currentUser?.permission !== 'drag-n-drop';
  const usrIsOwner = currentUser?.permission === 'owner';
  const usrViewOnly = currentUser?.permission === 'view-only';
  
  // Drag
  const [{ isDragging }, drag, preview] = useDrag({
    canDrag: usrCanDrag,
    type: ItemTypes.TASK,
    item: () => {
      // Сохраняем начальные позиции
      setDragIndex(index);
      setDragColumnId(columnId);
      return { 
        id: task.id, 
        columnId: columnId, 
        index: index,
        type: ItemTypes.TASK 
      };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      // Сбрасываем индикаторы после перетаскивания
      setDropTargetIndex(null);
    },
  });

  // Состояние для индикатора вставки
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  // Drop
  const [, drop] = useDrop({
    accept: ItemTypes.TASK,
    hover: (draggedItem: { id: number; columnId: number; index: number }, monitor) => {
        if (!ref.current) return;
        if (draggedItem.id === task.id) return;
        
        const hoverBoundingRect = ref.current.getBoundingClientRect();
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const clientOffset = monitor.getClientOffset();
        if (!clientOffset) return;
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;
        
        let newDropIndex = index;
        
        // Определяем позицию вставки
        if (hoverClientY < hoverMiddleY) {
            // Вставляем СВЕРХУ от текущей задачи
            newDropIndex = index;
        } else {
            // Вставляем СНИЗУ от текущей задачи
            newDropIndex = index + 1;
        }
        
        // Корректировка при перетаскивании внутри одной колонки
        if (draggedItem.columnId === columnId) {
            if (draggedItem.index < index && newDropIndex === index) {
            // Если перетаскиваем сверху вниз и вставляем сверху - не нужно
            return;
            }
            if (draggedItem.index > index && newDropIndex === index + 1) {
            // Если перетаскиваем снизу вверх и вставляем снизу - не нужно
            return;
            }
        }
        
        setDropTargetIndex(newDropIndex);
        },
    
    drop: (draggedItem: { id: number; columnId: number; index: number }) => {
      //вызываем реальное перемещение
      if (dropTargetIndex !== null && dropTargetIndex !== draggedItem.index) {
        console.log('Dropping task:', {
          taskId: draggedItem.id,
          fromColumn: draggedItem.columnId,
          toColumn: columnId,
          toIndex: dropTargetIndex
        });
        
        onMoveTask(
          draggedItem.id,
          draggedItem.columnId,
          columnId,
          dropTargetIndex
        );
      }
      
      // Сбрасываем индикатор
      setDropTargetIndex(null);
    },
  });

  // Скрываем стандартный призрак
  React.useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  // Объединяем drag и drop
  drag(drop(ref));

  const opacity = isDragging ? 0.4 : 1;
  
  // Визуальный индикатор позиции вставки
  const showDropIndicator = dropTargetIndex !== null && !isDragging;
  const isDropAbove = showDropIndicator && dropTargetIndex === index;
  const isDropBelow = showDropIndicator && dropTargetIndex === index + 1;

  return (
    <>
      {/* Индикатор вставки СВЕРХУ */}
      {isDropAbove && (
        <div className="drop-indicator drop-indicator--above" />
      )}
      
      <div ref={ref} style={{ opacity }}>
        {children}
      </div>
      
      {/* Индикатор вставки СНИЗУ */}
      {isDropBelow && (
        <div className="drop-indicator drop-indicator--below" />
      )}
    </>
  );
};

export default DraggableTask;