import { type ChangeEvent, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, ImagePlus } from 'lucide-react'
import Button from '@/components/buttons/Button'
import IconButton from '@/components/buttons/IconButton'

type Photo = File | string

type PhotoCarouselProps = {
  index: number
  photos: readonly Photo[]
  onNext: () => void
  onPrev: () => void
  onUpload?: (files: File[]) => void
}

const isFilePhoto = (photo: Photo): photo is File => typeof photo !== 'string'

const PhotoCarousel = ({ index, onNext, onPrev, onUpload, photos }: PhotoCarouselProps) => {
  const activePhoto = photos[index]
  const activePhotoUrl = useMemo(() => {
    if (!activePhoto) return null
    return isFilePhoto(activePhoto) ? URL.createObjectURL(activePhoto) : activePhoto
  }, [activePhoto])

  useEffect(() => () => {
    if (activePhotoUrl?.startsWith('blob:') && typeof URL.revokeObjectURL === 'function') {
      URL.revokeObjectURL(activePhotoUrl)
    }
  }, [activePhotoUrl])

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length > 0) {
      onUpload?.(files)
    }
    event.target.value = ''
  }

  if (!activePhotoUrl) {
    return (
      <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-slate-200/80 bg-slate-50/70 p-6 text-center dark:border-slate-800 dark:bg-white/5">
        <div className="grid gap-3">
          <div className="text-sm font-medium text-slate-600 dark:text-slate-300">No photos yet</div>
          {onUpload ? (
            <Button className="relative overflow-hidden" type="button" variant="ghost">
              <ImagePlus size={16} />
              Upload photos
              <input
                accept="image/*"
                aria-label="Upload photos"
                className="absolute inset-0 cursor-pointer opacity-0"
                multiple
                type="file"
                onChange={handleUpload}
              />
            </Button>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <figure className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-950 dark:border-slate-800">
      <img
        alt="Route"
        className="h-72 w-full object-cover"
        src={activePhotoUrl}
      />
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-slate-950/80 to-transparent p-3">
        <div className="text-xs font-medium text-white">
          {index + 1} / {photos.length}
        </div>
        <div className="flex items-center gap-2">
          {onUpload ? (
            <Button className="relative overflow-hidden bg-white/90 text-slate-800 hover:bg-white" type="button" variant="ghost">
              <ImagePlus size={16} />
              Add
              <input
                accept="image/*"
                aria-label="Upload photos"
                className="absolute inset-0 cursor-pointer opacity-0"
                multiple
                type="file"
                onChange={handleUpload}
              />
            </Button>
          ) : null}
          <IconButton
            ariaLabel="Previous photo"
            className="bg-white/90 text-slate-800 hover:bg-white"
            icon={<ChevronLeft size={16} />}
            onClick={onPrev}
          />
          <IconButton
            ariaLabel="Next photo"
            className="bg-white/90 text-slate-800 hover:bg-white"
            icon={<ChevronRight size={16} />}
            onClick={onNext}
          />
        </div>
      </div>
    </figure>
  )
}

export default PhotoCarousel
