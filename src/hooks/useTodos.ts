import { useTodo } from "@/context/TodoContext";
import { Priority, Task, Project } from "@/types/task"; // Import from your existing types
import { useCallback } from "react";

export function useTasks() {
	const {
		filteredTodos,
		projects,
		labels,
		activeProject,
		setActiveProject,
		addTodo,
		toggleTodo,
		toggleFavorite,
		toggleArchive,
		moveToTrash,
		deleteTodo,
		updateTodo,
		todoCount,
	} = useTodo();

	const addTask = useCallback(
		async (data: {
			title: string;
			description?: string;
			priority?: Priority;
			dueDate?: Date;
			tags?: string[];
			projectId?: string;
		}) => {
			await addTodo({
				taskName: data.title,
				description: data.description,
				projectId: data.projectId,
				dueDate: data.dueDate?.getTime() || Date.now(),
				priority: data.priority,
				tags: data.tags,
			});
		},
		[addTodo],
	);

	const updateTaskPriority = useCallback(
		async (id: string, priority: Priority) => {
			await updateTodo(id, { priority: mapPriorityToNumber(priority) });
		},
		[updateTodo],
	);

	const mapPriorityToNumber = (p: Priority): number => {
		if (p === "high") return 3;
		if (p === "medium") return 2;
		if (p === "low") return 1;
		return 0;
	};

	// Transform Todo[] to Task[]
	const transformTodosToTasks = (todos: any[]): Task[] => {
		return todos.map(todo => ({
			id: todo.id,
			title: todo.title,
			description: todo.description,
			completed: todo.completed,
			priority: todo.priority,
			projectId: todo.projectId || "",
			labelId: todo.labelId,
			isFavorite: todo.isFavorite,
			tags: todo.tags,
			createdAt: todo.createdAt || new Date(),
			dueDate: todo.dueDate,
			archivedAt: todo.isArchived ? new Date() : undefined,
			deletedAt: todo.deletedAt,
		}));
	};

	return {
		tasks: transformTodosToTasks(filteredTodos),
		projects: projects as Project[], // Cast to your Project type
		labels,
		activeProject,
		setActiveProject,
		addTask,
		toggleTask: toggleTodo,
		toggleFavorite,
		toggleArchive,
		moveToTrash,
		deleteTask: deleteTodo,
		updateTaskPriority,
		taskCount: {
			total: todoCount.total,
			completed: todoCount.completed,
		},
	};
}