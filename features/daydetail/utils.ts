export function formatDateOverlayLabel(date: string): string {
  const parsed = new Date(`${date}T00:00:00`)
  const weekday = parsed.toLocaleDateString('en-US', { weekday: 'short' })
  return `${parsed.getDate()}\n${weekday}`
}
