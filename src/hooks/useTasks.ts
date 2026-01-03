import { useTodo } from "@/context/TodoContext";
import { Priority, Task, Project } from "@/types/task";
import { useCallback } from "react";

export function useTasks() {
	const {
		filteredTasks,
		projects,
		labels,
		activeProject,
		setActiveProject,
		addTodo,
		toggleTodo,
		deleteTodo,
		updateTodo,
		taskCount,
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
				priority: data.priority as any,
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

	return {
		tasks: filteredTasks as unknown as Task[],
		projects: projects as unknown as Project[],
		labels,
		activeProject,
		setActiveProject,
		addTask,
		toggleTask: toggleTodo,
		deleteTask: deleteTodo,
		updateTaskPriority,
		taskCount,
	};
}
