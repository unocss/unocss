const numberWithUnitRE = /^(-?[0-9.]+)([a-z]*)$/i
const numberRE = /^(-?[0-9.]+)$/i

export function rem(str: string) {
  if (str === 'auto' || str === 'a')
    return 'auto'
  const match = str.match(numberWithUnitRE)
  if (!match)
    return
  const [, n, unit] = match
  if (unit)
    return str
  const num = parseFloat(n)
  if (!Number.isNaN(num))
    return `${num / 4}rem`
}

export function px(str: string) {
  const match = str.match(numberWithUnitRE)
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
  if (!numberRE.test(str))
    return
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

export function cssvar(str: string) {
  if (str.startsWith('$'))
    return `var(--${str.slice(1)})`
}

export function time(str: string) {
  const duration = Number(str.replace(/(s|ms)$/, ''))

  if (isNaN(duration))
    return

  if (/ms|s$/.test(str))
    return str

  return `${str}ms`
}
