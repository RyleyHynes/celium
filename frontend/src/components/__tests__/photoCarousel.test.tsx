import { render, screen, fireEvent } from '@testing-library/react'
import { PhotoCarousel } from '../media'


describe('PhotoCarousel', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders empty state when no photos', () => {
    render(
      <PhotoCarousel
        photos={[]}
        index={0}
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />
    )

    expect(screen.getByText('No photos yet')).toBeInTheDocument()
  })

  it('renders images and navigation', () => {
    vi.stubGlobal('URL', { createObjectURL: () => 'blob://photo' })
    const onPrev = vi.fn()
    const onNext = vi.fn()
    render(
      <PhotoCarousel
        photos={['/a.jpg', '/b.jpg']}
        index={0}
        onPrev={onPrev}
        onNext={onNext}
      />
    )

    fireEvent.click(screen.getByLabelText('Next photo'))
    expect(onNext).toHaveBeenCalled()
    fireEvent.click(screen.getByLabelText('Previous photo'))
    expect(onPrev).toHaveBeenCalled()
  })

  it('supports file uploads', () => {
    const onUpload = vi.fn()
    const { container } = render(
      <PhotoCarousel
        photos={[]}
        index={0}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onUpload={onUpload}
      />
    )

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['data'], 'route.jpg', { type: 'image/jpeg' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    expect(onUpload).toHaveBeenCalled()
  })
})
