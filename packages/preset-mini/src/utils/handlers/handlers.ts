const cssBasicProps = [
  'color', 'border-color', 'background-color', 'flex-grow', 'flex', 'flex-shrink',
  'caret-color', 'font', 'gap', 'opacity', 'visibility', 'z-index', 'font-weight',
  'zoom', 'text-shadow', 'transform', 'box-shadow',
]
const cssPositionProps = [
  'backround-position', 'left', 'right', 'top', 'bottom', 'object-position',
]
const cssSizeProps = [
  'max-height', 'min-height', 'max-width', 'min-width', 'height', 'width',
  'border-width', 'margin', 'padding', 'outline-width', 'outline-offset',
  'font-size', 'line-height', 'text-indent', 'vertical-align',
  'border-spacing', 'letter-spacing', 'word-spacing',
]
const cssEnhanceProps = ['stroke', 'filter', 'backdrop-filter', 'fill', 'mask', 'mask-size', 'mask-border', 'clip-path', 'clip']

// Not all, but covers most high frequency attributes
const cssProps = [
  ...cssBasicProps,
  ...cssPositionProps,
  ...cssSizeProps,
  ...cssEnhanceProps,
]

const numberWithUnitRE = /^(-?[0-9.]+)(px|pt|pc|rem|em|%|vh|vw|in|cm|mm|ex|ch|vmin|vmax)?$/i
const numberRE = /^(-?[0-9.]+)$/i
const unitOnlyRE = /^(px)$/i

export function numberWithUnit(str: string) {
  const match = str.match(numberWithUnitRE)
  if (!match)
    return
  const [,, unit] = match
  if (unit)
    return str
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
  if (unit)
    return str
  const num = parseFloat(n)
  if (!Number.isNaN(num))
    return `${num / 4}rem`
}

export function px(str: string) {
  if (str.match(unitOnlyRE))
    return `1${str}`
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
  if (str === 'full') return '100%'
  const [left, right] = str.split('/')
  const num = parseFloat(left) / parseFloat(right)
  if (!Number.isNaN(num))
    return `${num * 100}%`
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
  const duration = Number(str.replace(/(s|ms)$/, ''))

  if (isNaN(duration))
    return

  if (/(s|ms)$/.test(str))
    return str

  return `${str}ms`
}

export function global(str: string) {
  if (['inherit', 'initial', 'revert', 'unset'].includes(str))
    return str
}

export function properties(str: string) {
  if (str === undefined)
    return

  for (const prop of str.split(',')) {
    if (!cssProps.includes(prop))
      return
  }

  return str
}
