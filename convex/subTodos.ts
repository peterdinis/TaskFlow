import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { createSubTodoSchema, getSubTodosByParentSchema, getSubTodosByProjectSchema, getSubTodosByLabelSchema, getSubTodosDueBeforeSchema, updateSubTodoSchema, searchSubTodosSchema } from '@/schemas/subTodosSchemas'

export const createSubTodo = mutation({
  args: {
    userId: v.id("users"),
    projectId: v.id("projects"),
    labelId: v.id("labels"),
    parentId: v.id("todos"),
    taskName: v.string(),
    description: v.optional(v.string()),
    dueDate: v.number(),
    priority: v.optional(v.float64()),
    isCompleted: v.optional(v.boolean()),
    embedding: v.optional(v.array(v.float64())),
  },
  handler: async (ctx, args) => {
    // Validate input with Zod
    const validated = createSubTodoSchema.parse({
      userId: args.userId,
      projectId: args.projectId,
      labelId: args.labelId,
      parentId: args.parentId,
      taskName: args.taskName,
      description: args.description,
      dueDate: args.dueDate,
      priority: args.priority,
      isCompleted: args.isCompleted,
      embedding: args.embedding,
    })

    // Verify parent todo exists
    const parentTodo = await ctx.db.get(args.parentId)
    if (!parentTodo) {
      throw new Error("Parent todo not found")
    }

    const subTodoId = await ctx.db.insert("subTodos", {
      userId: args.userId,
      projectId: args.projectId,
      labelId: args.labelId,
      parentId: args.parentId,
      taskName: validated.taskName,
      description: validated.description,
      dueDate: validated.dueDate,
      priority: validated.priority,
      isCompleted: validated.isCompleted ?? false,
      embedding: validated.embedding,
    })
    return subTodoId
  },
})

// READ - Get a single subTodo by ID
export const getSubTodo = query({
  args: { id: v.id("subTodos") },
  handler: async (ctx, args) => {
    const subTodo = await ctx.db.get(args.id)
    if (!subTodo) {
      throw new Error("SubTodo not found")
    }
    return subTodo
  },
})

// READ - Get all subTodos for a user
export const getSubTodosByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subTodos")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect()
  },
})

// READ - Get subTodos by parent todo
export const getSubTodosByParent = query({
  args: { 
    userId: v.id("users"),
    parentId: v.id("todos") 
  },
  handler: async (ctx, args) => {
    // Validate input
    getSubTodosByParentSchema.parse({
      userId: args.userId,
      parentId: args.parentId,
    })

    return await ctx.db
      .query("subTodos")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("parentId"), args.parentId)
        )
      )
      .collect()
  },
})

// READ - Get subTodos by project
export const getSubTodosByProject = query({
  args: { 
    userId: v.id("users"),
    projectId: v.id("projects") 
  },
  handler: async (ctx, args) => {
    // Validate input
    getSubTodosByProjectSchema.parse({
      userId: args.userId,
      projectId: args.projectId,
    })

    return await ctx.db
      .query("subTodos")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("projectId"), args.projectId)
        )
      )
      .collect()
  },
})

// READ - Get subTodos by label
export const getSubTodosByLabel = query({
  args: { 
    userId: v.id("users"),
    labelId: v.id("labels") 
  },
  handler: async (ctx, args) => {
    // Validate input
    getSubTodosByLabelSchema.parse({
      userId: args.userId,
      labelId: args.labelId,
    })

    return await ctx.db
      .query("subTodos")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("labelId"), args.labelId)
        )
      )
      .collect()
  },
})

// READ - Get completed subTodos
export const getCompletedSubTodos = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subTodos")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("isCompleted"), true)
        )
      )
      .collect()
  },
})

// READ - Get pending subTodos
export const getPendingSubTodos = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subTodos")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("isCompleted"), false)
        )
      )
      .collect()
  },
})

// READ - Get completed subTodos for a specific parent
export const getCompletedSubTodosByParent = query({
  args: { 
    userId: v.id("users"),
    parentId: v.id("todos")
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subTodos")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("parentId"), args.parentId),
          q.eq(q.field("isCompleted"), true)
        )
      )
      .collect()
  },
})

// READ - Get pending subTodos for a specific parent
export const getPendingSubTodosByParent = query({
  args: { 
    userId: v.id("users"),
    parentId: v.id("todos")
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subTodos")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("parentId"), args.parentId),
          q.eq(q.field("isCompleted"), false)
        )
      )
      .collect()
  },
})

