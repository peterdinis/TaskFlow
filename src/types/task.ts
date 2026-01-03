export type Priority = "high" | "medium" | "low" | "none";

export interface Task {
	id: string;
	title: string;
	description?: string;
	completed: boolean;
	completedAt?: Date;
	priority: Priority;
	projectId: string;
	labelId?: string;
	isFavorite?: boolean;
	tags?: string[];
	createdAt: Date;
	dueDate?: Date;
	archivedAt?: Date;
	deletedAt?: Date;
}

export interface Project {
	id: string;
	name: string;
	color?: string;
	icon?: string;
	type?: "user" | "system";
	isShared?: boolean;
}
