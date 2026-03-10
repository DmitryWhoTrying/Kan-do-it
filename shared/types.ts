export interface Task {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  tag?: string;
  order?: number;
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