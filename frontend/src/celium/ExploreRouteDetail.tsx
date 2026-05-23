import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Pencil } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import {
  getRoute,
  updateRoute,
  type ActivityType,
  type ClimbingStyle,
  type Difficulty,
  type LoopType,
  type RouteProgress,
  type RouteStatus,
  type RouteModel,
} from '@/features/api/celiumRoutes'
import Button from '@/components/buttons/Button'
import EmptyState from '@/components/data-display/EmptyState'
import { useAuth } from '@/celium/auth'
import useRoutePermissions from '@/celium/hooks/useRoutePermissions'
import { getRoutePhotos } from '@/utils/routePhotos'
import { PhotoCarousel } from '@/components'

type RouteFormState = {
  name: string
  summary: string
  description: string
  activityType: ActivityType
  climbingStyle: ClimbingStyle | ''
  climbingGrade: string
  difficulty: Difficulty
  distanceMiles: string
  elevationGainFt: string
  elevationLossFt: string
  maxElevationFt: string
  minElevationFt: string
  estimatedTimeMinutes: string
  loopType: LoopType
  startLatitude: string
  startLongitude: string
  endLatitude: string
  endLongitude: string
  status: RouteStatus
  progress: RouteProgress
  publishedAt: string
}

type ReadOnlyField = {
  label: string
  value: string
}

type EditableSection = 'details' | 'summary'

const emptyValue = '--'

const formatOptional = (value?: number | string | null) => (
  value === null || value === undefined || value === '' ? emptyValue : String(value)
)

const ReadOnlyField = ({ label, value }: ReadOnlyField) => (
  <div className="min-w-0 rounded-xl border border-slate-200/70 px-3 py-2 dark:border-slate-800">
    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
    <p className="mt-1 break-words text-sm font-medium text-slate-800 dark:text-slate-100">{value || emptyValue}</p>
  </div>
)

const fieldClassName = 'rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm dark:border-slate-800 dark:bg-white/5'

const fieldOptions = {
  activityType: ['Hiking', 'TrailRunning', 'RockClimbing'] satisfies ActivityType[],
  climbingStyle: ['', 'Sport', 'Trad', 'Bouldering', 'Ice'] satisfies (ClimbingStyle | '')[],
  difficulty: ['Easy', 'Moderate', 'Hard', 'Expert'] satisfies Difficulty[],
  loopType: ['Loop', 'OutAndBack', 'PointToPoint'] satisfies LoopType[],
  progress: ['Todo', 'Completed'] satisfies RouteProgress[],
  status: ['Published', 'Archived'] satisfies RouteStatus[],
}

type EditableFieldProps = {
  children: ReactNode
  label: string
}

const EditableField = ({ children, label }: EditableFieldProps) => (
  <label className="grid min-w-0 gap-1">
    <span className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</span>
    {children}
  </label>
)

