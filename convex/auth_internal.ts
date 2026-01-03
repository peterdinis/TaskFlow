import { v } from 'convex/values'
import { internalMutation, internalQuery } from './_generated/server'

export const registerInternal = internalMutation({
    args: {
        name: v.string(),
        email: v.string(),
        passwordHash: v.string(),
        sessionToken: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await ctx.db.insert('users', {
            email: args.email,
            name: args.name,
            passwordHash: args.passwordHash,
            role: 'user',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isActive: true,
        })

        const sessionToken = args.sessionToken
        await ctx.db.insert('sessions', {
            userId,
            sessionToken,
            expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        })

        return { userId, sessionToken }
    },
})

export const loginInternal = internalMutation({
    args: {
        userId: v.id('users'),
        rememberMe: v.boolean(),
        sessionToken: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, {
            lastLogin: Date.now(),
            updatedAt: Date.now(),
        })

        const sessionToken = args.sessionToken
        const expiresAt = args.rememberMe
            ? Date.now() + 30 * 24 * 60 * 60 * 1000
            : Date.now() + 24 * 60 * 60 * 1000

        await ctx.db.insert('sessions', {
            userId: args.userId,
            sessionToken,
            expiresAt,
        })

        const oldSessions = await ctx.db
            .query('sessions')
            .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
            .collect()

        for (const session of oldSessions) {
            if (session.expiresAt < Date.now()) {
                await ctx.db.delete(session._id)
            }
        }

        return { sessionToken }
    },
})

export const updateProfileInternal = internalMutation({
    args: {
        userId: v.id('users'),
        name: v.string(),
        email: v.string(),
        passwordHash: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const patch: any = {
            name: args.name,
            email: args.email,
            updatedAt: Date.now(),
        }
        if (args.passwordHash) {
            patch.passwordHash = args.passwordHash
        }
        await ctx.db.patch(args.userId, patch)
    },
})

export const resetPasswordInternal = internalMutation({
    args: {
        userId: v.id('users'),
        resetRequestId: v.id('passwordResets'),
        passwordHash: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, {
            passwordHash: args.passwordHash,
            updatedAt: Date.now(),
        })

        await ctx.db.patch(args.resetRequestId, {
            used: true,
        })

        const sessions = await ctx.db
            .query('sessions')
            .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
            .collect()

        for (const session of sessions) {
            await ctx.db.delete(session._id)
        }
    },
})

export const insertPasswordResetInternal = internalMutation({
    args: {
        userId: v.id('users'),
        token: v.string(),
        expiresAt: v.number(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert('passwordResets', {
            userId: args.userId,
            token: args.token,
            expiresAt: args.expiresAt,
            used: false,
        })
    },
})

export const getUserByEmailInternal = internalQuery({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query('users')
            .withIndex('by_email', (q) => q.eq('email', args.email))
            .first()
    },
})

export const getUserByIdInternal = internalQuery({
    args: { userId: v.id('users') },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.userId)
    },
})

export const getSessionByTokenInternal = internalQuery({
    args: { sessionToken: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query('sessions')
            .withIndex('by_session_token', (q) => q.eq('sessionToken', args.sessionToken))
            .first()
    },
})

export const getResetRequestByTokenInternal = internalQuery({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query('passwordResets')
            .withIndex('by_token', (q) => q.eq('token', args.token))
            .first()
    },
})
