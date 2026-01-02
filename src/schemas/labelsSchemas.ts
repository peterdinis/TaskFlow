import z from "zod";

export const createLabelSchema = z.object({
	userId: z.string().nullable(),
	name: z
		.string()
		.min(1, "Label name is required")
		.max(100, "Label name too long"),
	type: z.enum(["user", "system"]),
});

export const updateLabelSchema = z.object({
	id: z.string(),
	name: z.string().min(1).max(100).optional(),
	type: z.enum(["user", "system"]).optional(),
});

export const getLabelsByTypeSchema = z.object({
	userId: z.string().nullable(),
	type: z.enum(["user", "system"]),
});
