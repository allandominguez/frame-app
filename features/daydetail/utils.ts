export function formatDateOverlayLabel(date: string): string {
  const parsed = new Date(`${date}T00:00:00`)
  const weekday = parsed.toLocaleDateString('en-US', { weekday: 'short' })
  return `${parsed.getDate()}\n${weekday}`
}

const NOTE_PLACEHOLDERS = [
  'Just type...',
  'Leave a note...',
  'Anything to remember?',
  'Dear future me...',
  'Behind the scenes...',
  "What's happening?",
]

export function pickNotePlaceholder(): string {
  return NOTE_PLACEHOLDERS[Math.floor(Math.random() * NOTE_PLACEHOLDERS.length)]
}
