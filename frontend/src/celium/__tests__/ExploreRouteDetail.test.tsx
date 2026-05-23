import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ExploreRouteDetail from '@/celium/ExploreRouteDetail'

const authMocks = vi.hoisted(() => ({
  getAccessToken: vi.fn(async () => 'test-token'),
}))

vi.mock('@/celium/auth', async () => {
  const actual = await vi.importActual<typeof import('@/celium/auth')>('@/celium/auth')
  return {
    ...actual,
    useAuth: () => ({
      isAuthenticated: true,
      isLoading: false,
      user: { name: 'Test User' },
      login: async () => undefined,
      logout: () => undefined,
      getAccessToken: authMocks.getAccessToken,
      hasRole: () => false,
      hasPermission: () => false,
    }),
  }
})

const mockRoute = {
  id: 'route-1',
  name: 'Alpine Loop',
  summary: 'Loop summary',
  description: 'Detailed description.',
  activityType: 'Hiking',
  climbingStyle: null,
  climbingGrade: null,
  difficulty: 'Easy',
  distanceMiles: 4,
  elevationGainFt: 500,
  elevationLossFt: null,
  maxElevationFt: null,
  minElevationFt: null,
  estimatedTimeMinutes: null,
  loopType: 'Loop',
  routeGeometry: '',
  startLatitude: 46.7,
  startLongitude: -121.7,
  endLatitude: 46.7,
  endLongitude: -121.7,
  landscapeTypeId: 'land',
  regionId: 'region',
  status: 'Published',
  progress: 'Todo',
  publishedAt: null,
}

vi.mock('@/features/api/celiumRoutes', () => ({
  canManageRoutes: vi.fn(() => Promise.resolve(true)),
  getRoute: vi.fn(() => Promise.resolve(mockRoute)),
  updateRoute: vi.fn(() => Promise.resolve(mockRoute)),
  deleteRoute: vi.fn(() => Promise.resolve()),
}))

describe('ExploreRouteDetail', () => {
  it('loads route details and submits updates', async () => {
    const { updateRoute } = await import('@/features/api/celiumRoutes')
    render(
      <MemoryRouter initialEntries={['/explore/routes/route-1']}>
        <Routes>
          <Route path="/explore/routes/:routeId" element={<ExploreRouteDetail />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByRole('heading', { name: 'Alpine Loop' })).toBeInTheDocument()
    expect(screen.getByText('Loop summary')).toBeInTheDocument()
    expect(screen.getByText('Route details')).toBeInTheDocument()
    expect(screen.queryByText('Climbing style')).not.toBeInTheDocument()
    expect(screen.queryByDisplayValue('Alpine Loop')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete route' })).not.toBeInTheDocument()

    fireEvent.click(await screen.findByRole('button', { name: 'Edit summary' }))
    const summaryInput = screen.getByDisplayValue('Loop summary')
    fireEvent.change(summaryInput, { target: { value: 'Updated loop summary' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save summary' }))

    await waitFor(() => {
      expect(updateRoute).toHaveBeenCalledWith(
        'route-1',
        expect.objectContaining({ summary: 'Updated loop summary' }),
        'test-token'
      )
    })
  })
})
