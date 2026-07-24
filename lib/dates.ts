// A full, spoken-friendly date for accessibility labels and any UI that
// needs to name a specific day — raw ISO dates read awkwardly aloud (e.g.
// "twenty twenty-six dash oh six dash oh eight").
export function formatDateAccessibilityLabel(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
