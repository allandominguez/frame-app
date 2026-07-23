import { fireEvent, render, screen } from '@testing-library/react-native'
import { FontFamily } from '../../../../lib/design'
import { DetailOverlay } from '../DetailOverlay'

const noop = () => {}

function renderOverlay(overrides: Partial<React.ComponentProps<typeof DetailOverlay>> = {}) {
  return render(
    <DetailOverlay
      visible
      locationName={null}
      noteValue=""
      notePlaceholder="Just type..."
      onNoteChangeText={noop}
      onNoteFocus={noop}
      onNoteBlur={noop}
      onDeletePhoto={noop}
      pageHeight={800}
      {...overrides}
    />,
  )
}

describe('DetailOverlay', () => {
  it('shows the note value when the day has one', () => {
    renderOverlay({ noteValue: 'A great day' })
    expect(screen.getByDisplayValue('A great day')).toBeTruthy()
  })

  it('shows the placeholder prompt when the day has no note yet', () => {
    renderOverlay({ noteValue: '', notePlaceholder: 'Just type...' })
    expect(screen.getByPlaceholderText('Just type...')).toBeTruthy()
  })

  it('calls onNoteChangeText as the user types', () => {
    const onNoteChangeText = jest.fn()
    renderOverlay({ onNoteChangeText })

    fireEvent.changeText(screen.getByLabelText('Note for this day'), 'A great day')

    expect(onNoteChangeText).toHaveBeenCalledWith('A great day')
  })

  it('calls onNoteFocus and onNoteBlur as editing starts and ends', () => {
    const onNoteFocus = jest.fn()
    const onNoteBlur = jest.fn()
    renderOverlay({ onNoteFocus, onNoteBlur })

    const input = screen.getByLabelText('Note for this day')
    fireEvent(input, 'focus')
    expect(onNoteFocus).toHaveBeenCalled()

    fireEvent(input, 'blur')
    expect(onNoteBlur).toHaveBeenCalled()
  })

  it('shows the location name when available', () => {
    renderOverlay({ locationName: 'Mission District' })
    expect(screen.getByText('Mission District')).toBeTruthy()
  })

  it('does not render a location row when the day has no location', () => {
    renderOverlay({ locationName: null })
    expect(screen.queryByText('Mission District')).toBeNull()
  })

  it('centres the location text and sets it in the serif typeface', () => {
    renderOverlay({ locationName: 'Mission District' })
    const style = screen.getByText('Mission District').props.style
    expect(style).toEqual(
      expect.objectContaining({ textAlign: 'center', fontFamily: FontFamily.serif }),
    )
  })

  it('sets the note input to the sans typeface', () => {
    renderOverlay({ noteValue: 'A great day' })
    const style = screen.getByDisplayValue('A great day').props.style
    expect(style).toEqual(
      expect.arrayContaining([expect.objectContaining({ fontFamily: FontFamily.sans })]),
    )
  })

  it('caps the note at a maximum length', () => {
    renderOverlay({ noteValue: 'A great day' })
    expect(screen.getByDisplayValue('A great day').props.maxLength).toBe(8000)
  })

  it("bounds the note's height to its band, proportional to the page height", () => {
    renderOverlay({ noteValue: 'A great day', pageHeight: 800 })
    const style = screen.getByDisplayValue('A great day').props.style
    // Band spans 40%-80% of page height (800), so its height is 40% of 800 = 320
    expect(style).toEqual(expect.arrayContaining([expect.objectContaining({ maxHeight: 320 })]))
  })

  it('dims the whole photo while showing', () => {
    renderOverlay()
    expect(screen.getByTestId('detail-overlay-dim')).toBeTruthy()
  })

  it('allows touches to reach the note input while visible', () => {
    renderOverlay({ visible: true })
    expect(screen.getByTestId('detail-overlay').props.pointerEvents).toBe('auto')
  })

  it('lets touches pass through to the page below once hidden', () => {
    renderOverlay({ visible: false })
    expect(screen.getByTestId('detail-overlay').props.pointerEvents).toBe('none')
  })

  it('calls onDeletePhoto when the delete affordance is pressed', () => {
    const onDeletePhoto = jest.fn()
    renderOverlay({ onDeletePhoto })

    fireEvent.press(screen.getByLabelText('Delete photo'))

    expect(onDeletePhoto).toHaveBeenCalledTimes(1)
  })
})
