import { render, screen, fireEvent } from '@testing-library/react'
import type { ReactNode } from 'react'
import { RouteMap } from '../media'

const fitBounds = vi.fn()
const flyTo = vi.fn()

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="map">{children}</div>
  ),
  Marker: ({
    children,
    eventHandlers,
  }: {
    children: ReactNode
    eventHandlers?: { click?: () => void }
  }) => (
    <button type="button" onClick={() => eventHandlers?.click?.()}>
      {children}
    </button>
  ),
  Popup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TileLayer: () => <div data-testid="tile" />,
  useMap: () => ({ fitBounds, flyTo }),
}))

vi.mock('leaflet', () => ({
  default: {
    divIcon: () => ({}),
    latLngBounds: () => ({}),
  },
  divIcon: () => ({}),
  latLngBounds: () => ({}),
}))

describe('RouteMap', () => {
  it('renders markers and calls click handler', () => {
    const onMarkerClick = vi.fn()
    render(
      <RouteMap
        routes={[
          {
            id: 'route-1',
            name: 'Alpine Loop',
            summary: 'Loop',
            activityType: 'Hiking',
            difficulty: 'Easy',
            distanceMiles: 4,
            elevationGainFt: 500,
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
          },
        ]}
        userLocation={[46.7, -121.7]}
        onMarkerClick={onMarkerClick}
        selectedRouteId="route-1"
      />
    )

    fireEvent.click(screen.getAllByRole('button')[0])
    expect(onMarkerClick).toHaveBeenCalledWith('route-1')
    expect(fitBounds).toHaveBeenCalled()
    expect(flyTo).toHaveBeenCalled()
  })
})
