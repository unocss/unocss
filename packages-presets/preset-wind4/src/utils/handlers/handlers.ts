import type { Theme } from '../../theme'
import { escapeSelector } from '@unocss/core'
import { globalKeywords } from '../mappings'
import { themeTracking } from '../track'
import { getThemeByKey } from '../utilities'
import { bracketTypeRe, numberRE, numberWithUnitRE, unitOnlyMap, unitOnlyRE } from './regex'

// Not all, but covers most high frequency attributes
const cssProps = [
  // basic props
  'color',
  'border-color',
  'background-color',
  'outline-color',
  'text-decoration-color',
  'flex-grow',
  'flex',
  'flex-shrink',
  'caret-color',
  'font',
  'gap',
  'opacity',
  'visibility',
  'z-index',
  'font-weight',
  'zoom',
  'text-shadow',
  'transform',
  'box-shadow',
  'border',

  // positions
  'background-position',
  'left',
  'right',
  'top',
  'bottom',
  'object-position',

  // sizes
  'max-height',
  'min-height',
  'max-width',
  'min-width',
  'height',
  'width',
  'border-width',
  'margin',
  'padding',
  'outline-width',
  'outline-offset',
  'font-size',
  'line-height',
  'text-indent',
  'vertical-align',
  'border-spacing',
  'letter-spacing',
  'word-spacing',

  // enhances
  'stroke',
  'filter',
  'backdrop-filter',
  'fill',
  'mask',
  'mask-size',
  'mask-border',
  'clip-path',
  'clip',
  'border-radius',
]

function round(n: number) {
  return +n.toFixed(10)
}

export function numberWithUnit(str: string) {
  const match = str.match(numberWithUnitRE)
  if (!match)
    return
  const [, n, unit] = match
  const num = Number.parseFloat(n)
  if (unit && !Number.isNaN(num))
    return `${round(num)}${unit}`
}

export function auto(str: string) {
  if (str === 'auto' || str === 'a')
    return 'auto'
}

export function rem(str: string) {
  if (!str)
    return
  if (unitOnlyRE.test(str))
    return `${unitOnlyMap[str]}${str}`
  const match = str.match(numberWithUnitRE)
  if (!match)
    return
  const [, n, unit] = match
  const num = Number.parseFloat(n)
  if (!Number.isNaN(num)) {
    if (num === 0)
      return '0'
    return unit ? `${round(num)}${unit}` : `${round(num / 4)}rem`
  }
}

export function px(str: string) {
  if (unitOnlyRE.test(str))
    return `${unitOnlyMap[str]}${str}`
  const match = str.match(numberWithUnitRE)
  if (!match)
    return
  const [, n, unit] = match
  const num = Number.parseFloat(n)
  if (!Number.isNaN(num))
    return unit ? `${round(num)}${unit}` : `${round(num)}px`
}

export function number(str: string) {
  if (!numberRE.test(str))
    return
  const num = Number.parseFloat(str)
  if (!Number.isNaN(num))
    return round(num)
}

export function percent(str: string) {
  if (str.endsWith('%')) {
    str = str.slice(0, -1)
  }
  const num = number(str)
  if (num != null) {
    return `${num}%`
  }
}

export function fraction(str: string) {
  if (!str)
    return
  if (str === 'full')
    return '100%'
  const [left, right] = str.split('/')
  const num = Number.parseFloat(left) / Number.parseFloat(right)
  if (!Number.isNaN(num)) {
    if (num === 0)
      return '0'
    return `${round(num * 100)}%`
  }
}

function processThemeVariable(name: string, key: keyof Theme, paths: string[], theme: Theme) {
  const valOrObj = getThemeByKey(theme, key, paths)
  const hasDefault = typeof valOrObj === 'object' && 'DEFAULT' in valOrObj

  if (hasDefault)
    paths.push('DEFAULT')

  const val = hasDefault ? valOrObj.DEFAULT : valOrObj
  const varKey = hasDefault && key !== 'spacing' ? `${name}.DEFAULT` : name

  if (val != null)
    themeTracking(key, paths.length ? paths : undefined)

  return { val, varKey }
}

