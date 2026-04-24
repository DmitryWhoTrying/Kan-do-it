export interface Task {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  tag?: string;
  order?: number;
  images?: TaskImage[];
}

export interface Column {
  id: number;
  title: string;
  tasks: Task[];
  order?: number;
}

export interface User{
  id: number;
  name: string;
}

export interface Board{
  id: number;
  name: string
  users: BoardUser[];
  columns: Column[];
}

export interface BoardUser{
  boardId: number;
  userId: number;
  userName?: string;
  permission: 'edit' | 'drag-n-drop' | 'view-only' | 'owner';
}

export enum Permission{
  'edit', 'drag-n-drop', 'view-only', 'owner'
}

export interface TaskImage {
  id: number;
  taskId: number;
  filename: string;        // Оригинальное имя
  storedName: string;      // Уникальное имя на сервере
  mimetype: string;        // image/png
  size: number;            // Размер в байтах
  width: number;
  height: number;
  url: string;             // Публичный URL
  thumbnailUrl?: string;   // URL превью
  order: number;
  createdAt: string;
  updatedAt: string;
}