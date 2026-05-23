import { createContext, useContext } from 'react'

type AuthUser = {
  name?: string
  email?: string
  picture?: string
  [key: string]: unknown
}

export type AuthContextValue = {
  isAuthenticated: boolean
  isLoading: boolean
  user?: AuthUser
  login: (options?: { returnTo?: string, mode?: 'signin' | 'signup' }) => Promise<void>
  logout: () => void
  getAccessToken: () => Promise<string | null>
  hasRole: (role: string) => boolean
  hasPermission: (permission: string) => boolean
}

// Backward-compatible alias for existing imports.
export type AuthContextType = AuthContextValue

export const AuthContext = createContext<AuthContextValue | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
