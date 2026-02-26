export interface Task {
  id: string;
  title: string;
  description: string;
  priority?: 'high' | 'medium' | 'low';
  startDate?: string;
  endDate?: string;
  tag?: string;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
  order?: number;
}