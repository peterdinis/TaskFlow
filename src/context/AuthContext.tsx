import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from '@tanstack/react-router'
import Cookies from 'js-cookie'
import {
  register,
  login,
  getCurrentUser,
  logoutUser,
  updateProfile,
} from '../../convex/auth'

interface User {
  id: string
  email: string
  name: string
  role: string
  createdAt: number
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: {
    name: string
    email: string
    currentPassword?: string
    newPassword?: string
  }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Načítať používateľa pri štarte
  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const sessionToken = Cookies.get('session_token')
      
      if (!sessionToken) {
        setIsLoading(false)
        return
      }

      const result = await getCurrentUser({
        headers: { 'x-session-token': sessionToken },
      })

      if (result.user) {
        setUser(result.user)
      } else {
        // Session expirovala
        Cookies.remove('session_token')
      }
    } catch (error) {
      console.error('Error loading user:', error)
      Cookies.remove('session_token')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true)
    try {
      const result = await loginUser({ 
        email, 
        password, 
        rememberMe 
      })

      if (result.success && result.sessionToken) {
        // Ulož session token
        Cookies.set('session_token', result.sessionToken, {
          expires: rememberMe ? 30 : 1,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        })

        setUser(result.user)
        await router.invalidate() // Refresh router state
      }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      const result = await register({ name, email, password })

      if (result.success && result.sessionToken) {
        Cookies.set('session_token', result.sessionToken, {
          expires: 30,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        })

        setUser(result.user)
        await router.invalidate()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    const sessionToken = Cookies.get('session_token')
    
    if (sessionToken) {
      await logoutUser({
        headers: { 'x-session-token': sessionToken },
      })
    }

    Cookies.remove('session_token')
    setUser(null)
    await router.invalidate()
  }

  const updateProfileFn = async (data: {
    name: string
    email: string
    currentPassword?: string
    newPassword?: string
  }) => {
    const sessionToken = Cookies.get('session_token')
    
    if (!sessionToken) {
      throw new Error('Nie ste prihlásený')
    }

    const result = await updateProfile({
      ...data,
    }, {
      headers: { 'x-session-token': sessionToken },
    })

    if (result.success) {
      // Refresh user data
      await loadUser()
    }

    return result
  }

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateProfile: updateProfileFn,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}