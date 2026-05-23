import { type ReactNode, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Button from '@/components/buttons/Button'
import { authEnabled } from './authConfig'
import { useAuth } from './AuthContext'

type RequireAuthProps = {
  children: ReactNode
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const { getAccessToken, isAuthenticated, isLoading, login, logout } = useAuth()
  const location = useLocation()
  const loginStartedRef = useRef(false)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [tokenReady, setTokenReady] = useState(false)

  useEffect(() => {
    let active = true

    const verifyToken = async () => {
      if (!authEnabled || !isAuthenticated) {
        if (!active) return
        setTokenError(null)
        setTokenReady(false)
        return
      }

      setTokenError(null)
      setTokenReady(false)

      try {
        await getAccessToken()
        if (!active) return
        setTokenReady(true)
      } catch (error) {
        if (!active) return
        setTokenError(error instanceof Error ? error.message : 'Unable to acquire access token.')
      }
    }

    void verifyToken()

    return () => {
      active = false
    }
  }, [getAccessToken, isAuthenticated])

  useEffect(() => {
    if (!authEnabled || isAuthenticated || isLoading || loginStartedRef.current) {
      return
    }

    loginStartedRef.current = true
    void login({ returnTo: location.pathname, mode: 'signin' })
  }, [isAuthenticated, isLoading, location.pathname, login])

  if (!authEnabled) {
    return (
      <div className="p-6 text-sm text-rose-600 grid gap-2">
        <span>Authentication is not configured.</span>
        <span>Set `VITE_AUTH0_DOMAIN` and `VITE_AUTH0_CLIENT_ID` to launch Celium.</span>
      </div>
    )
  }
  if (isLoading) return <div className="p-6 text-sm text-slate-500">Checking session...</div>
  if (!isAuthenticated) {
    return <div className="p-6 text-sm text-slate-500">Redirecting to sign in...</div>
  }
  if (!tokenReady && !tokenError) return <div className="p-6 text-sm text-slate-500">Preparing secure session...</div>
  if (tokenError) {
    return (
      <section className="min-h-[calc(100vh-8rem)] grid place-items-center px-4 py-10">
        <div className="w-full max-w-xl rounded-3xl border border-rose-200/70 bg-white/90 dark:bg-slate-950/70 dark:border-rose-900/40 p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-rose-600">Authentication Error</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Session could not be verified
          </h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Auth0 sign-in succeeded, but this app could not get an API access token.
          </p>
          <p className="mt-2 text-xs text-slate-500 break-words">{tokenError}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              variant="primary"
              onClick={() => void login({ mode: 'signin', returnTo: location.pathname })}
            >
              Sign in again
            </Button>
            <Button
              variant="ghost"
              onClick={logout}
            >
              Sign out
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return <>{children}</>
}

export default RequireAuth
