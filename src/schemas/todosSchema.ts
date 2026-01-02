import z from "zod";

export const createTodoSchema = z.object({
	userId: z.string(),
	projectId: z.string(),
	labelId: z.string(),
	taskName: z
		.string()
		.min(1, "Task name is required")
		.max(500, "Task name too long"),
	description: z.string().max(2000, "Description too long").optional(),
	dueDate: z.number().positive("Due date must be a positive timestamp"),
	priority: z.number().min(0).max(10).optional(),
	isCompleted: z.boolean().optional(),
	embedding: z.array(z.number()).length(1536).optional(),
});

export const updateTodoSchema = z.object({
	id: z.string(),
	taskName: z.string().min(1).max(500).optional(),
	description: z.string().max(2000).optional(),
	dueDate: z.number().positive().optional(),
	priority: z.number().min(0).max(10).optional(),
	isCompleted: z.boolean().optional(),
	projectId: z.string().optional(),
	labelId: z.string().optional(),
	embedding: z.array(z.number()).length(1536).optional(),
});

export const getTodosByProjectSchema = z.object({
	userId: z.string(),
	projectId: z.string(),
});

export const getTodosByLabelSchema = z.object({
	userId: z.string(),
	labelId: z.string(),
});

export const getTodosDueBeforeSchema = z.object({
	userId: z.string(),
	dueDate: z.number().positive(),
});

export const searchTodosSchema = z.object({
	userId: z.string(),
	embedding: z.array(z.number()).length(1536),
	limit: z.number().min(1).max(100).optional(),
});
