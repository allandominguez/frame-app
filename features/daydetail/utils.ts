export function formatDateOverlayLabel(date: string): string {
  const parsed = new Date(`${date}T00:00:00`)
  const weekday = parsed.toLocaleDateString('en-US', { weekday: 'short' })
  return `${parsed.getDate()}\n${weekday}`
}

// A full, spoken-friendly date for accessibility labels — the visual label
// above is a two-line "8 / Mon" abbreviation, and raw ISO dates read
// awkwardly aloud (e.g. "twenty twenty-six dash oh six dash oh eight").
export function formatDateAccessibilityLabel(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
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
