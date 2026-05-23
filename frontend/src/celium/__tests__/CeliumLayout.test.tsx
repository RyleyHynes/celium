import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import CeliumLayout from '@/celium/CeliumLayout'
import { AuthProvider } from '@/celium/auth'

describe('CeliumLayout', () => {
  it('renders nav and toggles theme', () => {
    document.documentElement.classList.remove('dark')
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/explore']}>
          <Routes>
            <Route path="/*" element={<CeliumLayout />}>
              <Route path="explore" element={<div>Explore page</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    )

    expect(screen.getByText('Celium')).toBeInTheDocument()
    const toggle = screen.getByLabelText('Toggle dark mode')
    fireEvent.click(toggle)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
