export function toCommaStyleColorFunction(str: string) {
  return str.replace(/((?:rgb|hsl)a?)\(([^)]+)\)/g, (_, fn: string, v: string) => {
    const [rgb, alpha] = v.split(/\//g).map(i => i.trim())
    if (alpha && !fn.endsWith('a'))
      fn += 'a'

    const parts = rgb.split(/,?\s+/).map(i => i.trim())
    if (alpha)
      parts.push(alpha)

    return `${fn}(${parts.filter(Boolean).join(', ')})`
  })
}