// READ - Get subTodos due before a certain date
export const getSubTodosDueBefore = query({
  args: { 
    userId: v.id("users"),
    dueDate: v.number() 
  },
  handler: async (ctx, args) => {
    // Validate input
    getSubTodosDueBeforeSchema.parse({
      userId: args.userId,
      dueDate: args.dueDate,
    })

    return await ctx.db
      .query("subTodos")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.lte(q.field("dueDate"), args.dueDate)
        )
      )
      .collect()
  },
})

// UPDATE - Update a subTodo
export const updateSubTodo = mutation({
  args: {
    id: v.id("subTodos"),
    taskName: v.optional(v.string()),
    description: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    priority: v.optional(v.float64()),
    isCompleted: v.optional(v.boolean()),
    projectId: v.optional(v.id("projects")),
    labelId: v.optional(v.id("labels")),
    parentId: v.optional(v.id("todos")),
    embedding: v.optional(v.array(v.float64())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args

    // Validate input with Zod
    updateSubTodoSchema.parse({
      id: args.id,
      taskName: args.taskName,
      description: args.description,
      dueDate: args.dueDate,
      priority: args.priority,
      isCompleted: args.isCompleted,
      projectId: args.projectId,
      labelId: args.labelId,
      parentId: args.parentId,
      embedding: args.embedding,
    })

    // Check if subTodo exists
    const existingSubTodo = await ctx.db.get(id)
    if (!existingSubTodo) {
      throw new Error("SubTodo not found")
    }

    // If updating parentId, verify new parent exists
    if (args.parentId) {
      const newParent = await ctx.db.get(args.parentId)
      if (!newParent) {
        throw new Error("New parent todo not found")
      }
    }

    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    )
    
    await ctx.db.patch(id, filteredUpdates)
    return id
  },
})

// UPDATE - Toggle subTodo completion status
export const toggleSubTodoCompletion = mutation({
  args: { id: v.id("subTodos") },
  handler: async (ctx, args) => {
    const subTodo = await ctx.db.get(args.id)
    if (!subTodo) {
      throw new Error("SubTodo not found")
    }
    
    await ctx.db.patch(args.id, {
      isCompleted: !subTodo.isCompleted,
    })
    return args.id
  },
})

// DELETE - Delete a subTodo
export const deleteSubTodo = mutation({
  args: { id: v.id("subTodos") },
  handler: async (ctx, args) => {
    // Check if subTodo exists before deleting
    const subTodo = await ctx.db.get(args.id)
    if (!subTodo) {
      throw new Error("SubTodo not found")
    }

    await ctx.db.delete(args.id)
    return args.id
  },
})

// DELETE - Delete all subTodos for a specific parent todo
export const deleteSubTodosByParent = mutation({
  args: { 
    userId: v.id("users"),
    parentId: v.id("todos")
  },
  handler: async (ctx, args) => {
    const subTodos = await ctx.db
      .query("subTodos")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("parentId"), args.parentId)
        )
      )
      .collect()
    
    for (const subTodo of subTodos) {
      await ctx.db.delete(subTodo._id)
    }
    
    return subTodos.length
  },
})

// DELETE - Delete all completed subTodos for a user
export const deleteCompletedSubTodos = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const completedSubTodos = await ctx.db
      .query("subTodos")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("isCompleted"), true)
        )
      )
      .collect()
    
    for (const subTodo of completedSubTodos) {
      await ctx.db.delete(subTodo._id)
    }
    
    return completedSubTodos.length
  },
})

// DELETE - Delete all completed subTodos for a specific parent
export const deleteCompletedSubTodosByParent = mutation({
  args: { 
    userId: v.id("users"),
    parentId: v.id("todos")
  },
  handler: async (ctx, args) => {
    const completedSubTodos = await ctx.db
      .query("subTodos")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("parentId"), args.parentId),
          q.eq(q.field("isCompleted"), true)
        )
      )
      .collect()
    
    for (const subTodo of completedSubTodos) {
      await ctx.db.delete(subTodo._id)
    }
    
    return completedSubTodos.length
  },
})

// VECTOR SEARCH - Search subTodos by embedding similarity
export const searchSubTodosByEmbedding = query({
  args: {
    userId: v.id("users"),
    embedding: v.array(v.float64()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Validate input
    const validated = searchSubTodosSchema.parse({
      userId: args.userId,
      embedding: args.embedding,
      limit: args.limit,
    })

    const results = await ctx.db
      .query("subTodos")
      .collect()
    
    return results.slice(0, validated.limit ?? 10)
  },
})