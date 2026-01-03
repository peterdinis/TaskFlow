import { useTodo } from "@/context/TodoContext";
import { Priority, Task, Project } from "@/types/task";
import { useCallback } from "react";

export function useTasks() {
	const {
		filteredTasks,
		projects,
		activeProject,
		setActiveProject,
		addTodo,
		toggleTodo,
		deleteTodo,
		updateTodo,
		taskCount,
	} = useTodo();

	const addTask = useCallback(
		async (title: string, priority: Priority = "none") => {
			await addTodo({
				taskName: title,
				projectId: activeProject === "today" ? "inbox" : activeProject,
				labelId: "none", // Default label if not specified
				dueDate: Date.now(),
				priority: priority as any,
			});
		},
		[addTodo, activeProject],
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
		activeProject,
		setActiveProject,
		addTask,
		toggleTask: toggleTodo,
		deleteTask: deleteTodo,
		updateTaskPriority,
		taskCount,
	};
}