function bracketWithType(str: string, requiredType?: string, theme?: Theme) {
  if (str && str.startsWith('[') && str.endsWith(']')) {
    let base: string | undefined
    let hintedType: string | undefined

    const match = str.match(bracketTypeRe)
    if (!match) {
      base = str.slice(1, -1)
    }
    else {
      if (!requiredType) {
        hintedType = match[1]
      }
      else if (match[1] !== requiredType) {
        return
      }

      base = str.slice(match[0].length, -1)
    }

    if (!base)
      return

    // test/preset-attributify.test.ts > fixture5
    if (base === '=""')
      return

    if (base.startsWith('--')) {
      const calcMatch = base.match(/^--([\w.-]+)\(([^)]+)\)$/)
      if (calcMatch != null && theme) {
        // Handle theme function with calculation: --theme.key(factor)
        const [, name, factor] = calcMatch
        const [key, ...paths] = name.split('.') as [keyof Theme, ...string[]]
        const { val, varKey } = processThemeVariable(name, key, paths, theme)

        if (val != null)
          base = `calc(var(--${escapeSelector(varKey.replaceAll('.', '-'))}) * ${factor})`
      }
      else {
        // Handle regular CSS variable: --name or --theme.key with optional default
        const [name, defaultValue] = base.slice(2).split(',')
        const suffix = defaultValue ? `, ${defaultValue}` : ''
        const escapedName = escapeSelector(name)

        if (theme) {
          const [key, ...paths] = name.split('.') as [keyof Theme, ...string[]]
          const { val, varKey } = processThemeVariable(name, key, paths, theme)
          base = val != null
            ? `var(--${escapeSelector(varKey.replaceAll('.', '-'))}${suffix})`
            : `var(--${escapedName}${suffix})`
        }
        else {
          base = `var(--${escapedName}${suffix})`
        }
      }
    }

    let curly = 0
    for (const i of base) {
      if (i === '[') {
        curly += 1
      }
      else if (i === ']') {
        curly -= 1
        if (curly < 0)
          return
      }
    }
    if (curly)
      return

    switch (hintedType) {
      case 'string': return base
        .replace(/(^|[^\\])_/g, '$1 ')
        .replace(/\\_/g, '_')

      case 'quoted': return base
        .replace(/(^|[^\\])_/g, '$1 ')
        .replace(/\\_/g, '_')
        .replace(/(["\\])/g, '\\$1')
        .replace(/^(.+)$/, '"$1"')
    }

    return base
      .replace(/(url\(.*?\))/g, v => v.replace(/_/g, '\\_'))
      .replace(/(^|[^\\])_/g, '$1 ')
      .replace(/\\_/g, '_')
      .replace(/(?:calc|clamp|max|min)\((.*)/g, (match) => {
        const vars: string[] = []
        return match
          .replace(/var\((--.+?)[,)]/g, (match, g1) => {
            vars.push(g1)
            return match.replace(g1, '--un-calc')
          })
          .replace(/(-?\d*\.?\d(?!-\d.+[,)](?![^+\-/*])\D)(?:%|[a-z]+)?|\))([+\-/*])/g, '$1 $2 ')
          .replace(/--un-calc/g, () => vars.shift()!)
      })
  }
}

export function bracket(str: string, theme?: Theme) {
  return bracketWithType(str, undefined, theme)
}

export function bracketOfColor(str: string, theme?: Theme) {
  return bracketWithType(str, 'color', theme)
}

export function bracketOfLength(str: string, theme?: Theme) {
  return bracketWithType(str, 'length', theme) || bracketWithType(str, 'size', theme)
}

export function bracketOfPosition(str: string, theme?: Theme) {
  return bracketWithType(str, 'position', theme)
}

export function bracketOfFamily(str: string, theme?: Theme) {
  return bracketWithType(str, 'family', theme)
}

export function bracketOfNumber(str: string, theme?: Theme) {
  return bracketWithType(str, 'number', theme)
}

export function cssvar(str: string) {
  if (str.startsWith('var('))
    return str

  const match = str.match(/^(?:\$|--)([^\s'"`;{}]+)$/)
  if (match) {
    const [name, defaultValue] = match[1].split(',')
    return `var(--${escapeSelector(name)}${defaultValue ? `, ${defaultValue}` : ''})`
  }
}

export function time(str: string) {
  const match = str.match(/^(-?[0-9.]+)(s|ms)?$/i)
  if (!match)
    return
  const [, n, unit] = match
  const num = Number.parseFloat(n)
  if (!Number.isNaN(num)) {
    if (num === 0 && !unit)
      return '0s'
    return unit ? `${round(num)}${unit}` : `${round(num)}ms`
  }
}

export function degree(str: string) {
  const match = str.match(/^(-?[0-9.]+)(deg|rad|grad|turn)?$/i)
  if (!match)
    return
  const [, n, unit] = match
  const num = Number.parseFloat(n)
  if (!Number.isNaN(num)) {
    if (num === 0)
      return '0deg'
    return unit ? `${round(num)}${unit}` : `${round(num)}deg`
  }
}

export function global(str: string) {
  if (globalKeywords.includes(str))
    return str
}

export function properties(str: string) {
  if (str.split(',').every(prop => cssProps.includes(prop)))
    return str
}

export function position(str: string) {
  if (['top', 'left', 'right', 'bottom', 'center'].includes(str))
    return str
}

export function none(str: string) {
  if (str === 'none')
    return 'none'
}
