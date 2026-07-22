import { useEffect, useState } from 'react'

export type DetailOverlayVisibility = {
  visible: boolean
  toggle: () => void
}

export function useDetailOverlayVisibility(isFocused: boolean): DetailOverlayVisibility {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isFocused) {
      setVisible(false)
    }
  }, [isFocused])

  return { visible, toggle: () => setVisible((current) => !current) }
}
