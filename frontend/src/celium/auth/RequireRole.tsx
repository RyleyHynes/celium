import { type ReactNode } from 'react'
import { useAuth } from './AuthContext'

type RequireRoleProps = {
  role: string
  fallback?: ReactNode
  children: ReactNode
}

const RequireRole = ({ role, fallback = null, children }: RequireRoleProps) => {
  const { hasRole } = useAuth()
  if (!hasRole(role)) return <>{fallback}</>
  return <>{children}</>
}

export default RequireRole
