import { useEffect, useMemo, useRef, useState } from 'react'
import {
  createRoute,
  deleteRoute,
} from '@/features/api/celiumRoutes'
import Button from '@/components/buttons/Button'
import Card from '@/components/cards/Card'
import EmptyState from '@/components/data-display/EmptyState'
import DualRangeSlider from '@/components/form/DualRangeSlider'
import Dropdown from '@/components/form/Dropdown'
import PageToolbar from '@/components/layout/PageToolbar'
import RouteCard from '@/components/cards/RouteCard'
import SearchBar from '@/components/form/SearchBar'
import SectionHeader from '@/components/layout/SectionHeader'
import Tabs from '@/components/data-display/Tabs'
import { Modal, defaultRouteForm } from '@/components/modal'
import { useAuth } from '@/celium/auth'
import RouteFormModal from '@/celium/RouteFormModal'
import { parseCreateRoutePayload } from '@/celium/routeFormParser'
import useRouteForm from '@/celium/hooks/useRouteForm'
import useRoutePermissions from '@/celium/hooks/useRoutePermissions'
import useRoutesData from '@/celium/hooks/useRoutesData'
import { getRoutePhotos } from '@/utils/routePhotos'
import { RouteMap } from '@/components'

const LENGTH_CAP_MILES = 50
const ELEVATION_CAP_FEET = 6000

