import { type Dispatch, type SetStateAction } from 'react'
import type {
  ActivityType,
  ClimbingStyle,
  Difficulty,
  LoopType,
  RouteProgress,
  RouteStatus,
} from '@/features/api/celiumRoutes'
import Button from '@/components/buttons/Button'
import Input from '@/components/form/Input'
import { Modal } from '@/components/modal'
import Select from '@/components/form/Select'
import type { RouteFormState } from '@/components/modal/routeForm'
import { PhotoCarousel } from '@/components'

type RouteFormModalProps = {
  form: RouteFormState
  isOpen: boolean
  mode: 'create' | 'edit'
  onClose: () => void
  onPhotosChange: (files: File[]) => void
  onReset?: () => void
  onSubmit: () => void
  photoIndex: number
  photos: File[]
  setForm: Dispatch<SetStateAction<RouteFormState>>
  setPhotoIndex: Dispatch<SetStateAction<number>>
  showValidation: boolean
}

const climbingGrades: Record<ClimbingStyle, string[]> = {
  Sport: ['5.0', '5.1', '5.2', '5.3', '5.4', '5.5', '5.6', '5.7', '5.8', '5.9', '5.10a', '5.10b', '5.10c', '5.10d', '5.11a', '5.11b', '5.11c', '5.11d', '5.12a', '5.12b'],
  Trad: ['5.0', '5.1', '5.2', '5.3', '5.4', '5.5', '5.6', '5.7', '5.8', '5.9', '5.10a', '5.10b', '5.10c', '5.10d', '5.11a', '5.11b', '5.11c', '5.11d', '5.12a'],
  Bouldering: ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10'],
  Ice: ['WI2', 'WI3', 'WI4', 'WI5', 'WI6', 'AI2', 'AI3', 'AI4', 'AI5'],
}

