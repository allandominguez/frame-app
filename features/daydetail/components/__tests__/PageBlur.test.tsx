import { render, screen } from '@testing-library/react-native'
import { PageBlur } from '../PageBlur'

function currentOpacity(): number {
  return screen.getByTestId('page-blur').props.style.opacity
}

describe('PageBlur', () => {
  it('renders the blur when visible', () => {
    render(<PageBlur visible />)
    expect(screen.getByTestId('page-blur')).toBeTruthy()
  })

  it('still renders the blur when not visible, so it never cold-starts on reveal', () => {
    render(<PageBlur visible={false} />)
    expect(screen.getByTestId('page-blur')).toBeTruthy()
  })

  it('starts fully opaque when mounted visible', () => {
    render(<PageBlur visible />)
    expect(currentOpacity()).toBe(1)
  })

  it('starts fully transparent when mounted hidden', () => {
    render(<PageBlur visible={false} />)
    expect(currentOpacity()).toBe(0)
  })
})
