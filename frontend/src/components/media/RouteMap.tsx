import { useEffect } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import type { RouteModel } from '@/features/api/celiumRoutes'

type RouteMapProps = {
  routes: RouteModel[]
  selectedRouteId?: string | null
  userLocation?: [number, number] | null
  onMarkerClick?: (routeId: string) => void
}

const routeIcon = L.divIcon({
  className: 'celium-route-marker',
  html: '<span></span>',
  iconAnchor: [8, 8],
  iconSize: [16, 16],
})

const BoundsController = ({ routes, selectedRouteId, userLocation }: Omit<RouteMapProps, 'onMarkerClick'>) => {
  const map = useMap()

  useEffect(() => {
    const routePoints = routes.map((route) => [route.startLatitude, route.startLongitude] as [number, number])
    const points = userLocation ? [...routePoints, userLocation] : routePoints

    if (points.length > 0) {
      map.fitBounds(L.latLngBounds(points), { padding: [24, 24] })
    }
  }, [map, routes, userLocation])

  useEffect(() => {
    const selectedRoute = routes.find((route) => route.id === selectedRouteId)
    if (selectedRoute) {
      map.flyTo([selectedRoute.startLatitude, selectedRoute.startLongitude], 11)
    }
  }, [map, routes, selectedRouteId])

  return null
}

const RouteMap = ({ onMarkerClick, routes, selectedRouteId = null, userLocation = null }: RouteMapProps) => {
  const center = userLocation
    ?? (routes[0] ? [routes[0].startLatitude, routes[0].startLongitude] as [number, number] : [39.5, -98.35] as [number, number])

  return (
    <MapContainer
      center={center}
      className="h-full min-h-[280px] w-full"
      scrollWheelZoom={false}
      zoom={routes.length > 0 ? 8 : 4}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <BoundsController
        routes={routes}
        selectedRouteId={selectedRouteId}
        userLocation={userLocation}
      />
      {routes.map((route) => (
        <Marker
          eventHandlers={{
            click: () => onMarkerClick?.(route.id),
          }}
          icon={routeIcon}
          key={route.id}
          position={[route.startLatitude, route.startLongitude]}
        >
          <Popup>
            <div className="grid gap-1 text-sm">
              <strong>{route.name}</strong>
              <span>{route.difficulty} · {route.distanceMiles} mi</span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default RouteMap
