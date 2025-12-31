import { Project, Priority, Task } from '@/types/task';
import { useState, useCallback } from 'react';

const defaultProjects: Project[] = [
  { id: 'inbox', name: 'Inbox', color: 'hsl(210, 70%, 55%)', icon: 'Inbox' },
  { id: 'today', name: 'Today', color: 'hsl(140, 60%, 45%)', icon: 'Calendar' },
  { id: 'work', name: 'Work', color: 'hsl(1, 70%, 55%)', icon: 'Briefcase' },
  { id: 'personal', name: 'Personal', color: 'hsl(270, 60%, 55%)', icon: 'User' },
];

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Review project proposal',
    completed: false,
    priority: 'high',
    projectId: 'work',
    createdAt: new Date(),
  },
  {
    id: '2',
    title: 'Buy groceries',
    completed: false,
    priority: 'medium',
    projectId: 'personal',
    createdAt: new Date(),
  },
  {
    id: '3',
    title: 'Schedule team meeting',
    completed: false,
    priority: 'low',
    projectId: 'work',
    createdAt: new Date(),
  },
  {
    id: '4',
    title: 'Read new book chapter',
    completed: true,
    priority: 'none',
    projectId: 'personal',
    createdAt: new Date(),
  },
];

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [projects] = useState<Project[]>(defaultProjects);
  const [activeProject, setActiveProject] = useState<string>('inbox');

  const addTask = useCallback((title: string, priority: Priority = 'none') => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      priority,
      projectId: activeProject === 'today' ? 'inbox' : activeProject,
      createdAt: new Date(),
    };
    setTasks((prev) => [newTask, ...prev]);
  }, [activeProject]);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const updateTaskPriority = useCallback((id: string, priority: Priority) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, priority } : task
      )
    );
  }, []);

  const filteredTasks = tasks.filter((task) => {
    if (activeProject === 'inbox') return true;
    if (activeProject === 'today') {
      const today = new Date();
      return task.createdAt.toDateString() === today.toDateString();
    }
    return task.projectId === activeProject;
  });

  const incompleteTasks = filteredTasks.filter((t) => !t.completed);
  const completedTasks = filteredTasks.filter((t) => t.completed);

  return {
    tasks: [...incompleteTasks, ...completedTasks],
    projects,
    activeProject,
    setActiveProject,
    addTask,
    toggleTask,
    deleteTask,
    updateTaskPriority,
    taskCount: {
      total: filteredTasks.length,
      completed: completedTasks.length,
    },
  };
}
