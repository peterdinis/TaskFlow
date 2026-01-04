import { v } from 'convex/values'
import { mutation, query, internalMutation } from './_generated/server'

// READ - Get all notifications for a user
export const getNotifications = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("notifications")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .collect()
    },
})

// UPDATE - Mark a notification as read
export const markRead = mutation({
    args: { id: v.id("notifications") },
    handler: async (ctx, args) => {
        const notification = await ctx.db.get(args.id)
        if (!notification) {
            throw new Error("Notification not found")
        }
        await ctx.db.patch(args.id, { isRead: true })
        return args.id
    },
})

// UPDATE - Mark all notifications as read for a user
export const markAllRead = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const unreadNotifications = await ctx.db
            .query("notifications")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .filter((q) => q.eq(q.field("isRead"), false))
            .collect()

        for (const notification of unreadNotifications) {
            await ctx.db.patch(notification._id, { isRead: true })
        }
    },
})

// DELETE - Delete a notification
export const deleteNotification = mutation({
    args: { id: v.id("notifications") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id)
        return args.id
    },
})

// DELETE - Clear all notifications for a user
export const clearAll = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect()

        for (const notification of notifications) {
            await ctx.db.delete(notification._id)
        }
    },
})

// INTERNAL - Create a notification
export const createNotificationInternal = mutation({
    args: {
        userId: v.id("users"),
        type: v.union(v.literal("success"), v.literal("reminder"), v.literal("alert")),
        title: v.string(),
        message: v.string(),
    },
    handler: async (ctx, args) => {
        const notificationId = await ctx.db.insert("notifications", {
            userId: args.userId,
            type: args.type,
            title: args.title,
            message: args.message,
            isRead: false,
            createdAt: Date.now(),
        })
        return notificationId
    },
})
