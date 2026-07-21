import { render, screen } from '@testing-library/react-native'
import { DateOverlay } from '../DateOverlay'

describe('DateOverlay', () => {
  it('shows the provided label', () => {
    render(<DateOverlay label={'8\nMon'} accentColor="#4A90E2" visible />)
    expect(screen.getByText('8\nMon')).toBeTruthy()
  })

  it("colours the label with the day's accent colour when available", () => {
    render(<DateOverlay label={'8\nMon'} accentColor="#4A90E2" visible />)
    const style = screen.getByText('8\nMon').props.style
    expect(style).toEqual(expect.arrayContaining([expect.objectContaining({ color: '#4A90E2' })]))
  })

  it('falls back to white when the day has no accent colour', () => {
    render(<DateOverlay label={'8\nMon'} accentColor={null} visible />)
    const style = screen.getByText('8\nMon').props.style
    expect(style).toEqual(expect.arrayContaining([expect.objectContaining({ color: '#FFFFFF' })]))
  })
})
