import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { z } from 'zod'

// Zod schemas for validation
const createLabelSchema = z.object({
  userId: z.string().nullable(),
  name: z.string().min(1, "Label name is required").max(100, "Label name too long"),
  type: z.enum(["user", "system"]),
})

const updateLabelSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  type: z.enum(["user", "system"]).optional(),
})

const getLabelsByTypeSchema = z.object({
  userId: z.string().nullable(),
  type: z.enum(["user", "system"]),
})

// CREATE - Add a new label
export const createLabel = mutation({
  args: {
    userId: v.union(v.id("users"), v.null()),
    name: v.string(),
    type: v.union(v.literal("user"), v.literal("system")),
  },
  handler: async (ctx, args) => {
    // Validate input with Zod
    const validated = createLabelSchema.parse({
      userId: args.userId,
      name: args.name,
      type: args.type,
    })

    // Check if label with same name already exists for this user
    const existingLabel = await ctx.db
      .query("labels")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("name"), validated.name)
        )
      )
      .first()

    if (existingLabel) {
      throw new Error("Label with this name already exists")
    }

    const labelId = await ctx.db.insert("labels", {
      userId: args.userId,
      name: validated.name,
      type: validated.type,
    })
    return labelId
  },
})

// READ - Get a single label by ID
export const getLabel = query({
  args: { id: v.id("labels") },
  handler: async (ctx, args) => {
    const label = await ctx.db.get(args.id)
    if (!label) {
      throw new Error("Label not found")
    }
    return label
  },
})

// READ - Get all labels for a user (including system labels)
export const getLabelsByUser = query({
  args: { userId: v.union(v.id("users"), v.null()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("labels")
      .filter((q) => 
        q.or(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("userId"), null) // Include system labels
        )
      )
      .collect()
  },
})

// READ - Get only user-created labels
export const getUserLabels = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("labels")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("type"), "user")
        )
      )
      .collect()
  },
})

// READ - Get only system labels
export const getSystemLabels = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("labels")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), null),
          q.eq(q.field("type"), "system")
        )
      )
      .collect()
  },
})

// READ - Get labels by type
export const getLabelsByType = query({
  args: { 
    userId: v.union(v.id("users"), v.null()),
    type: v.union(v.literal("user"), v.literal("system"))
  },
  handler: async (ctx, args) => {
    // Validate input
    getLabelsByTypeSchema.parse({
      userId: args.userId,
      type: args.type,
    })

    return await ctx.db
      .query("labels")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("type"), args.type)
        )
      )
      .collect()
  },
})

// READ - Search labels by name
export const searchLabelsByName = query({
  args: { 
    userId: v.union(v.id("users"), v.null()),
    searchTerm: v.string()
  },
  handler: async (ctx, args) => {
    const allLabels = await ctx.db
      .query("labels")
      .filter((q) => 
        q.or(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("userId"), null)
        )
      )
      .collect()

    // Filter by search term (case-insensitive)
    const searchLower = args.searchTerm.toLowerCase()
    return allLabels.filter(label => 
      label.name.toLowerCase().includes(searchLower)
    )
  },
})

// UPDATE - Update a label
export const updateLabel = mutation({
  args: {
    id: v.id("labels"),
    name: v.optional(v.string()),
    type: v.optional(v.union(v.literal("user"), v.literal("system"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args

    // Validate input with Zod
    updateLabelSchema.parse({
      id: args.id,
      name: args.name,
      type: args.type,
    })

    // Check if label exists
    const existingLabel = await ctx.db.get(id)
    if (!existingLabel) {
      throw new Error("Label not found")
    }

    // If updating name, check for duplicates
    if (args.name && args.name !== existingLabel.name) {
      const duplicate = await ctx.db
        .query("labels")
        .filter((q) => 
          q.and(
            q.eq(q.field("userId"), existingLabel.userId),
            q.eq(q.field("name"), args.name!)
          )
        )
        .first()

      if (duplicate) {
        throw new Error("Label with this name already exists")
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

// DELETE - Delete a label
export const deleteLabel = mutation({
  args: { id: v.id("labels") },
  handler: async (ctx, args) => {
    // Check if label exists
    const label = await ctx.db.get(args.id)
    if (!label) {
      throw new Error("Label not found")
    }

    // Check if label is being used by any todos
    const todosWithLabel = await ctx.db
      .query("todos")
      .filter((q) => q.eq(q.field("labelId"), args.id))
      .first()

    if (todosWithLabel) {
      throw new Error("Cannot delete label that is being used by todos")
    }

    // Check if label is being used by any subTodos
    const subTodosWithLabel = await ctx.db
      .query("subTodos")
      .filter((q) => q.eq(q.field("labelId"), args.id))
      .first()

    if (subTodosWithLabel) {
      throw new Error("Cannot delete label that is being used by subTodos")
    }

    await ctx.db.delete(args.id)
    return args.id
  },
})

// DELETE - Force delete a label (and update all related todos/subTodos)
export const forceDeleteLabel = mutation({
  args: { 
    id: v.id("labels"),
    replacementLabelId: v.id("labels")
  },
  handler: async (ctx, args) => {
    // Check if label exists
    const label = await ctx.db.get(args.id)
    if (!label) {
      throw new Error("Label not found")
    }

    // Check if replacement label exists
    const replacementLabel = await ctx.db.get(args.replacementLabelId)
    if (!replacementLabel) {
      throw new Error("Replacement label not found")
    }

    // Update all todos using this label
    const todosWithLabel = await ctx.db
      .query("todos")
      .filter((q) => q.eq(q.field("labelId"), args.id))
      .collect()

    for (const todo of todosWithLabel) {
      await ctx.db.patch(todo._id, { labelId: args.replacementLabelId })
    }

    // Update all subTodos using this label
    const subTodosWithLabel = await ctx.db
      .query("subTodos")
      .filter((q) => q.eq(q.field("labelId"), args.id))
      .collect()

    for (const subTodo of subTodosWithLabel) {
      await ctx.db.patch(subTodo._id, { labelId: args.replacementLabelId })
    }

    await ctx.db.delete(args.id)
    return {
      deletedLabelId: args.id,
      updatedTodosCount: todosWithLabel.length,
      updatedSubTodosCount: subTodosWithLabel.length,
    }
  },
})

// DELETE - Delete all user labels for a user
export const deleteUserLabels = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const userLabels = await ctx.db
      .query("labels")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("type"), "user")
        )
      )
      .collect()
    
    let deletedCount = 0
    let skippedCount = 0

    for (const label of userLabels) {
      // Check if label is being used
      const isUsed = await ctx.db
        .query("todos")
        .filter((q) => q.eq(q.field("labelId"), label._id))
        .first()

      if (!isUsed) {
        await ctx.db.delete(label._id)
        deletedCount++
      } else {
        skippedCount++
      }
    }
    
    return { deletedCount, skippedCount }
  },
})