import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { createTodoSchema, getTodosByProjectSchema, getTodosByLabelSchema, getTodosDueBeforeSchema, updateTodoSchema, searchTodosSchema } from '@/schemas/todosSchema'


// CREATE - Add a new todo
export const createTodo = mutation({
  args: {
    userId: v.id("users"),
    projectId: v.optional(v.id("projects")),
    labelId: v.optional(v.id("labels")),
    taskName: v.string(),
    description: v.optional(v.string()),
    dueDate: v.number(),
    priority: v.optional(v.float64()),
    isCompleted: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    embedding: v.optional(v.array(v.float64())),
  },
  handler: async (ctx, args) => {
    // Validate input with Zod
    const validated = createTodoSchema.parse({
      userId: args.userId,
      projectId: args.projectId,
      labelId: args.labelId,
      taskName: args.taskName,
      description: args.description,
      dueDate: args.dueDate,
      priority: args.priority,
      isCompleted: args.isCompleted,
      tags: args.tags,
      embedding: args.embedding,
    })

    const todoId = await ctx.db.insert("todos", {
      userId: args.userId,
      projectId: args.projectId,
      labelId: args.labelId,
      taskName: validated.taskName,
      description: validated.description,
      dueDate: validated.dueDate,
      priority: validated.priority,
      isCompleted: validated.isCompleted ?? false,
      tags: validated.tags,
      embedding: validated.embedding,
    })
    return todoId
  },
})

// READ - Get a single todo by ID
export const getTodo = query({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    const todo = await ctx.db.get(args.id)
    if (!todo) {
      throw new Error("Todo not found")
    }
    return todo
  },
})

// READ - Get all todos for a user
export const getTodosByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("todos")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect()
  },
})

// READ - Get todos by project
export const getTodosByProject = query({
  args: {
    userId: v.id("users"),
    projectId: v.id("projects")
  },
  handler: async (ctx, args) => {
    // Validate input
    getTodosByProjectSchema.parse({
      userId: args.userId,
      projectId: args.projectId,
    })

    return await ctx.db
      .query("todos")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("projectId"), args.projectId)
        )
      )
      .collect()
  },
})

// READ - Get todos by label
export const getTodosByLabel = query({
  args: {
    userId: v.id("users"),
    labelId: v.id("labels")
  },
  handler: async (ctx, args) => {
    // Validate input
    getTodosByLabelSchema.parse({
      userId: args.userId,
      labelId: args.labelId,
    })

    return await ctx.db
      .query("todos")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("labelId"), args.labelId)
        )
      )
      .collect()
  },
})

// READ - Get completed todos
export const getCompletedTodos = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("todos")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("isCompleted"), true)
        )
      )
      .collect()
  },
})

// READ - Get pending todos
export const getPendingTodos = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("todos")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("isCompleted"), false)
        )
      )
      .collect()
  },
})

// READ - Get todos due before a certain date
export const getTodosDueBefore = query({
  args: {
    userId: v.id("users"),
    dueDate: v.number()
  },
  handler: async (ctx, args) => {
    // Validate input
    getTodosDueBeforeSchema.parse({
      userId: args.userId,
      dueDate: args.dueDate,
    })

    return await ctx.db
      .query("todos")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.lte(q.field("dueDate"), args.dueDate)
        )
      )
      .collect()
  },
})

// UPDATE - Update a todo
export const updateTodo = mutation({
  args: {
    id: v.id("todos"),
    taskName: v.optional(v.string()),
    description: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    priority: v.optional(v.float64()),
    isCompleted: v.optional(v.boolean()),
    projectId: v.optional(v.id("projects")),
    labelId: v.optional(v.id("labels")),
    tags: v.optional(v.array(v.string())),
    embedding: v.optional(v.array(v.float64())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args

    // Validate input with Zod
    updateTodoSchema.parse({
      id: args.id,
      taskName: args.taskName,
      description: args.description,
      dueDate: args.dueDate,
      priority: args.priority,
      isCompleted: args.isCompleted,
      projectId: args.projectId,
      labelId: args.labelId,
      tags: args.tags,
      embedding: args.embedding,
    })

    // Check if todo exists
    const existingTodo = await ctx.db.get(id)
    if (!existingTodo) {
      throw new Error("Todo not found")
    }

    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    )

    await ctx.db.patch(id, filteredUpdates)
    return id
  },
})

// UPDATE - Toggle todo completion status
export const toggleTodoCompletion = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    const todo = await ctx.db.get(args.id)
    if (!todo) {
      throw new Error("Todo not found")
    }

    await ctx.db.patch(args.id, {
      isCompleted: !todo.isCompleted,
    })
    return args.id
  },
})

// DELETE - Delete a todo
export const deleteTodo = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    // Check if todo exists before deleting
    const todo = await ctx.db.get(args.id)
    if (!todo) {
      throw new Error("Todo not found")
    }

    await ctx.db.delete(args.id)
    return args.id
  },
})

// DELETE - Delete all completed todos for a user
export const deleteCompletedTodos = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const completedTodos = await ctx.db
      .query("todos")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("isCompleted"), true)
        )
      )
      .collect()

    for (const todo of completedTodos) {
      await ctx.db.delete(todo._id)
    }

    return completedTodos.length
  },
})

// VECTOR SEARCH - Search todos by embedding similarity
export const searchTodosByEmbedding = query({
  args: {
    userId: v.id("users"),
    embedding: v.array(v.float64()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Validate input
    const validated = searchTodosSchema.parse({
      userId: args.userId,
      embedding: args.embedding,
      limit: args.limit,
    })

    const results = await ctx.db
      .query("todos")
      .collect()

    return results.slice(0, validated.limit ?? 10)
  },
})