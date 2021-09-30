export function size(str: string) {
  const match = str.match(/^([0-9.]+)([a-z]*)$/i)
  if (!match)
    return
  const [, n, unit] = match
  if (unit)
    return str
  const num = parseFloat(n)
  if (!Number.isNaN(num))
    return `${num / 4}rem`
}

export function border(str: string) {
  const match = str.match(/^([0-9.]+)([a-z]*)$/i)
  if (!match)
    return
  const [, n, unit] = match
  if (unit)
    return str
  const num = parseFloat(n)
  if (!Number.isNaN(num))
    return `${num}px`
}

export function percent(str: string) {
  if (str.endsWith('%'))
    str = str.slice(0, -1)
  const num = parseFloat(str)
  if (!Number.isNaN(num))
    return `${num}%`
}

export function fraction(str: string) {
  const [left, right] = str.split('/')
  const num = parseFloat(left) / parseFloat(right)
  if (!Number.isNaN(num))
    return `${num * 100}%`
}
