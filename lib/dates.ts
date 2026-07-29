// Spoken-friendly date for accessibility labels — raw ISO dates read awkwardly aloud.
export function formatDateAccessibilityLabel(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