const Explore = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'todo' | 'completed'>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Moderate' | 'Hard' | 'Expert'>('All')
  const [distanceRange, setDistanceRange] = useState({ max: LENGTH_CAP_MILES, min: 0 })
  const [elevationRange, setElevationRange] = useState({ max: ELEVATION_CAP_FEET, min: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const routeRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const { getAccessToken, isAuthenticated, login } = useAuth()
  const { canManage, isLoading: isPermissionsLoading } = useRoutePermissions({ getAccessToken, isAuthenticated })
  const { error, isLoading, loadRoutes, routes, setError } = useRoutesData({ getAccessToken })
  const {
    closeFormModal,
    createForm,
    createPhotos,
    deleteTarget,
    handleCreateClick,
    hasSubmitted,
    isCreateOpen,
    photoIndex,
    setCreateForm,
    setCreatePhotos,
    setDeleteTarget,
    setHasSubmitted,
    setIsCreateOpen,
    setPhotoIndex,
  } = useRouteForm()

  useEffect(() => {
    void loadRoutes()
  }, [loadRoutes])

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude])
      },
      () => {
        setUserLocation(null)
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [])

  const filteredRoutes = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase()
    return routes.filter((route) => {
      const activity = route.activityType.toLowerCase()
      const style = route.climbingStyle?.toLowerCase() ?? ''
      const grade = route.climbingGrade?.toLowerCase() ?? ''
      const matchesText = (
        route.name.toLowerCase().includes(needle)
        || route.summary.toLowerCase().includes(needle)
        || (route.description ?? '').toLowerCase().includes(needle)
        || activity.includes(needle)
        || style.includes(needle)
        || grade.includes(needle)
      )
      const maxDistanceBound = distanceRange.max >= LENGTH_CAP_MILES ? Number.POSITIVE_INFINITY : distanceRange.max
      const maxElevationBound = elevationRange.max >= ELEVATION_CAP_FEET ? Number.POSITIVE_INFINITY : elevationRange.max
      const matchesDistance = route.distanceMiles >= distanceRange.min && route.distanceMiles <= maxDistanceBound
      const matchesElevation = route.elevationGainFt >= elevationRange.min && route.elevationGainFt <= maxElevationBound
      const matchesDifficulty = difficultyFilter === 'All' || route.difficulty === difficultyFilter

      return matchesText && matchesDistance && matchesElevation && matchesDifficulty
    })
  }, [difficultyFilter, distanceRange.max, distanceRange.min, elevationRange.max, elevationRange.min, routes, searchQuery])

  const visibleRoutes = useMemo(() => {
    if (activeTab === 'todo') return filteredRoutes.filter((route) => route.progress === 'Todo')
    if (activeTab === 'completed') return filteredRoutes.filter((route) => route.progress === 'Completed')
    return filteredRoutes
  }, [activeTab, filteredRoutes])

  const totalCount = useMemo(() => routes.length, [routes])
  const todoCount = useMemo(() => routes.filter((route) => route.progress === 'Todo').length, [routes])
  const completedCount = useMemo(() => routes.filter((route) => route.progress === 'Completed').length, [routes])

  const scrollToRoute = (id: string) => {
    const target = routeRefs.current[id]
    if (!target) return
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    target.classList.add('ring-2', 'ring-emerald-300')
    window.setTimeout(() => {
      target.classList.remove('ring-2', 'ring-emerald-300')
    }, 1200)
  }

  const handleCreate = async () => {
    setHasSubmitted(true)
    const parsed = parseCreateRoutePayload(createForm)
    if (!parsed.ok) {
      setError(parsed.error)
      return
    }

    setError(null)
    try {
      if (!isAuthenticated) {
        await login({ returnTo: '/explore' })
        return
      }

      const accessToken = await getAccessToken()
      await createRoute(parsed.value, accessToken ?? undefined)
      setCreateForm({ ...defaultRouteForm })
      setCreatePhotos([])
      setIsCreateOpen(false)
      setHasSubmitted(false)
      await loadRoutes()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create route.')
    }
  }

  const handleDelete = async (id: string) => {
    setError(null)
    try {
      if (!isAuthenticated) {
        await login({ returnTo: '/explore' })
        return
      }

      const accessToken = await getAccessToken()
      await deleteRoute(id, accessToken ?? undefined)
      await loadRoutes()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete route.')
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    await handleDelete(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <section className="grid gap-6">
      <SectionHeader
        eyebrow="Explore"
        subtitle="Search across curated backcountry routes with route geometry, conditions, and trip-ready context."
        title="Find the right route for the window you have."
      />

      <PageToolbar
        className="relative z-[1300] overflow-visible"
        actions={(
          canManage ? (
            <Button onClick={handleCreateClick} type="button" variant="primary">
              Create route
            </Button>
          ) : (
            <span className="text-sm text-slate-500">
              {isPermissionsLoading ? 'Checking access...' : 'Read-only access: no route modification allowed.'}
            </span>
          )
        )}
        filters={(
          <>
            <Dropdown label="Length">
              <div className="grid gap-3 text-sm">
                <p className="font-medium">Miles</p>
                <DualRangeSlider
                  max={LENGTH_CAP_MILES}
                  min={0}
                  onChange={setDistanceRange}
                  step={0.1}
                  value={distanceRange}
                />
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>0 mi</span>
                  <span>50+ mi</span>
                </div>
              </div>
            </Dropdown>
            <Dropdown label="Elevation">
              <div className="grid gap-3 text-sm">
                <p className="font-medium">Elevation gain (ft)</p>
                <DualRangeSlider
                  max={ELEVATION_CAP_FEET}
                  min={0}
                  onChange={setElevationRange}
                  step={50}
                  value={elevationRange}
                />
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>0 ft</span>
                  <span>6000+ ft</span>
                </div>
              </div>
            </Dropdown>
            <Dropdown label="Difficulty">
              <div className="grid gap-2 text-sm">
                {(['All', 'Easy', 'Moderate', 'Hard', 'Expert'] as const).map((option) => (
                  <Button
                    className={difficultyFilter === option ? 'border-emerald-400 text-emerald-700' : ''}
                    key={option}
                    onClick={() => setDifficultyFilter(option)}
                    type="button"
                    variant="text"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </Dropdown>
            <Button
              className="border-amber-300 bg-amber-50 text-amber-700 cursor-not-allowed hover:text-amber-700"
              disabled
              type="button"
              variant="text"
            >
              All Filters (Tap coming soon)
            </Button>
          </>
        )}
        search={(
          <SearchBar
            className="w-full lg:min-w-[36rem]"
            label="Search routes"
            onChange={setSearchQuery}
            placeholder="Search by route, description, or activity"
            value={searchQuery}
          />
        )}
      />

      <Tabs
        active={activeTab}
        items={[
          { value: 'all', label: 'All routes', count: totalCount },
          { value: 'todo', label: 'Todo', count: todoCount },
          { value: 'completed', label: 'Completed', count: completedCount },
        ]}
        onChange={(value) => setActiveTab(value as 'all' | 'todo' | 'completed')}
      />

      <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(0,4fr)] gap-6 lg:items-start">
        <div className="grid gap-4 max-h-[70vh] overflow-y-auto pr-2">
          {isLoading ? <Card className="p-4 text-sm text-slate-500">Loading routes...</Card> : null}
          {error ? <Card className="p-4 text-sm text-rose-600">{error}</Card> : null}
          {!isLoading && visibleRoutes.length === 0 ? (
            <EmptyState
              action={<Button variant="text" onClick={handleCreateClick}>Create route</Button>}
              description="Create one to get started."
              title="No routes yet."
            />
          ) : null}
          {visibleRoutes.map((route) => (
            <RouteCard
              key={route.id}
              ref={(element) => {
                routeRefs.current[route.id] = element
              }}
              coverImage={getRoutePhotos(route.name)[0]}
              href={`/explore/routes/${route.id}`}
              onDelete={canManage ? setDeleteTarget : undefined}
              route={route}
            />
          ))}
        </div>
        <Card className="relative z-0 p-6 flex flex-col justify-between lg:sticky lg:top-24">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Map</p>
            <h3 className="mt-2 text-lg font-semibold">Route coverage with live overlays.</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Preview line work, conditions, and nearby objectives. Toggle access points and hazard zones.
            </p>
          </div>
          <div className="mt-6 h-[42vh] min-h-[280px] max-h-[520px] overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <RouteMap
              onMarkerClick={scrollToRoute}
              routes={visibleRoutes}
              selectedRouteId={null}
              userLocation={userLocation}
            />
          </div>
        </Card>
      </div>

      <RouteFormModal
        form={createForm}
        isOpen={isCreateOpen}
        mode="create"
        onClose={closeFormModal}
        onPhotosChange={(files) => {
          setCreatePhotos(files)
          setPhotoIndex(0)
        }}
        onReset={() => setCreateForm({ ...defaultRouteForm })}
        onSubmit={handleCreate}
        photoIndex={photoIndex}
        photos={createPhotos}
        setForm={setCreateForm}
        setPhotoIndex={setPhotoIndex}
        showValidation={hasSubmitted}
      />

      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete route?"
        footer={(
          <>
            <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Delete route
            </Button>
          </>
        )}
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          This will permanently remove <strong>{deleteTarget?.name}</strong>. This action can’t be undone.
        </p>
      </Modal>
    </section>
  )
}

export default Explore
