import z from "zod";

export const createProjectSchema = z.object({
	userId: z.string().nullable(),
	name: z
		.string()
		.min(1, "Project name is required")
		.max(100, "Project name too long"),
	type: z.enum(["user", "system"]),
	color: z.string().optional(),
	icon: z.string().optional(),
});

export const updateProjectSchema = z.object({
	id: z.string(),
	name: z.string().min(1).max(100).optional(),
	type: z.enum(["user", "system"]).optional(),
	color: z.string().optional(),
	icon: z.string().optional(),
});

export const getProjectsByTypeSchema = z.object({
	userId: z.string().nullable(),
	type: z.enum(["user", "system"]),
});
