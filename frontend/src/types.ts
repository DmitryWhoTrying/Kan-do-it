export interface Task {
  id: string;
  title: string;
  description: string;
  priority?: 'high' | 'medium' | 'low';
  startDate?: string;
  endDate?: string;
  tag?: string;
  order?: number;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
  order?: number;
}

export interface User{
  id: string;
  name: string;
  permission: 'edit' | 'drag-n-drop' | 'view-only';
}

export interface Board{
  id: string;
  name: string
  owner: string;
  users: string[];
  columns: Column[];
}