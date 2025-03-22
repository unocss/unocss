import { segment } from './segment'

export function isFamilyType(value: string) {
  if (value.startsWith('var('))
    return false

  return isGenericName(value) || isFamilyName(value)
}

export function isGenericName(value: string): boolean {
  return (
    value === 'serif'
    || value === 'sans-serif'
    || value === 'monospace'
    || value === 'cursive'
    || value === 'fantasy'
    || value === 'system-ui'
    || value === 'ui-serif'
    || value === 'ui-sans-serif'
    || value === 'ui-monospace'
    || value === 'ui-rounded'
    || value === 'math'
    || value === 'emoji'
    || value === 'fangsong'
  )
}

export function isFamilyName(value: string): boolean {
  let count = 0

  for (const part of segment(value, ',')) {
    // If it starts with a digit, then it's not a family name
    const char = part.charCodeAt(0)
    if (char >= 48 && char <= 57)
      return false

    if (part.startsWith('var('))
      continue

    count += 1
  }

  return count > 0
}
