import { AnimatePresence } from 'framer-motion';
import { Task, Priority } from '@/types/task';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdatePriority: (id: string, priority: Priority) => void;
}

export function TaskList({ tasks, onToggle, onDelete, onUpdatePriority }: TaskListProps) {
  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="space-y-1">
      <AnimatePresence mode="popLayout">
        {incompleteTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={() => onToggle(task.id)}
            onDelete={() => onDelete(task.id)}
            onUpdatePriority={(priority) => onUpdatePriority(task.id, priority)}
          />
        ))}
      </AnimatePresence>

      {completedTasks.length > 0 && (
        <div className="pt-4">
          <p className="text-xs font-medium text-muted-foreground mb-2 px-3">
            Completed ({completedTasks.length})
          </p>
          <AnimatePresence mode="popLayout">
            {completedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={() => onToggle(task.id)}
                onDelete={() => onDelete(task.id)}
                onUpdatePriority={(priority) => onUpdatePriority(task.id, priority)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {tasks.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No tasks yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Add a task to get started
          </p>
        </div>
      )}
    </div>
  );
}
