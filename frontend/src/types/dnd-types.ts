export const ItemTypes = {
  TASK: 'task',
  COLUMN: 'column',
} as const;

// Тип для Drag-объекта задачи
export interface TaskDragItem {
  type: typeof ItemTypes.TASK;
  taskId: number;
  sourceColumnId: number;
}

// Тип для Drag-объекта колонки
export interface ColumnDragItem {
  type: typeof ItemTypes.COLUMN;
  index: number;
  columnId: number;
}

// Объединённый тип
export type DragItem = TaskDragItem | ColumnDragItem;