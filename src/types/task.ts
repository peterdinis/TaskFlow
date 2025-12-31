export type Priority = 'high' | 'medium' | 'low' | 'none';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  projectId: string;
  createdAt: Date;
  dueDate?: Date;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  icon: string;
}
