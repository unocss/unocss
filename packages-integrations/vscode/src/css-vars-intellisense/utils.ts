import { formatHex, parse } from 'culori'
import 'culori/fn'

export const unoVarPrefix = '--un-'

export function getRemToPxComment(value: string, remToPxRatio: number, format: 'simple' | 'detailed'): string | null {
  if (remToPxRatio <= 0 || !value.includes('rem'))
    return null
  const remMatch = value.match(/(-?[\d.]+)rem/)
  if (!remMatch || !remMatch[1])
    return null
  const remValue = Number.parseFloat(remMatch[1])
  const px = remValue * remToPxRatio
  const formattedPx = Number.parseFloat(px.toFixed(2))
  if (format === 'simple')
    return `/* ${formattedPx}px */`
  else
    return `/* ${remValue}rem = ${formattedPx}px */`
}

export const isHex = (str: string) => /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(str.trim())

export function getColorComment(resolvedValue: string, themeValue?: string | null): string | null {
  try {
    const color = parse(resolvedValue)
    if (!color)
      return null
    const hex = formatHex(color)
    if (themeValue && !isHex(themeValue) && themeValue.length < 35)
      return `/* ${themeValue} = ${hex} */`

    return `/* ${hex} */`
  }
  catch {
    return null
  }
}

export function isUnoColorVariable(prop: string): boolean {
  return prop.startsWith(unoVarPrefix) && prop.endsWith('-color')
}
