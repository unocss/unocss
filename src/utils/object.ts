import { NanowindCssEntries } from '..'

export function entriesToCss(arr?: NanowindCssEntries) {
  if (!arr)
    return ''
  return arr
    .map(([key, value]) => value ? `${key}:${value};` : undefined)
    .filter(Boolean)
    .join(' ')
}
