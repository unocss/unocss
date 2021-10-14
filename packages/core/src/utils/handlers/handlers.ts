export function size(str: string) {
  if (str === 'auto' || str === 'a')
    return 'auto'
  const match = str.match(/^(-?[0-9.]+)([a-z]*)$/i)
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

export function number(str: string) {
  const num = parseFloat(str)
  if (!Number.isNaN(num))
    return num
}

export function percent(str: string) {
  if (str.endsWith('%'))
    str = str.slice(0, -1)
  const num = parseFloat(str)
  if (!Number.isNaN(num))
    return `${num / 100}`
}

export function fraction(str: string) {
  const [left, right] = str.split('/')
  const num = parseFloat(left) / parseFloat(right)
  if (!Number.isNaN(num))
    return `${num * 100}%`
}

export function bracket(str: string) {
  if (str[0] === '[' && str[str.length - 1] === ']')
    return str.slice(1, -1)
}
