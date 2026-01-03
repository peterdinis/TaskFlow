import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
    users: defineTable({
        email: v.string(),
        name: v.optional(v.string()),
        passwordHash: v.string(),
        role: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
        lastLogin: v.optional(v.number()),
        isActive: v.boolean(),
    })
        .index("by_email", ["email"])
        .index("by_created", ["createdAt"]),

    sessions: defineTable({
        userId: v.id("users"),
        sessionToken: v.string(),
        expiresAt: v.number(),
        userAgent: v.optional(v.string()),
        ipAddress: v.optional(v.string()),
    })
        .index("by_session_token", ["sessionToken"])
        .index("by_user_id", ["userId"]),

    passwordResets: defineTable({
        userId: v.id("users"),
        token: v.string(),
        expiresAt: v.number(),
        used: v.boolean(),
    })
        .index("by_token", ["token"])
        .index("by_user_id", ["userId"]),
    todos: defineTable({
        userId: v.id("users"),
        projectId: v.id("projects"),
        labelId: v.id("labels"),
        taskName: v.string(),
        description: v.optional(v.string()),
        dueDate: v.number(),
        priority: v.optional(v.float64()),
        isCompleted: v.boolean(),
        embedding: v.optional(v.array(v.float64())),
    }).vectorIndex("by_embedding", {
        vectorField: "embedding",
        dimensions: 1536,
        filterFields: ["userId"],
    }),
    subTodos: defineTable({
        userId: v.id("users"),
        projectId: v.id("projects"),
        labelId: v.id("labels"),
        parentId: v.id("todos"),
        taskName: v.string(),
        description: v.optional(v.string()),
        dueDate: v.number(),
        priority: v.optional(v.float64()),
        isCompleted: v.boolean(),
        embedding: v.optional(v.array(v.float64())),
    }).vectorIndex("by_embedding", {
        vectorField: "embedding",
        dimensions: 1536,
        filterFields: ["userId"],
    }),
    labels: defineTable({
        userId: v.union(v.id("users"), v.null()),
        name: v.string(),
        type: v.union(v.literal("user"), v.literal("system")),
    }),
    projects: defineTable({
        userId: v.union(v.id("users"), v.null()),
        name: v.string(),
        type: v.union(v.literal("user"), v.literal("system")),
        color: v.optional(v.string()),
        icon: v.optional(v.string()),
    }),
    notifications: defineTable({
        userId: v.id("users"),
        type: v.union(v.literal("success"), v.literal("reminder"), v.literal("alert")),
        title: v.string(),
        message: v.string(),
        isRead: v.boolean(),
        createdAt: v.number(),
    }).index("by_user", ["userId"]),
})
