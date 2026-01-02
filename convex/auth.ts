import { v } from 'convex/values'
import { mutation, query, action } from './_generated/server'
import { hash, compare } from 'bcryptjs'

// REGISTER USER
export const register = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const { name, email, password } = args

    // Check if user exists
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .first()

    if (existingUser) {
      throw new Error('Používateľ s týmto emailom už existuje')
    }

    // Hash password
    const passwordHash = await hash(password, 12)

    // Create user
    const userId = await ctx.db.insert('users', {
      email,
      name,
      passwordHash,
      role: 'user',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: true,
    })

    // Create session
    const sessionToken = crypto.randomUUID()
    const sessionId = await ctx.db.insert('sessions', {
      userId,
      sessionToken,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    })

    return {
      userId,
      sessionToken,
      user: {
        id: userId,
        email,
        name,
        role: 'user',
      }
    }
  },
})

// LOGIN USER
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    rememberMe: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { email, password, rememberMe = false } = args

    // Find user
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .first()

    if (!user) {
      throw new Error('Nesprávny email alebo heslo')
    }

    if (!user.isActive) {
      throw new Error('Účet je deaktivovaný')
    }

    // Verify password
    const isValid = await compare(password, user.passwordHash)
    if (!isValid) {
      throw new Error('Nesprávny email alebo heslo')
    }

    // Update last login
    await ctx.db.patch(user._id, {
      lastLogin: Date.now(),
      updatedAt: Date.now(),
    })

    // Create session
    const sessionToken = crypto.randomUUID()
    const expiresAt = rememberMe
      ? Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
      : Date.now() + 24 * 60 * 60 * 1000 // 1 day

    await ctx.db.insert('sessions', {
      userId: user._id,
      sessionToken,
      expiresAt,
    })

    // Clean up old sessions
    const oldSessions = await ctx.db
      .query('sessions')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .collect()

    for (const session of oldSessions) {
      if (session.expiresAt < Date.now()) {
        await ctx.db.delete(session._id)
      }
    }

    return {
      sessionToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    }
  },
})

// GET CURRENT USER
export const getCurrentUser = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.sessionToken) {
      return null
    }

    // Find session
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_session_token', (q) => q.eq('sessionToken', args.sessionToken as string))
      .first()

    if (!session || session.expiresAt < Date.now()) {
      return null
    }

    // Get user
    const user = await ctx.db.get(session.userId)
    if (!user || !user.isActive) {
      return null
    }

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    }
  },
})

// LOGOUT
export const logout = mutation({
  args: {
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_session_token', (q) => q.eq('sessionToken', args.sessionToken))
      .first()

    if (session) {
      await ctx.db.delete(session._id)
    }

    return { success: true }
  },
})

// UPDATE PROFILE
export const updateProfile = mutation({
  args: {
    sessionToken: v.string(),
    name: v.string(),
    email: v.string(),
    currentPassword: v.optional(v.string()),
    newPassword: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { sessionToken, name, email, currentPassword, newPassword } = args

    // Verify session
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_session_token', (q) => q.eq('sessionToken', sessionToken))
      .first()

    if (!session) {
      throw new Error('Session not found')
    }

    const user = await ctx.db.get(session.userId)
    if (!user) {
      throw new Error('User not found')
    }

    // Check if email is being changed and if it's available
    if (email !== user.email) {
      const existingUser = await ctx.db
        .query('users')
        .withIndex('by_email', (q) => q.eq('email', email))
        .first()

      if (existingUser) {
        throw new Error('Email už je používaný')
      }
    }

    // If changing password, verify current password
    if (newPassword && currentPassword) {
      const isValid = await compare(currentPassword, user.passwordHash)
      if (!isValid) {
        throw new Error('Aktuálne heslo je nesprávne')
      }

      const newPasswordHash = await hash(newPassword, 12)
      await ctx.db.patch(user._id, {
        name,
        email,
        passwordHash: newPasswordHash,
        updatedAt: Date.now(),
      })
    } else {
      await ctx.db.patch(user._id, {
        name,
        email,
        updatedAt: Date.now(),
      })
    }

    return {
      user: {
        id: user._id,
        email,
        name,
        role: user.role,
      }
    }
  },
})

// FORGOT PASSWORD
export const forgotPassword = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first()

    if (!user) {
      // Don't reveal if user exists
      return { success: true }
    }

    // Generate reset token
    const token = crypto.randomUUID()
    const expiresAt = Date.now() + 60 * 60 * 1000 // 1 hour

    await ctx.db.insert('passwordResets', {
      userId: user._id,
      token,
      expiresAt,
      used: false,
    })

    // In production, send email with reset link
    console.log(`Password reset token for ${user.email}: ${token}`)

    return { success: true }
  },
})

// RESET PASSWORD
export const resetPassword = mutation({
  args: {
    token: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Find valid reset token
    const resetRequest = await ctx.db
      .query('passwordResets')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first()

    if (!resetRequest || resetRequest.expiresAt < Date.now() || resetRequest.used) {
      throw new Error('Neplatný alebo expirovaný token')
    }

    const user = await ctx.db.get(resetRequest.userId)
    if (!user) {
      throw new Error('Používateľ neexistuje')
    }

    // Hash new password
    const passwordHash = await hash(args.password, 12)

    // Update user password
    await ctx.db.patch(user._id, {
      passwordHash,
      updatedAt: Date.now(),
    })

    // Mark token as used
    await ctx.db.patch(resetRequest._id, {
      used: true,
    })

    // Delete all user sessions (force logout from all devices)
    const sessions = await ctx.db
      .query('sessions')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .collect()

    for (const session of sessions) {
      await ctx.db.delete(session._id)
    }

    return { success: true }
  },
})

// VALIDATE RESET TOKEN
export const validateResetToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const resetRequest = await ctx.db
      .query('passwordResets')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first()

    return {
      valid: !!(resetRequest && resetRequest.expiresAt >= Date.now() && !resetRequest.used)
    }
  },
})