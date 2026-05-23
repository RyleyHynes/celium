import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RequireAuth from '@/celium/auth/RequireAuth'
import RequireRole from '@/celium/auth/RequireRole'
import { AuthContext, type AuthContextValue } from '@/celium/auth/AuthContext'

const mockAuth: AuthContextValue = {
  isAuthenticated: true,
  isLoading: false,
  user: { name: 'Tester' },
  login: async () => undefined,
  logout: () => undefined,
  getAccessToken: async () => 'token',
  hasRole: (role) => role === 'Admin',
  hasPermission: () => false,
}

describe('RequireAuth and RequireRole', () => {
  it('renders children when authenticated', async () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuth}>
          <RequireAuth>
            <div>Protected</div>
          </RequireAuth>
        </AuthContext.Provider>
      </MemoryRouter>
    )

    expect(await screen.findByText('Protected')).toBeInTheDocument()
  })

  it('hides content when role is missing', () => {
    render(
      <AuthContext.Provider value={mockAuth}>
        <RequireRole role="Writer" fallback={<span>Nope</span>}>
          <span>Secret</span>
        </RequireRole>
      </AuthContext.Provider>
    )

    expect(screen.getByText('Nope')).toBeInTheDocument()
  })
})
