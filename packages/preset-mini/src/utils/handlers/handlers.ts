// Not all, but covers most high frequency attributes
const cssProps = [
  // basic props
  'color', 'border-color', 'background-color', 'flex-grow', 'flex', 'flex-shrink',
  'caret-color', 'font', 'gap', 'opacity', 'visibility', 'z-index', 'font-weight',
  'zoom', 'text-shadow', 'transform', 'box-shadow',

  // positions
  'backround-position', 'left', 'right', 'top', 'bottom', 'object-position',

  // sizes
  'max-height', 'min-height', 'max-width', 'min-width', 'height', 'width',
  'border-width', 'margin', 'padding', 'outline-width', 'outline-offset',
  'font-size', 'line-height', 'text-indent', 'vertical-align',
  'border-spacing', 'letter-spacing', 'word-spacing',

  // enhances
  'stroke', 'filter', 'backdrop-filter', 'fill', 'mask', 'mask-size', 'mask-border', 'clip-path', 'clip',
]

const numberWithUnitRE = /^(-?[0-9.]+)(px|pt|pc|rem|em|%|vh|vw|in|cm|mm|ex|ch|vmin|vmax)?$/i
const numberRE = /^(-?[0-9.]+)$/i
const unitOnlyRE = /^(px)$/i

function round(n: number) {
  return n.toFixed(10).replace(/\.0+$/, '').replace(/(\.\d+?)0+$/, '$1')
}

export function numberWithUnit(str: string) {
  const match = str.match(numberWithUnitRE)
  if (!match)
    return
  const [, n, unit] = match
  const num = parseFloat(n)
  if (unit && !Number.isNaN(num))
    return `${round(num)}${unit}`
}

export function auto(str: string) {
  if (str === 'auto' || str === 'a')
    return 'auto'
}

export function rem(str: string) {
  if (str.match(unitOnlyRE))
    return `1${str}`
  const match = str.match(numberWithUnitRE)
  if (!match)
    return
  const [, n, unit] = match
  const num = parseFloat(n)
  if (!Number.isNaN(num))
    return unit ? `${round(num)}${unit}` : `${round(num / 4)}rem`
}

export function px(str: string) {
  if (str.match(unitOnlyRE))
    return `1${str}`
  const match = str.match(numberWithUnitRE)
  if (!match)
    return
  const [, n, unit] = match
  const num = parseFloat(n)
  if (!Number.isNaN(num))
    return unit ? `${round(num)}${unit}` : `${round(num)}px`
}

export function number(str: string) {
  if (!numberRE.test(str))
    return
  const num = parseFloat(str)
  if (!Number.isNaN(num))
    return round(num)
}

export function percent(str: string) {
  if (str.endsWith('%'))
    str = str.slice(0, -1)
  const num = parseFloat(str)
  if (!Number.isNaN(num))
    return `${round(num / 100)}`
}

export function fraction(str: string) {
  if (str === 'full') return '100%'
  const [left, right] = str.split('/')
  const num = parseFloat(left) / parseFloat(right)
  if (!Number.isNaN(num))
    return `${round(num * 100)}%`
}

export function bracket(str: string) {
  if (str && str[0] === '[' && str[str.length - 1] === ']') {
    return str
      .slice(1, -1)
      .replace(/_/g, ' ')
      .replace(/calc\((.*)/g, (v) => {
        return v.replace(/(-?\d*\.?\d(?!\b-.+[,)](?![^+\-/*])\D)(?:%|[a-z]+)?|\))([+\-/*])/g, '$1 $2 ')
      })
  }
}

export function cssvar(str: string) {
  if (str.startsWith('$'))
    return `var(--${str.slice(1)})`
}

export function time(str: string) {
  const match = str.match(/^(-?[0-9.]+)(s|ms)?$/i)
  if (!match)
    return
  const [, n, unit] = match
  const num = parseFloat(n)
  if (!Number.isNaN(num))
    return unit ? `${round(num)}${unit}` : `${round(num)}ms`
}

export function degree(str: string) {
  const match = str.match(/^(-?[0-9.]+)(deg)?$/i)
  if (!match)
    return
  const [, n, unit] = match
  const num = parseFloat(n)
  if (!Number.isNaN(num))
    return unit ? `${round(num)}${unit}` : `${round(num)}deg`
}

export function global(str: string) {
  if (['inherit', 'initial', 'revert', 'unset'].includes(str))
    return str
}

export function properties(str: string) {
  for (const prop of str.split(',')) {
    if (!cssProps.includes(prop))
      return
  }

  return str
}
