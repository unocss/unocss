const matchCssVarNameRE = /var\((?<cssVarName>--[^,|)]+)(?:,(?<fallback>[^)]+))?\)/g
const cssColorRE = /(?:#|0x)(?:[a-f0-9]{3}|[a-f0-9]{6})\b|(?:rgb|rgba|hsl|hsla|oklch)\(.*\)/g
const varFnRE = /var\((--[^,|)]+)(?:,([^)]+))?\)/

function getCssVariables(code: string) {
  const regex = /(?<key>--[^\s:]+):(?<value>.+?)[!;]/g
  const cssVariables = new Map<string, string>()
  for (const match of code.matchAll(regex)) {
    const key = match.groups?.key
    if (key)
      cssVariables.set(key, match.groups?.value ?? '')
  }

  return cssVariables
}

/**
 * Get CSS color string from CSS string
 *
 * @example Input with CSS var
 * ```css
 *.dark [border="dark\:gray-700"] {
 *  --un-border-opacity: 1;
 *  border-color: rgb(55 65 81 / var(--un-border-opacity));
 *}
 * ```
 * return `rgb(55 65 81 / 1)`
 *
 * @example Input with no-value CSS var and its fallback value
 * ```css
 *.bg-brand-primary {
 *  background-color: hsl(217 78% 51% / var(--no-value, 0.5));
 *}
 * ```
 * return `hsl(217 78% 51% / 0.5)`
 *
 * @example Input with no-value CSS var
 * ```css
 *.bg-brand-primary {
 *  background-color: hsl(217 78% 51% / var(--no-value));
 *}
 * ```
 * return `rgb(217 78% 51%)`
 *
 * @param str - CSS string
 * @returns The **first** CSS color string (hex, rgb[a], hsl[a]) or `undefined`
 */
export function getColorString(str: string) {
  let colorString = str.match(cssColorRE)?.[0] // e.g rgb(248 113 113 / var(--maybe-css-var))

  if (!colorString)
    return

  const cssVars = getCssVariables(str)

  // replace `var(...)` with its value
  for (const match of colorString.matchAll(matchCssVarNameRE)) {
    const matchedString = match[0]
    const cssVarName = match.groups?.cssVarName
    const fallback = match.groups?.fallback

    if (cssVarName && cssVars.get(cssVarName)) {
      // rgb(248 113 113 / var(--un-text-opacity)) => rgb(248 113 113 / 1)
      colorString = colorString.replaceAll(matchedString, () => {
        let v = cssVars.get(cssVarName) ?? matchedString
        // resolve nested css var
        while (v && v.startsWith('var(')) {
          const varName = v.match(varFnRE)?.[1]
          if (!varName) {
            v = ''
            break
          }

          v = cssVars.get(varName) || ''
        }
        return v || '1'
      })
    }
    else if (fallback) {
      // rgb(248 113 113 / var(--no-value, 0.5)) => rgb(248 113 113 / 0.5)
      colorString = colorString.replaceAll(matchedString, fallback)
    }

    // rgb(248 113 113 / var(--no-value)) => rgba(248 113 113)
    colorString = colorString.replaceAll(/,?\s+var\(--.*?\)/g, '')
  }

  if (/\/\)/.test(colorString))
    colorString = colorString.replace(/ \/\)/g, '/ 1)')

  return convertToRGBA(colorString)
}

const reRgbFn = /rgb\((\d+)\s+(\d+)\s+(\d+)\s*\/\s*([\d.]+)\)/

export function convertToRGBA(rgbColor: string) {
  const match = rgbColor.match(reRgbFn)

  if (match) {
    const r = Number.parseInt(match[1].trim())
    const g = Number.parseInt(match[2].trim())
    const b = Number.parseInt(match[3].trim())
    const alpha = Number.parseFloat(match[4].trim())

    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  return rgbColor
}

export function parseColorToRGBA(colorString: string): { red: number, green: number, blue: number, alpha: number } | undefined {
  // Handle rgba(r, g, b, a)
  const rgbaMatch = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (rgbaMatch) {
    return {
      red: Number.parseInt(rgbaMatch[1]) / 255,
      green: Number.parseInt(rgbaMatch[2]) / 255,
      blue: Number.parseInt(rgbaMatch[3]) / 255,
      alpha: rgbaMatch[4] ? Number.parseFloat(rgbaMatch[4]) : 1,
    }
  }

  // Handle hex colors
  const hexMatch = colorString.match(/^#([a-f0-9]{3,6})$/i)
  if (hexMatch) {
    let hex = hexMatch[1]
    if (hex.length === 3)
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
    return {
      red: Number.parseInt(hex.slice(0, 2), 16) / 255,
      green: Number.parseInt(hex.slice(2, 4), 16) / 255,
      blue: Number.parseInt(hex.slice(4, 6), 16) / 255,
      alpha: 1,
    }
  }

  return undefined
}
