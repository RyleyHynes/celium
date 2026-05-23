import { useCallback, useContext, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '@/components/buttons/Button'
import SectionHeader from '@/components/layout/SectionHeader'
import { AuthContext } from '@/celium/auth/AuthContext'
import {
  ActivityDetailPanel,
  PlanStatusBadge,
  PreparationPanel,
  RouteForecast,
  TimelineBoard,
} from '@/celium/components/plan'
import usePlanWorkspace from '@/celium/hooks/usePlanWorkspace'
import { getPlanDateLabel } from '@/celium/types/plan'

const PlanTripDetail = () => {
  const { tripId } = useParams()
  const auth = useContext(AuthContext)
  const getAccessToken = useCallback(() => auth?.getAccessToken() ?? Promise.resolve(null), [auth])
  const {
    createChecklistItem,
    handleMoveActivity,
    handleReorderDays,
    isLoading,
    selectedActivity,
    selectedDay,
    selectedPlan,
    setSelectedActivityId,
    setSelectedDayId,
    updateChecklistItem,
    updateChecklistStatus,
  } = usePlanWorkspace({
    getAccessToken,
    planId: tripId,
  })

  const selectedRouteActivity = useMemo(() => {
    if (!selectedPlan) return null
    if (selectedActivity?.type === 'Route') return selectedActivity
    return selectedPlan.days
      .slice()
      .sort((left, right) => left.order - right.order)
      .flatMap((day) => day.activities.slice().sort((left, right) => left.order - right.order))
      .find((activity) => activity.type === 'Route') ?? null
  }, [selectedActivity, selectedPlan])

  if (isLoading) {
    return (
      <section className="grid gap-4">
        <Link to="/plan" className="text-xs text-slate-500 hover:text-emerald-600">
          ← Back to Plan
        </Link>
        <p className="text-sm text-slate-500">Loading planning workspace...</p>
      </section>
    )
  }

  if (!selectedPlan) {
    return (
      <section className="grid gap-4">
        <Link to="/plan" className="text-xs text-slate-500 hover:text-emerald-600">
          ← Back to Plan
        </Link>
        <p className="text-sm text-slate-500">Plan not found.</p>
      </section>
    )
  }

  return (
    <section className="grid gap-6">
      <Link to="/plan" className="text-xs text-slate-500 hover:text-emerald-600">
        ← Back to Plan
      </Link>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)] lg:items-center">
        <SectionHeader
          title={selectedPlan.name}
          subtitle="Trip workspace centered on timeline and preparation."
        />
        {selectedRouteActivity ? (
          <RouteForecast
            routeLabel={selectedRouteActivity.title}
            seedKey={selectedRouteActivity.routeId ?? selectedRouteActivity.id}
          />
        ) : (
          <p className="rounded-lg bg-white/70 p-2.5 text-sm text-slate-500 shadow-soft dark:bg-white/5">
            Add a route activity to see critical forecast signals.
          </p>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)] xl:items-start">
        <aside className="card p-5 grid gap-4 xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Timeline</p>
              <p className="mt-1 text-sm text-slate-500">
                {getPlanDateLabel(selectedPlan.metadata.startDate, selectedPlan.metadata.endDate)}
              </p>
            </div>
            <PlanStatusBadge status={selectedPlan.status} />
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Trip days</p>
              <Button type="button" variant="text">Add day</Button>
            </div>
            <TimelineBoard
              onMoveActivity={(sourceDayId, sourceIndex, targetDayId, targetIndex) => {
                void handleMoveActivity(sourceDayId, sourceIndex, targetDayId, targetIndex)
              }}
              onReorderDay={(fromIndex, toIndex) => {
                void handleReorderDays(fromIndex, toIndex)
              }}
              onSelectActivity={setSelectedActivityId}
              onSelectDay={setSelectedDayId}
              plan={selectedPlan}
            />
          </div>
        </aside>

        <div className="grid gap-6">
          <PreparationPanel
            plan={selectedPlan}
            onCreateTask={(label) => {
              void createChecklistItem(label)
            }}
            onSetStatus={(itemId, status) => {
              void updateChecklistStatus(itemId, status)
            }}
            onUpdateTask={(itemId, updates) => {
              void updateChecklistItem(itemId, updates)
            }}
          />

          <ActivityDetailPanel activity={selectedActivity} day={selectedDay} />
        </div>
      </div>
    </section>
  )
}

export default PlanTripDetail
