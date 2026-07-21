import { render, screen } from '@testing-library/react-native'
import { FontFamily } from '../../../../lib/design'
import { DetailOverlay } from '../DetailOverlay'

describe('DetailOverlay', () => {
  it('shows the note text when the day has one', () => {
    render(<DetailOverlay visible locationName={null} noteText="A great day" />)
    expect(screen.getByText('A great day')).toBeTruthy()
  })

  it('does not render note text when the day has none', () => {
    render(<DetailOverlay visible locationName={null} noteText={null} />)
    expect(screen.queryByText('A great day')).toBeNull()
  })

  it('shows the location name when available', () => {
    render(<DetailOverlay visible locationName="Mission District" noteText={null} />)
    expect(screen.getByText('Mission District')).toBeTruthy()
  })

  it('does not render a location row when the day has no location', () => {
    render(<DetailOverlay visible locationName={null} noteText={null} />)
    expect(screen.queryByText('Mission District')).toBeNull()
  })

  it('centres the location text and sets it in the serif typeface', () => {
    render(<DetailOverlay visible locationName="Mission District" noteText={null} />)
    const style = screen.getByText('Mission District').props.style
    expect(style).toEqual(
      expect.objectContaining({ textAlign: 'center', fontFamily: FontFamily.serif }),
    )
  })

  it('left-aligns the note text and sets it in the sans typeface', () => {
    render(<DetailOverlay visible locationName={null} noteText="A great day" />)
    const style = screen.getByText('A great day').props.style
    expect(style).toEqual(expect.objectContaining({ fontFamily: FontFamily.sans }))
    expect(style.textAlign).not.toBe('center')
  })

  it('dims the whole photo while showing', () => {
    render(<DetailOverlay visible locationName={null} noteText={null} />)
    expect(screen.getByTestId('detail-overlay-dim')).toBeTruthy()
  })
})
