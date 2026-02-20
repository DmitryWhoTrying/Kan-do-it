import React from 'react';
import Task from './Task';
import { Column as ColumnType } from '../types';

interface ColumnProps {
  column: ColumnType;
  onDragStart: (e: React.DragEvent, taskId: string, columnId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, columnId: string) => void;
}

const Column: React.FC<ColumnProps> = ({ column, onDragStart, onDragOver, onDrop }) => {
  return (
    <div 
      className="column"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, column.id)}
    >
      <h2 className="column-name">{column.title}</h2>
      {column.tasks.map(task => (
        <Task
          key={task.id}
          task={task}
          columnId={column.id}
          onDragStart={onDragStart}
        />
      ))}
    </div>
  );
};

export default Column;