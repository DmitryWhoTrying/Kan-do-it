import React from 'react';
import { useDrop } from 'react-dnd';
import Task from './Task';
import { Column as ColumnType } from '../types';
import { ItemTypes } from '../App';

interface ColumnProps {
  column: ColumnType;
  index: number;
  onMoveTask: (taskId: string, sourceColumnId: string, targetColumnId: string) => void;
  onMoveColumn: (dragIndex: number, hoverIndex: number) => void;
}

const Column: React.FC<ColumnProps> = (props) => {
  const { column, onMoveTask } = props;

  // Настройка drop для колонки (только для задач)
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.TASK,
    drop: (item: { id: string; columnId: string }) => {
      if (item.columnId !== column.id) {
        onMoveTask(item.id, item.columnId, column.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [column.id, onMoveTask]);

  return (
    <div 
      ref={drop}
      className={`column ${isOver ? 'drag-over' : ''}`}
    >
      <div className="column-header">
        <h2 className="column-name">{column.title}</h2>
      </div>
      
      <div className="column-tasks">
        {column.tasks.map(task => (
          <Task
            key={task.id}
            task={task}
            columnId={column.id}
          />
        ))}
      </div>
    </div>
  );
};

export default Column;