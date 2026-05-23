import { type ReactNode, useEffect } from 'react'
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react'
import { authConfig, authEnabled } from './authConfig'
import { AuthContext } from './AuthContext'

type AuthProviderProps = {
  children: ReactNode
}

const basePath = (() => {
  const raw = import.meta.env.BASE_URL ?? '/'
  return raw.endsWith('/') ? raw.slice(0, -1) : raw
})()

const stripBasePath = (path: string) => {
  if (!path.startsWith('/')) return `/${path}`
  if (basePath && path.startsWith(`${basePath}/`)) return path.slice(basePath.length)
  if (basePath && path === basePath) return '/'
  return path
}

const normalizeReturnTo = (returnTo?: string) => {
  const candidate = stripBasePath(returnTo ?? '/explore')
  return candidate === '/' || candidate.startsWith('/explore') || candidate.startsWith('/plan')
    ? candidate
    : '/explore'
}

const FallbackProvider = ({ children }: AuthProviderProps) => (
  <AuthContext.Provider value={{
    isAuthenticated: false,
    isLoading: false,
    user: undefined,
    login: async () => undefined,
    logout: () => undefined,
    getAccessToken: async () => null,
    hasRole: () => false,
    hasPermission: () => false,
  }}>
    {children}
  </AuthContext.Provider>
)

const AuthBridge = ({ children }: AuthProviderProps) => {
  const {
    isAuthenticated,
    isLoading,
    user,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
  } = useAuth0()

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      user,
      login: async (options) => {
        const currentPath = stripBasePath(window.location.pathname)
        await loginWithRedirect({
          appState: { returnTo: normalizeReturnTo(options?.returnTo ?? currentPath) },
          authorizationParams: options?.mode === 'signup'
            ? { screen_hint: 'signup' }
            : undefined,
        })
      },
      logout: () => {
        // Clear local session markers and Auth0 cache on sign-out
        const sessionMarker = 'celium-session-active'
        sessionStorage.removeItem(sessionMarker)
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('@@auth0spajs@@')) {
            localStorage.removeItem(key)
          }
        })

        const logoutReturnTo = `${window.location.origin}${basePath === '/' ? '' : basePath}`

        auth0Logout({
          logoutParams: {
            returnTo: logoutReturnTo,
          },
        })
      },
      getAccessToken: async () => (
        isAuthenticated ? await getAccessTokenSilently() : null
      ),
      hasRole: (role: string) => {
        const roles = (user?.[authConfig.roleClaim] ?? user?.roles ?? []) as string[]
        return roles.includes(role)
      },
      hasPermission: (permission: string) => {
        const permissions = (user?.[authConfig.permissionsClaim] ?? []) as string[]
        return permissions.includes(permission)
      },
    }}>
      {children}
    </AuthContext.Provider>
  )
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  // Keep auth state in localStorage (Auth0 SDK supports it). Use a session marker to clear on a fresh tab/window open.
  useEffect(() => {
    if (!authEnabled) {
      return
    }

    const sessionMarker = 'celium-session-active'
    const isCallback = new URLSearchParams(window.location.search).has('code')
    const hadSession = sessionStorage.getItem(sessionMarker) === '1'

    if (!hadSession && !isCallback) {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('@@auth0spajs@@')) {
          localStorage.removeItem(key)
        }
      })
    }

    sessionStorage.setItem(sessionMarker, '1')
  }, [])

  if (!authEnabled) {
    return <FallbackProvider>{children}</FallbackProvider>
  }

  const onRedirectCallback = (appState?: { returnTo?: string }) => {
    const targetPath = normalizeReturnTo(appState?.returnTo)
    window.location.replace(`${window.location.origin}${basePath}${targetPath}`)
  }

  return (
    <Auth0Provider
      domain={authConfig.domain}
      clientId={authConfig.clientId}
      onRedirectCallback={onRedirectCallback}
      authorizationParams={{
        redirect_uri: `${window.location.origin}${import.meta.env.BASE_URL}`,
        audience: authConfig.audience || undefined,
      }}
      cacheLocation="localstorage"
      useRefreshTokens
    >
      <AuthBridge>{children}</AuthBridge>
    </Auth0Provider>
  )
}

export default AuthProvider