const RouteFormModal = ({
  form,
  isOpen,
  mode,
  onClose,
  onPhotosChange,
  onReset,
  onSubmit,
  photoIndex,
  photos,
  setForm,
  setPhotoIndex,
  showValidation,
}: RouteFormModalProps) => {
  const isEdit = mode === 'edit'
  const withError = (value: string) => (showValidation && value.trim().length === 0 ? 'Required' : '')
  const updateField = (field: keyof RouteFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit route' : 'Create route'}
      footer={(
        <>
          {isEdit ? (
            <>
              <Button type="button" onClick={onClose}>Cancel</Button>
              <Button type="button" variant="primary" onClick={() => { void onSubmit() }}>Save changes</Button>
            </>
          ) : (
            <>
              <Button type="button" onClick={onReset ?? onClose}>Reset</Button>
              <Button type="button" variant="primary" onClick={() => { void onSubmit() }}>Create route</Button>
            </>
          )}
        </>
      )}
      size="lg"
    >
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{isEdit ? 'Edit route' : 'Create a route'}</h3>
          <span className="text-xs text-slate-400">* required</span>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            error={withError(form.name)}
            label="Name *"
            onChange={(event) => updateField('name', event.target.value)}
            placeholder="Skyline Ridge Traverse"
            value={form.name}
          />
          <Input
            error={withError(form.distanceMiles)}
            label="Distance (miles) *"
            onChange={(event) => updateField('distanceMiles', event.target.value)}
            placeholder="8.4"
            step="0.1"
            type="number"
            value={form.distanceMiles}
          />
          <Input
            error={withError(form.elevationGainFt)}
            label="Elevation gain (ft) *"
            onChange={(event) => updateField('elevationGainFt', event.target.value)}
            placeholder="2200"
            type="number"
            value={form.elevationGainFt}
          />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <Select
            error={withError(form.activityType)}
            label="Activity type *"
            onChange={(event) => setForm((current) => ({
              ...current,
              activityType: event.target.value as ActivityType,
              climbingStyle: event.target.value === 'RockClimbing' ? current.climbingStyle : '',
              climbingGrade: event.target.value === 'RockClimbing' ? current.climbingGrade : '',
            }))}
            options={[
              { value: '', label: 'Please select' },
              { value: 'Hiking', label: 'Hiking' },
              { value: 'TrailRunning', label: 'Trail running' },
              { value: 'RockClimbing', label: 'Rock climbing' },
            ]}
            value={form.activityType}
          />
          {form.activityType === 'RockClimbing' ? (
            <Select
              label="Climbing style"
              onChange={(event) => setForm((current) => ({
                ...current,
                climbingStyle: event.target.value as ClimbingStyle,
                climbingGrade: '',
              }))}
              options={[
                { value: '', label: 'Please select' },
                { value: 'Sport', label: 'Sport' },
                { value: 'Trad', label: 'Trad' },
                { value: 'Bouldering', label: 'Bouldering' },
                { value: 'Ice', label: 'Ice' },
              ]}
              value={form.climbingStyle}
            />
          ) : null}
          {form.activityType === 'RockClimbing' && form.climbingStyle ? (
            <Select
              label="Climbing grade"
              onChange={(event) => updateField('climbingGrade', event.target.value)}
              options={[
                { value: '', label: 'Please select' },
                ...((climbingGrades[form.climbingStyle as ClimbingStyle] ?? []).map((grade) => ({ value: grade, label: grade }))),
              ]}
              value={form.climbingGrade}
            />
          ) : null}
          <Select
            error={withError(form.difficulty)}
            label="Difficulty *"
            onChange={(event) => updateField('difficulty', event.target.value as Difficulty)}
            options={[
              { value: '', label: 'Please select' },
              { value: 'Easy', label: 'Easy' },
              { value: 'Moderate', label: 'Moderate' },
              { value: 'Hard', label: 'Hard' },
              { value: 'Expert', label: 'Expert' },
            ]}
            value={form.difficulty}
          />
          <Select
            error={withError(form.loopType)}
            label="Loop type *"
            onChange={(event) => updateField('loopType', event.target.value as LoopType)}
            options={[
              { value: '', label: 'Please select' },
              { value: 'Loop', label: 'Loop' },
              { value: 'OutAndBack', label: 'Out and back' },
              { value: 'PointToPoint', label: 'Point to point' },
            ]}
            value={form.loopType}
          />
          <Select
            error={withError(form.status)}
            label="Status *"
            onChange={(event) => updateField('status', event.target.value as RouteStatus)}
            options={[
              { value: '', label: 'Please select' },
              { value: 'Published', label: 'Published' },
              { value: 'Archived', label: 'Archived' },
            ]}
            value={form.status}
          />
          <Select
            label="Progress"
            onChange={(event) => updateField('progress', event.target.value as RouteProgress)}
            options={[
              { value: 'Todo', label: 'Todo' },
              { value: 'Completed', label: 'Completed' },
            ]}
            value={form.progress}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            error={withError(form.startLatitude)}
            label="Start latitude *"
            onChange={(event) => updateField('startLatitude', event.target.value)}
            placeholder="46.7865N"
            type="text"
            value={form.startLatitude}
          />
          <Input
            error={withError(form.startLongitude)}
            label="Start longitude *"
            onChange={(event) => updateField('startLongitude', event.target.value)}
            placeholder="121.7352W"
            type="text"
            value={form.startLongitude}
          />
          <Input
            error={withError(form.endLatitude)}
            label="End latitude *"
            onChange={(event) => updateField('endLatitude', event.target.value)}
            placeholder="43.7904N"
            type="text"
            value={form.endLatitude}
          />
          <Input
            error={withError(form.endLongitude)}
            label="End longitude *"
            onChange={(event) => updateField('endLongitude', event.target.value)}
            placeholder="110.6833W"
            type="text"
            value={form.endLongitude}
          />
        </div>
        <div className="grid gap-2">
          <label className="text-xs text-slate-500">Summary *</label>
          <textarea
            className={`rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-white/5 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${withError(form.summary) ? 'border-rose-500 text-rose-700' : ''}`}
            onChange={(event) => updateField('summary', event.target.value)}
            placeholder="High-alpine ridgeline with big views, strong winds, and a narrow descent. Best in stable weather windows."
            rows={4}
            value={form.summary}
          />
        </div>
        <div className="grid gap-2">
          <label className="text-xs text-slate-500">Photos</label>
          <PhotoCarousel
            index={photoIndex}
            onNext={() => {
              const count = photos.length
              if (count === 0) return
              setPhotoIndex((prev) => Math.min(prev + 1, count - 1))
            }}
            onPrev={() => setPhotoIndex((prev) => Math.max(prev - 1, 0))}
            onUpload={onPhotosChange}
            photos={photos}
          />
        </div>
      </div>
    </Modal>
  )
}

export default RouteFormModal

