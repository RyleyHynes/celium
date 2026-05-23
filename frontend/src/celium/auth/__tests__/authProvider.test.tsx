import { render, screen } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/celium/auth'

const AuthConsumer = () => {
  const { isAuthenticated } = useAuth()
  return <span>{isAuthenticated ? 'Authed' : 'Guest'}</span>
}

describe('AuthProvider', () => {
  it('renders with fallback context when not configured', () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    expect(screen.getByText('Guest')).toBeInTheDocument()
  })
})
