import z from "zod"

export const createSubTodoSchema = z.object({
  userId: z.string(),
  projectId: z.string(),
  labelId: z.string(),
  parentId: z.string(),
  taskName: z.string().min(1, "Task name is required").max(500, "Task name too long"),
  description: z.string().max(2000, "Description too long").optional(),
  dueDate: z.number().positive("Due date must be a positive timestamp"),
  priority: z.number().min(0).max(10).optional(),
  isCompleted: z.boolean().optional(),
  embedding: z.array(z.number()).length(1536).optional(),
})

export const updateSubTodoSchema = z.object({
  id: z.string(),
  taskName: z.string().min(1).max(500).optional(),
  description: z.string().max(2000).optional(),
  dueDate: z.number().positive().optional(),
  priority: z.number().min(0).max(10).optional(),
  isCompleted: z.boolean().optional(),
  projectId: z.string().optional(),
  labelId: z.string().optional(),
  parentId: z.string().optional(),
  embedding: z.array(z.number()).length(1536).optional(),
})

export const getSubTodosByParentSchema = z.object({
  userId: z.string(),
  parentId: z.string(),
})

export const getSubTodosByProjectSchema = z.object({
  userId: z.string(),
  projectId: z.string(),
})

export const getSubTodosByLabelSchema = z.object({
  userId: z.string(),
  labelId: z.string(),
})

export const getSubTodosDueBeforeSchema = z.object({
  userId: z.string(),
  dueDate: z.number().positive(),
})

export const searchSubTodosSchema = z.object({
  userId: z.string(),
  embedding: z.array(z.number()).length(1536),
  limit: z.number().min(1).max(100).optional(),
})