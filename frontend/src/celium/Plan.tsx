import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '@/components/buttons/Button'
import SectionHeader from '@/components/layout/SectionHeader'
import { AuthContext } from '@/celium/auth/AuthContext'
import {
  PlanListPane,
  PlanStatusBadge,
} from '@/celium/components/plan'
import usePlanWorkspace from '@/celium/hooks/usePlanWorkspace'
import { getRoutePhotos } from '@/utils/routePhotos'

const Plan = () => {
  const [planFilter, setPlanFilter] = useState<'todo' | 'completed'>('todo')
  const auth = useContext(AuthContext)
  const getAccessToken = useCallback(() => auth?.getAccessToken() ?? Promise.resolve(null), [auth])
  const {
    isLoading,
    planSummaries,
    routeProgressByPlanId,
    selectedPlan,
    selectedPlanId,
    setSelectedPlan,
  } = usePlanWorkspace({ getAccessToken })

  const todoPlanIds = useMemo(
    () => new Set(
      Object.entries(routeProgressByPlanId)
        .filter(([, progress]) => progress === 'Todo')
        .map(([planId]) => planId)
    ),
    [routeProgressByPlanId]
  )

  const completedPlanIds = useMemo(
    () => new Set(
      Object.entries(routeProgressByPlanId)
        .filter(([, progress]) => progress === 'Completed')
        .map(([planId]) => planId)
    ),
    [routeProgressByPlanId]
  )

  const visiblePlanSummaries = useMemo(() => {
    if (planFilter === 'completed') {
      return planSummaries.filter((summary) => completedPlanIds.has(summary.id))
    }
    return planSummaries.filter((summary) => todoPlanIds.has(summary.id))
  }, [completedPlanIds, planFilter, planSummaries, todoPlanIds])

  const todoCount = todoPlanIds.size
  const completedCount = completedPlanIds.size

  const selectedPlanStats = useMemo(() => {
    if (!selectedPlan) return null
    return [
      { label: 'Days', value: selectedPlan.days.length },
      { label: 'To Do', value: selectedPlan.checklistItems.filter((item) => item.status === 'NotStarted').length },
      { label: 'In Progress', value: selectedPlan.checklistItems.filter((item) => item.status === 'InProgress').length },
      { label: 'Completed', value: selectedPlan.checklistItems.filter((item) => item.status === 'Done').length },
    ]
  }, [selectedPlan])

  const selectedPlanImage = useMemo(() => {
    const routeActivity = selectedPlan?.days
      .flatMap((day) => day.activities)
      .find((activity) => activity.type === 'Route')
    if (!routeActivity) return null
    return getRoutePhotos(routeActivity.title)[0] ?? null
  }, [selectedPlan])

  useEffect(() => {
    if (visiblePlanSummaries.some((summary) => summary.id === selectedPlanId)) return
    if (!visiblePlanSummaries[0]) return
    setSelectedPlan(visiblePlanSummaries[0].id)
  }, [selectedPlanId, setSelectedPlan, visiblePlanSummaries])

  return (
    <section className="grid gap-6">
      <SectionHeader
        eyebrow="Plan"
        title="Build a trip that stacks the odds in your favor."
        subtitle="A timeline of intent and preparation. Move from idea to commitment."
      />

      <div className="grid lg:grid-cols-[minmax(240px,1.1fr)_minmax(0,2fr)] gap-6 items-start">
        <PlanListPane
          completedCount={completedCount}
          planFilter={planFilter}
          plans={visiblePlanSummaries}
          selectedPlanId={selectedPlanId}
          setPlanFilter={setPlanFilter}
          todoCount={todoCount}
          onSelectPlan={setSelectedPlan}
        />

        <div className="grid gap-5">
          <section className="card p-5 grid gap-4">
            {isLoading ? (
              <p className="text-sm text-slate-500">Loading plans...</p>
            ) : null}
            {!isLoading && !selectedPlan ? (
              <p className="text-sm text-slate-500">No plan selected yet.</p>
            ) : null}
            {selectedPlan ? (
              <>
                {selectedPlanImage ? (
                  <img
                    alt={`${selectedPlan.name} route preview`}
                    className="h-56 w-full rounded-xl object-cover"
                    loading="lazy"
                    src={selectedPlanImage}
                  />
                ) : null}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Selected Plan</p>
                    <h2 className="text-2xl font-semibold mt-1">{selectedPlan.name}</h2>
                  </div>
                  <PlanStatusBadge status={selectedPlan.status} />
                </div>
                {selectedPlanStats ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {selectedPlanStats.map((stat) => (
                      <div key={stat.label} className="rounded-xl border border-slate-200/70 px-3 py-2 dark:border-slate-800">
                        <p className="text-xs text-slate-500">{stat.label}</p>
                        <p className="mt-1 text-lg font-semibold">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
                <Link to={`/plan/trips/${selectedPlan.id}`}>
                  <Button type="button" variant="primary">Open planning workspace</Button>
                </Link>
              </>
            ) : null}
          </section>
        </div>

      </div>
    </section>
  )
}

export default Plan
