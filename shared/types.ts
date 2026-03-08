export interface Task {
  id: number;
  title: string;
  description: string;
  priority?: 'high' | 'medium' | 'low';
  startDate?: string;
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
  permission: 'edit' | 'drag-n-drop' | 'view-only';
}

export interface Board{
  id: number;
  name: string
  owner: string;
  users: string[];
  columns: Column[];
}