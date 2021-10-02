import { MiniwindCssEntries } from '..'

export function entriesToCss(arr?: MiniwindCssEntries) {
  if (!arr)
    return ''
  return arr
    .map(([key, value]) => value != null ? `${key}:${value};` : undefined)
    .filter(Boolean)
    .join(' ')
}
