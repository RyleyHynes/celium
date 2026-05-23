import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext, type AuthContextValue } from '@/celium/auth/AuthContext'
import App from '../App'

const renderApp = (initialEntry: string) => {
  const login = vi.fn(async () => undefined)
  const mockAuth: AuthContextValue = {
    isAuthenticated: false,
    isLoading: false,
    user: undefined,
    login,
    logout: () => undefined,
    getAccessToken: async () => null,
    hasRole: () => false,
    hasPermission: () => false,
  }

  render(
    <AuthContext.Provider value={mockAuth}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <App />
      </MemoryRouter>
    </AuthContext.Provider>
  )

  return { login }
}

describe('App shell', () => {
  beforeEach(() => {
    vi.stubGlobal('scrollTo', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('starts at the Celium authentication gate', async () => {
    const { login } = renderApp('/')

    expect(screen.getByText('Redirecting to sign in...')).toBeInTheDocument()
    await waitFor(() => expect(login).toHaveBeenCalledWith({ returnTo: '/', mode: 'signin' }))
  })

  it('exposes accessibility skip link', () => {
    renderApp('/unknown')

    expect(screen.getByRole('link', { name: /skip to content/i })).toHaveAttribute('href', '#content')
  })

  it('redirects unknown routes into Celium', async () => {
    const { login } = renderApp('/unknown')

    expect(screen.getByText('Redirecting to sign in...')).toBeInTheDocument()
    await waitFor(() => expect(login).toHaveBeenCalledWith({ returnTo: '/explore', mode: 'signin' }))
  })
})
