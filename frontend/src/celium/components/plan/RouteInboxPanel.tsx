import Button from '@/components/buttons/Button'
import { Link } from 'react-router-dom'
import type { RouteModel } from '@/features/api/celiumRoutes'

type RouteInboxPanelProps = {
  planTargets: Record<string, string>
  routes: RouteModel[]
}

const RouteInboxPanel = ({
  planTargets,
  routes,
}: RouteInboxPanelProps) => {
  return (
    <section className="card p-5 grid gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Route Inbox</p>
        <h3 className="mt-1 text-lg font-semibold">Todo routes from Explore</h3>
        <p className="text-sm text-slate-500">Mark a route as Todo in Explore and it appears here for commitment planning.</p>
      </div>
      <div className="grid gap-3">
        {routes.length === 0 ? (
          <p className="text-sm text-slate-500">No Todo routes yet.</p>
        ) : routes.map((route) => (
          <div key={route.id} className="rounded-xl border border-slate-200/70 dark:border-slate-800 p-4 grid gap-3">
            <div>
              <p className="font-semibold">{route.name}</p>
              <p className="text-xs text-slate-500 mt-1">{route.distanceMiles} mi · {route.elevationGainFt} ft · {route.difficulty}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {planTargets[route.id] ? (
                <Link to={`/plan/trips/${planTargets[route.id]}`}>
                  <Button type="button" variant="primary">
                    Open planning workspace
                  </Button>
                </Link>
              ) : (
                <Button disabled type="button" variant="primary">
                  Planning workspace unavailable
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default RouteInboxPanel
