import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { createProjectSchema, updateProjectSchema } from '@/schemas/projectsSchemas'

// CREATE - Add a new project
export const createProject = mutation({
    args: {
        userId: v.union(v.id("users"), v.null()),
        name: v.string(),
        type: v.union(v.literal("user"), v.literal("system")),
        color: v.optional(v.string()),
        icon: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Validate input with Zod
        const validated = createProjectSchema.parse({
            userId: args.userId,
            name: args.name,
            type: args.type,
            color: args.color,
            icon: args.icon,
        })

        const projectId = await ctx.db.insert("projects", {
            userId: args.userId,
            name: validated.name,
            type: validated.type,
            color: validated.color,
            icon: validated.icon,
        })
        return projectId
    },
})

// READ - Get a single project by ID
export const getProject = query({
    args: { id: v.id("projects") },
    handler: async (ctx, args) => {
        const project = await ctx.db.get(args.id)
        if (!project) {
            throw new Error("Project not found")
        }
        return project
    },
})

// READ - Get all projects for a user (including system projects)
export const getProjectsByUser = query({
    args: { userId: v.union(v.id("users"), v.null()) },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("projects")
            .filter((q) =>
                q.or(
                    q.eq(q.field("userId"), args.userId),
                    q.eq(q.field("userId"), null)
                )
            )
            .collect()
    },
})

// UPDATE - Update a project
export const updateProject = mutation({
    args: {
        id: v.id("projects"),
        name: v.optional(v.string()),
        type: v.optional(v.union(v.literal("user"), v.literal("system"))),
        color: v.optional(v.string()),
        icon: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args

        // Validate input with Zod
        updateProjectSchema.parse({
            id: args.id,
            name: args.name,
            type: args.type,
            color: args.color,
            icon: args.icon,
        })

        // Check if project exists
        const existingProject = await ctx.db.get(id)
        if (!existingProject) {
            throw new Error("Project not found")
        }

        // Filter out undefined values
        const filteredUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, value]) => value !== undefined)
        )

        await ctx.db.patch(id, filteredUpdates)
        return id
    },
})

// DELETE - Delete a project
export const deleteProject = mutation({
    args: { id: v.id("projects") },
    handler: async (ctx, args) => {
        // Check if project exists
        const project = await ctx.db.get(args.id)
        if (!project) {
            throw new Error("Project not found")
        }

        // Check if project has any todos
        const todosInProject = await ctx.db
            .query("todos")
            .filter((q) => q.eq(q.field("projectId"), args.id))
            .first()

        if (todosInProject) {
            throw new Error("Cannot delete project that contains todos")
        }

        await ctx.db.delete(args.id)
        return args.id
    },
})
