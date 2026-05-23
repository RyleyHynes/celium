import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import CeliumLayout from '@/celium/CeliumLayout'
import { RequireAuth } from '@/celium/auth'
import Explore from '@/celium/Explore'
import ExploreRouteDetail from '@/celium/ExploreRouteDetail'
import Plan from '@/celium/Plan'
import PlanTripDetail from '@/celium/PlanTripDetail'

const App = () => {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])

  return (
    <>
      <a href="#content" className="a11y-skiplink">Skip to content</a>
      <Routes location={location}>
        <Route
          element={(
            <RequireAuth>
              <CeliumLayout />
            </RequireAuth>
          )}
          path="/"
        >
          <Route element={<Navigate replace to="/explore" />} index />
          <Route element={<Explore />} path="explore" />
          <Route element={<ExploreRouteDetail />} path="explore/routes/:routeId" />
          <Route element={<Plan />} path="plan" />
          <Route element={<PlanTripDetail />} path="plan/trips/:tripId" />
        </Route>
        <Route element={<Navigate replace to="/explore" />} path="*" />
      </Routes>
    </>
  )
}

export default App