const ExploreRouteDetail = () => {
  const { routeId } = useParams()
  const [route, setRoute] = useState<RouteModel | null>(null)
  const [draft, setDraft] = useState<RouteFormState | null>(null)
  const [editingSection, setEditingSection] = useState<EditableSection | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated, login, getAccessToken } = useAuth()
  const { canManage } = useRoutePermissions({ getAccessToken, isAuthenticated })
  const photos = useMemo(() => (route ? getRoutePhotos(route.name) : []), [route])

  const routeStats = useMemo<ReadOnlyField[]>(() => {
    if (!route) return []
    return [
      { label: 'Distance', value: `${route.distanceMiles} mi` },
      { label: 'Elevation gain', value: `${route.elevationGainFt} ft` },
      { label: 'Difficulty', value: route.difficulty },
      { label: 'Route type', value: route.loopType },
      { label: 'Estimated time', value: route.estimatedTimeMinutes ? `${route.estimatedTimeMinutes} min` : emptyValue },
    ]
  }, [route])

  const readOnlyFields = useMemo<ReadOnlyField[]>(() => {
    if (!route) return []
    const fields = [
      { label: 'Activity type', value: route.activityType },
      { label: 'Difficulty', value: route.difficulty },
      { label: 'Distance miles', value: `${route.distanceMiles}` },
      { label: 'Elevation gain ft', value: `${route.elevationGainFt}` },
      { label: 'Elevation loss ft', value: formatOptional(route.elevationLossFt) },
      { label: 'Max elevation ft', value: formatOptional(route.maxElevationFt) },
      { label: 'Min elevation ft', value: formatOptional(route.minElevationFt) },
      { label: 'Estimated time minutes', value: formatOptional(route.estimatedTimeMinutes) },
      { label: 'Loop type', value: route.loopType },
      { label: 'Start latitude', value: `${route.startLatitude}` },
      { label: 'Start longitude', value: `${route.startLongitude}` },
      { label: 'End latitude', value: `${route.endLatitude}` },
      { label: 'End longitude', value: `${route.endLongitude}` },
      { label: 'Status', value: route.status },
      { label: 'Progress', value: route.progress },
      { label: 'Published at', value: formatOptional(route.publishedAt) },
      { label: 'Route geometry', value: formatOptional(route.routeGeometry) },
    ]

    if (route.activityType === 'RockClimbing') {
      fields.splice(1, 0,
        { label: 'Climbing style', value: formatOptional(route.climbingStyle) },
        { label: 'Climbing grade', value: formatOptional(route.climbingGrade) }
      )
    }

    return fields
  }, [route])

  const loadRoute = useCallback(async () => {
    if (!routeId) return
    setIsLoading(true)
    setError(null)
    try {
      const accessToken = await getAccessToken()
      const data = await getRoute(routeId, accessToken ?? undefined)
      setRoute(data)
      setDraft({
        name: data.name,
        summary: data.summary,
        description: data.description ?? '',
        activityType: data.activityType,
        climbingStyle: data.climbingStyle ?? '',
        climbingGrade: data.climbingGrade ?? '',
        difficulty: data.difficulty,
        distanceMiles: data.distanceMiles.toString(),
        elevationGainFt: data.elevationGainFt.toString(),
        elevationLossFt: data.elevationLossFt?.toString() ?? '',
        maxElevationFt: data.maxElevationFt?.toString() ?? '',
        minElevationFt: data.minElevationFt?.toString() ?? '',
        estimatedTimeMinutes: data.estimatedTimeMinutes?.toString() ?? '',
        loopType: data.loopType,
        startLatitude: data.startLatitude.toString(),
        startLongitude: data.startLongitude.toString(),
        endLatitude: data.endLatitude.toString(),
        endLongitude: data.endLongitude.toString(),
        status: data.status,
        progress: data.progress,
        publishedAt: data.publishedAt ?? '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load route.')
    } finally {
      setIsLoading(false)
    }
  }, [getAccessToken, routeId])

  useEffect(() => {
    loadRoute()
  }, [loadRoute])

  const handleChange = (field: keyof RouteFormState, value: string) => {
    setDraft(current => (current ? { ...current, [field]: value } : current))
  }

  const handleUpdate = async () => {
    if (!routeId || !draft) return
    setError(null)

    // Validate required fields
    if (!draft.name.trim() || !draft.summary.trim() || !draft.distanceMiles.trim() || !draft.elevationGainFt.trim()) {
      setError('Name, summary, distance, and elevation gain are required.')
      return
    }

    // Coordinates are required by the API contract, even though this view does not expose edits for them.
    const startLat = Number(draft.startLatitude)
    const startLng = Number(draft.startLongitude)
    const endLat = Number(draft.endLatitude)
    const endLng = Number(draft.endLongitude)
    if (
      !Number.isFinite(startLat) || !Number.isFinite(startLng)
      || !Number.isFinite(endLat) || !Number.isFinite(endLng)
    ) {
      setError('Route coordinates are invalid. Reload the route and try again.')
      return
    }

    try {
      if (!isAuthenticated) {
        await login({ returnTo: `/explore/routes/${routeId}` })
        return
      }
      const accessToken = await getAccessToken()
      if (!accessToken) {
        setError('Session expired. Please sign in again.')
        await login({ returnTo: `/explore/routes/${routeId}` })
        return
      }
      const payload = {
        name: draft.name,
        summary: draft.summary,
        description: null,
        activityType: draft.activityType,
        climbingStyle: draft.activityType === 'RockClimbing' ? (draft.climbingStyle || null) : null,
        climbingGrade: draft.activityType === 'RockClimbing' ? (draft.climbingGrade || null) : null,
        difficulty: draft.difficulty,
        distanceMiles: Number(draft.distanceMiles),
        elevationGainFt: Number(draft.elevationGainFt),
        elevationLossFt: draft.elevationLossFt ? Number(draft.elevationLossFt) : null,
        maxElevationFt: draft.maxElevationFt ? Number(draft.maxElevationFt) : null,
        minElevationFt: draft.minElevationFt ? Number(draft.minElevationFt) : null,
        estimatedTimeMinutes: draft.estimatedTimeMinutes ? Number(draft.estimatedTimeMinutes) : null,
        loopType: draft.loopType,
        startLatitude: startLat,
        startLongitude: startLng,
        endLatitude: endLat,
        endLongitude: endLng,
        status: draft.status,
        progress: draft.progress,
        publishedAt: draft.publishedAt ? new Date(draft.publishedAt).toISOString() : null,
      }
      const updated = await updateRoute(routeId, payload, accessToken)
      setRoute(updated)
      setEditingSection(null)
      await loadRoute()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update route.')
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    await handleUpdate()
  }

  return (
    <section className="grid gap-6">
      <Link to="/explore" className="text-xs text-slate-500 hover:text-emerald-600">
        ← Back to Explore
      </Link>

      {isLoading ? (
        <EmptyState title="Loading route..." />
      ) : null}
      {error ? (
        <EmptyState title="Route request failed." description={error} />
      ) : null}
      {!isLoading && !route ? (
        <EmptyState title="Route not found." description="Check the route ID and try again." />
      ) : null}

      <form className="grid gap-6" onSubmit={handleSubmit}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <header className="grid max-w-3xl flex-1 gap-2">
            <h1 className="text-3xl font-semibold">{route?.name ?? 'Route detail'}</h1>
            <div className="text-xs text-slate-400">Route ID: {routeId}</div>
          </header>
        </div>

        <div className="grid gap-6">
          <section className="overflow-hidden rounded-xl">
            {photos.length > 0 ? (
              <PhotoCarousel
                index={photoIndex}
                photos={photos}
                onNext={() => setPhotoIndex((current) => Math.min(current + 1, photos.length - 1))}
                onPrev={() => setPhotoIndex((current) => Math.max(current - 1, 0))}
              />
            ) : (
              <div className="grid h-72 place-items-center rounded-2xl border border-slate-200/70 text-sm text-slate-500 dark:border-slate-800">
                No route photos available.
              </div>
            )}
          </section>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {routeStats.map((stat) => (
              <ReadOnlyField key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>

          <section className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Summary</h2>
              {route && canManage && editingSection !== 'summary' ? (
                <Button
                  aria-label="Edit summary"
                  className="inline-flex items-center gap-1"
                  type="button"
                  variant="text"
                  onClick={() => setEditingSection('summary')}
                >
                  <Pencil size={14} />
                </Button>
              ) : null}
            </div>
            {editingSection === 'summary' && draft ? (
              <>
                <textarea
                  className="min-h-28 rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm text-slate-600 dark:border-slate-800 dark:bg-white/5 dark:text-slate-300"
                  required
                  value={draft.summary}
                  onChange={(event) => handleChange('summary', event.target.value)}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="submit" variant="primary">Save summary</Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setEditingSection(null)
                      void loadRoute()
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <p className="max-w-4xl text-slate-600 dark:text-slate-300">{route?.summary || 'No summary available yet.'}</p>
            )}
          </section>

          <div className="card grid gap-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Route details</h2>
              {route && canManage && editingSection !== 'details' ? (
                <Button
                  aria-label="Edit route details"
                  className="inline-flex items-center gap-1"
                  type="button"
                  variant="text"
                  onClick={() => setEditingSection('details')}
                >
                  <Pencil size={14} />
                </Button>
              ) : null}
            </div>
            {editingSection === 'details' && draft ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <EditableField label="Activity type">
                    <select
                      className={fieldClassName}
                      value={draft.activityType}
                      onChange={(event) => handleChange('activityType', event.target.value)}
                    >
                      {fieldOptions.activityType.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </EditableField>
                  {draft.activityType === 'RockClimbing' ? (
                    <>
                      <EditableField label="Climbing style">
                        <select
                          className={fieldClassName}
                          value={draft.climbingStyle}
                          onChange={(event) => handleChange('climbingStyle', event.target.value)}
                        >
                          {fieldOptions.climbingStyle.map((option) => (
                            <option key={option || 'None'} value={option}>{option || 'None'}</option>
                          ))}
                        </select>
                      </EditableField>
                      <EditableField label="Climbing grade">
                        <input
                          className={fieldClassName}
                          value={draft.climbingGrade}
                          onChange={(event) => handleChange('climbingGrade', event.target.value)}
                        />
                      </EditableField>
                    </>
                  ) : null}
                  <EditableField label="Difficulty">
                    <select
                      className={fieldClassName}
                      value={draft.difficulty}
                      onChange={(event) => handleChange('difficulty', event.target.value)}
                    >
                      {fieldOptions.difficulty.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </EditableField>
                  <EditableField label="Distance miles">
                    <input
                      className={fieldClassName}
                      required
                      step="0.1"
                      type="number"
                      value={draft.distanceMiles}
                      onChange={(event) => handleChange('distanceMiles', event.target.value)}
                    />
                  </EditableField>
                  <EditableField label="Elevation gain ft">
                    <input
                      className={fieldClassName}
                      required
                      type="number"
                      value={draft.elevationGainFt}
                      onChange={(event) => handleChange('elevationGainFt', event.target.value)}
                    />
                  </EditableField>
                  <EditableField label="Elevation loss ft">
                    <input
                      className={fieldClassName}
                      type="number"
                      value={draft.elevationLossFt}
                      onChange={(event) => handleChange('elevationLossFt', event.target.value)}
                    />
                  </EditableField>
                  <EditableField label="Max elevation ft">
                    <input
                      className={fieldClassName}
                      type="number"
                      value={draft.maxElevationFt}
                      onChange={(event) => handleChange('maxElevationFt', event.target.value)}
                    />
                  </EditableField>
                  <EditableField label="Min elevation ft">
                    <input
                      className={fieldClassName}
                      type="number"
                      value={draft.minElevationFt}
                      onChange={(event) => handleChange('minElevationFt', event.target.value)}
                    />
                  </EditableField>
                  <EditableField label="Estimated time minutes">
                    <input
                      className={fieldClassName}
                      type="number"
                      value={draft.estimatedTimeMinutes}
                      onChange={(event) => handleChange('estimatedTimeMinutes', event.target.value)}
                    />
                  </EditableField>
                  <EditableField label="Loop type">
                    <select
                      className={fieldClassName}
                      value={draft.loopType}
                      onChange={(event) => handleChange('loopType', event.target.value)}
                    >
                      {fieldOptions.loopType.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </EditableField>
                  <EditableField label="Start latitude">
                    <input
                      className={fieldClassName}
                      required
                      type="number"
                      value={draft.startLatitude}
                      onChange={(event) => handleChange('startLatitude', event.target.value)}
                    />
                  </EditableField>
                  <EditableField label="Start longitude">
                    <input
                      className={fieldClassName}
                      required
                      type="number"
                      value={draft.startLongitude}
                      onChange={(event) => handleChange('startLongitude', event.target.value)}
                    />
                  </EditableField>
                  <EditableField label="End latitude">
                    <input
                      className={fieldClassName}
                      required
                      type="number"
                      value={draft.endLatitude}
                      onChange={(event) => handleChange('endLatitude', event.target.value)}
                    />
                  </EditableField>
                  <EditableField label="End longitude">
                    <input
                      className={fieldClassName}
                      required
                      type="number"
                      value={draft.endLongitude}
                      onChange={(event) => handleChange('endLongitude', event.target.value)}
                    />
                  </EditableField>
                  <EditableField label="Status">
                    <select
                      className={fieldClassName}
                      value={draft.status}
                      onChange={(event) => handleChange('status', event.target.value)}
                    >
                      {fieldOptions.status.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </EditableField>
                  <EditableField label="Progress">
                    <select
                      className={fieldClassName}
                      value={draft.progress}
                      onChange={(event) => handleChange('progress', event.target.value)}
                    >
                      {fieldOptions.progress.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </EditableField>
                  <EditableField label="Published at">
                    <input
                      className={fieldClassName}
                      value={draft.publishedAt}
                      onChange={(event) => handleChange('publishedAt', event.target.value)}
                    />
                  </EditableField>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="submit" variant="primary">Save route details</Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setEditingSection(null)
                      void loadRoute()
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {readOnlyFields.map((field) => (
                  <ReadOnlyField key={field.label} label={field.label} value={field.value} />
                ))}
              </div>
            )}
          </div>
        </div>
      </form>

    </section>
  )
}

export default ExploreRouteDetail
