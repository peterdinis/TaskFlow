import { v } from 'convex/values'
import { mutation, query, action, ActionCtx, QueryCtx, MutationCtx } from './_generated/server'
import { hash, compare } from 'bcryptjs'
import { internal } from './_generated/api'

// --- Helper Functions ---

async function getValidSession(ctx: ActionCtx | QueryCtx | MutationCtx, sessionToken: string): Promise<any> {
  const session = await ctx.runQuery(internal.auth_internal.getSessionByTokenInternal, { sessionToken })
  if (!session) {
    throw new Error('Session not found')
  }
  return session
}

async function getUserById(ctx: ActionCtx | QueryCtx | MutationCtx, userId: any): Promise<any> {
  const user = await ctx.runQuery(internal.auth_internal.getUserByIdInternal, { userId })
  if (!user) {
    throw new Error('User not found')
  }
  return user
}

async function checkEmailAvailability(ctx: ActionCtx | QueryCtx | MutationCtx, email: string, currentEmail?: string): Promise<void> {
  if (email === currentEmail) return

  const existingUser = await ctx.runQuery(internal.auth_internal.getUserByEmailInternal, { email })
  if (existingUser) {
    throw new Error('Email už je používaný')
  }
}

function formatUserResponse(user: any) {
  return {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
  }
}

// --- Public Actions ---

export const register = action({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx: ActionCtx, args: { name: string; email: string; password: string }) => {
    const { name, email, password } = args

    await checkEmailAvailability(ctx, email)

    const passwordHash = await hash(password, 12)
    const { userId, sessionToken } = await ctx.runMutation(internal.auth_internal.registerInternal, {
      name,
      email,
      passwordHash,
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

export const login = action({
  args: {
    email: v.string(),
    password: v.string(),
    rememberMe: v.optional(v.boolean()),
  },
  handler: async (ctx: ActionCtx, args: { email: string; password: string; rememberMe?: boolean }) => {
    const { email, password, rememberMe = false } = args

    const user = await ctx.runQuery(internal.auth_internal.getUserByEmailInternal, { email })
    if (!user) {
      throw new Error('Nesprávny email alebo heslo')
    }

    if (!user.isActive) {
      throw new Error('Účet je deaktivovaný')
    }

    const isValid = await compare(password, user.passwordHash)
    if (!isValid) {
      throw new Error('Nesprávny email alebo heslo')
    }

    const { sessionToken } = await ctx.runMutation(internal.auth_internal.loginInternal, {
      userId: user._id,
      rememberMe,
    })

    return {
      sessionToken,
      user: formatUserResponse(user),
    }
  },
})

export const updateProfile = action({
  args: {
    sessionToken: v.string(),
    name: v.string(),
    email: v.string(),
    currentPassword: v.optional(v.string()),
    newPassword: v.optional(v.string()),
  },
  handler: async (ctx: ActionCtx, args: { sessionToken: string; name: string; email: string; currentPassword?: string; newPassword?: string }) => {
    const { sessionToken, name, email, currentPassword, newPassword } = args

    const session = await getValidSession(ctx, sessionToken)
    const user = await getUserById(ctx, session.userId)

    await checkEmailAvailability(ctx, email, user.email)

    let passwordHash: string | undefined
    if (newPassword && currentPassword) {
      const isValid = await compare(currentPassword, user.passwordHash)
      if (!isValid) {
        throw new Error('Aktuálne heslo je nesprávne')
      }
      passwordHash = await hash(newPassword, 12)
    }

    await ctx.runMutation(internal.auth_internal.updateProfileInternal, {
      userId: user._id,
      name,
      email,
      passwordHash,
    })

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

export const resetPassword = action({
  args: {
    token: v.string(),
    password: v.string(),
  },
  handler: async (ctx: ActionCtx, args: { token: string; password: string }) => {
    const resetRequest = await ctx.runQuery(
      internal.auth_internal.getResetRequestByTokenInternal,
      { token: args.token }
    )

    if (!resetRequest || resetRequest.expiresAt < Date.now() || resetRequest.used) {
      throw new Error('Neplatný alebo expirovaný token')
    }

    const user = await getUserById(ctx, resetRequest.userId)

    const passwordHash = await hash(args.password, 12)
    await ctx.runMutation(internal.auth_internal.resetPasswordInternal, {
      userId: user._id,
      resetRequestId: resetRequest._id,
      passwordHash,
    })

    return { success: true }
  },
})

// --- Standard Queries & Mutations ---

export const getCurrentUser = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.sessionToken) {
      return null
    }

    const session = await ctx.db
      .query('sessions')
      .withIndex('by_session_token', (q) => q.eq('sessionToken', args.sessionToken as string))
      .first()

    if (!session || session.expiresAt < Date.now()) {
      return null
    }

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
      return { success: true }
    }

    const token = crypto.randomUUID()
    const expiresAt = Date.now() + 60 * 60 * 1000

    await ctx.db.insert('passwordResets', {
      userId: user._id,
      token,
      expiresAt,
      used: false,
    })

    console.log(`Password reset token for ${user.email}: ${token}`)

    return { success: true }
  },
})

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