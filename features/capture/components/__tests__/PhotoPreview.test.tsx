import { fireEvent, render } from '@testing-library/react-native'
import { PhotoPreview } from '../PhotoPreview'

const baseProps = {
  uri: 'file://photo.jpg',
  isSaving: false,
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
}

beforeEach(() => jest.clearAllMocks())

describe('PhotoPreview', () => {
  it('shows the photo and action buttons when a URI is provided', () => {
    const { getByLabelText } = render(<PhotoPreview {...baseProps} />)

    expect(getByLabelText('Selected photo preview')).toBeTruthy()
    expect(getByLabelText('Use photo')).toBeTruthy()
    expect(getByLabelText('Back')).toBeTruthy()
  })

  it('is not visible when uri is null', () => {
    const { queryByLabelText } = render(<PhotoPreview {...baseProps} uri={null} />)

    expect(queryByLabelText('Use photo')).toBeNull()
  })

  it('calls onConfirm when Use photo is pressed', () => {
    const onConfirm = jest.fn()
    const { getByLabelText } = render(<PhotoPreview {...baseProps} onConfirm={onConfirm} />)

    fireEvent.press(getByLabelText('Use photo'))

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when Back is pressed', () => {
    const onCancel = jest.fn()
    const { getByLabelText } = render(<PhotoPreview {...baseProps} onCancel={onCancel} />)

    fireEvent.press(getByLabelText('Back'))

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('shows Saving… and disables buttons while saving', () => {
    const onConfirm = jest.fn()
    const onCancel = jest.fn()
    const { getByLabelText } = render(
      <PhotoPreview {...baseProps} isSaving={true} onConfirm={onConfirm} onCancel={onCancel} />,
    )

    fireEvent.press(getByLabelText('Use photo'))
    fireEvent.press(getByLabelText('Back'))

    expect(onConfirm).not.toHaveBeenCalled()
    expect(onCancel).not.toHaveBeenCalled()
  })
})
