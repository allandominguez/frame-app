import { fireEvent, render } from '@testing-library/react-native'
import { PhotoPickerSheet } from '../PhotoPickerSheet'

const baseProps = {
  visible: true,
  onTakePhoto: jest.fn(),
  onChooseFromGallery: jest.fn(),
  onDismiss: jest.fn(),
}

beforeEach(() => jest.clearAllMocks())

describe('PhotoPickerSheet', () => {
  it('shows both capture options when visible', () => {
    const { getByLabelText } = render(<PhotoPickerSheet {...baseProps} />)

    expect(getByLabelText('Take photo')).toBeTruthy()
    expect(getByLabelText('Choose from gallery')).toBeTruthy()
  })

  it('calls onTakePhoto when Take photo is pressed', () => {
    const onTakePhoto = jest.fn()
    const { getByLabelText } = render(<PhotoPickerSheet {...baseProps} onTakePhoto={onTakePhoto} />)

    fireEvent.press(getByLabelText('Take photo'))

    expect(onTakePhoto).toHaveBeenCalledTimes(1)
  })

  it('calls onChooseFromGallery when Choose from gallery is pressed', () => {
    const onChooseFromGallery = jest.fn()
    const { getByLabelText } = render(
      <PhotoPickerSheet {...baseProps} onChooseFromGallery={onChooseFromGallery} />,
    )

    fireEvent.press(getByLabelText('Choose from gallery'))

    expect(onChooseFromGallery).toHaveBeenCalledTimes(1)
  })

  it('calls onDismiss when Cancel is pressed', () => {
    const onDismiss = jest.fn()
    const { getByLabelText } = render(<PhotoPickerSheet {...baseProps} onDismiss={onDismiss} />)

    fireEvent.press(getByLabelText('Cancel'))

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('calls onDismiss when the overlay is pressed', () => {
    const onDismiss = jest.fn()
    const { getByLabelText } = render(<PhotoPickerSheet {...baseProps} onDismiss={onDismiss} />)

    fireEvent.press(getByLabelText('Dismiss'))

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('does not show options when not visible', () => {
    const { queryByLabelText } = render(<PhotoPickerSheet {...baseProps} visible={false} />)

    expect(queryByLabelText('Take photo')).toBeNull()
    expect(queryByLabelText('Choose from gallery')).toBeNull()
  })
})
