import type { CSSEntries, CSSObject, CSSObjectInput, CSSValueInput, DynamicMatcher, RuleContext, StaticRule, VariantContext } from '@unocss/core'
import type { Theme } from '../theme'
import { symbols, toArray } from '@unocss/core'
import { colorToString, getStringComponent, getStringComponents, parseCssColor } from '@unocss/rule-utils'
import { SpecialColorKey } from './constant'
import { h } from './handlers'
import { bracketTypeRe, numberWithUnitRE } from './handlers/regex'
import { cssMathFnRE, cssVarFnRE, directionMap, globalKeywords } from './mappings'
import { detectThemeValue, generateThemeVariable, themeTracking } from './theme-track'

// #region Number Resolver
export function numberResolver(size: string, defaultValue?: string | number): number | undefined {
  const v = h.number(size) ?? defaultValue

  if (v != null) {
    let num = Number(v)
    if (String(v).endsWith('%')) {
      num = Number(String(v).slice(0, -1)) / 100
    }

    return num
  }
}
// #endregion

// #region Direction with size
/**
 * Provide {@link DynamicMatcher} function returning spacing definition. See spacing rules.
 *
 * @param propertyPrefix - Property for the css value to be created. Postfix will be appended according to direction matched.
 * @see {@link directionMap}
 */
export function directionSize(propertyPrefix: string): DynamicMatcher<Theme> {
  const spaceMap = {
    'xs': 0.75 / 0.25,
    'sm': 0.875 / 0.25,
    'lg': 1.125 / 0.25,
    'xl': 1.25 / 0.25,
    '2xl': 1.5 / 0.25,
    '3xl': 1.875 / 0.25,
    '4xl': 2.25 / 0.25,
    '5xl': 3 / 0.25,
    '6xl': 3.75 / 0.25,
    '7xl': 4.5 / 0.25,
    '8xl': 6 / 0.25,
    '9xl': 8 / 0.25,
  }

  return (([_, direction, size]: string[]): CSSEntries | undefined => {
    let v: string | number | undefined

    v = numberResolver(size, spaceMap[size as keyof typeof spaceMap])

    if (v != null) {
      themeTracking('spacing')
      return directionMap[direction].map(i => [`${propertyPrefix}${i}`, `calc(var(--spacing) * ${v})`])
    }

    v = h.bracket.cssvar.global.auto.fraction.rem(size)

    if (v != null) {
      return directionMap[direction].map(i => [`${propertyPrefix}${i}`, v])
    }

    if (size?.startsWith('-')) {
      const _v = spaceMap[size.slice(1) as keyof typeof spaceMap]
      if (_v != null) {
        themeTracking('spacing')
        v = `calc(var(--spacing) * -${_v})`
        return directionMap[direction].map(i => [`${propertyPrefix}${i}`, v])
      }
    }
  }) as DynamicMatcher<Theme>
}
// #endregion

// #region With Colors

// #region Parse color

/**
 * Split utility shorthand delimited by / or :
 */
export function splitShorthand(body: string, type: string) {
  const [front, rest] = getStringComponent(body, '[', ']', ['/', ':']) ?? []

  if (front != null) {
    const match = (front.match(bracketTypeRe) ?? [])[1]

    if (match == null || match === type)
      return [front, rest]
  }
}

/**
 * Parse color string into {@link ParsedColorValue} (if possible). Color value will first be matched to theme object before parsing.
 * See also color.tests.ts for more examples.
 *
 * @example Parseable strings:
 * 'red' // From theme, if 'red' is available
 * 'red-100' // From theme, plus scale
 * 'red-100/20' // From theme, plus scale/opacity
 * '[rgb(100 2 3)]/[var(--op)]' // Bracket with rgb color and bracket with opacity
 *
 * @param body - Color string to be parsed.
 * @param theme - {@link Theme} object.
 * @return object if string is parseable.
 */
export function parseColor(body: string, theme: Theme) {
  const split = splitShorthand(body, 'color')
  if (!split)
    return

  const [main, opacity] = split
  const colors = main
    .replace(/([a-z])(\d)/g, '$1-$2')
    .split(/-/g)
  const [name] = colors

  if (!name)
    return

  let { no, keys, color } = parseThemeColor(theme, colors) ?? {}

  if (!color) {
    const bracket = h.bracketOfColor(main)
    const bracketOrMain = bracket || main

    if (h.numberWithUnit(bracketOrMain))
      return

    if (/^#[\da-f]+$/i.test(bracketOrMain))
      color = bracketOrMain
    else if (/^hex-[\da-fA-F]+$/.test(bracketOrMain))
      color = `#${bracketOrMain.slice(4)}`
    else if (main.startsWith('$'))
      color = h.cssvar(main)

    color = color || bracket
  }

  return {
    opacity,
    name,
    no,
    color: color ?? SpecialColorKey[name as keyof typeof SpecialColorKey],
    alpha: h.bracket.cssvar.percent(opacity ?? ''),
    /**
     * Keys means the color is from theme object.
     */
    keys,
    get cssColor() {
      return parseCssColor(this.color)
    },
  }
}

export function parseThemeColor(theme: Theme, keys: string[]) {
  let color: string | undefined
  let no
  let key

  const colorData = getThemeByKey(theme, 'colors', keys)

  if (typeof colorData === 'object') {
    if ('DEFAULT' in colorData) {
      color = colorData.DEFAULT
      no = 'DEFAULT'
      key = [...keys, no]
    }
  }
  else if (typeof colorData === 'string') {
    color = colorData
    key = keys
    no = keys.at(-1)
  }

  if (!color)
    return

  return {
    color,
    no,
    keys: key,
  }
}

export function getThemeByKey(theme: Theme, themeKey: keyof Theme, keys: string[]) {
  const obj = theme[themeKey]
  function deepGet(current: any, path: string[]): any {
    if (!current || typeof current !== 'object')
      return undefined
    if (path.length === 0)
      return current
    // First, check if the path is a flat key (e.g., foo-bar)
    for (let i = path.length; i > 0; i--) {
      const flatKey = path.slice(0, i).join('-')
      if (flatKey in current) {
        const v = current[flatKey]
        if (i === path.length)
          return v
        // look for the rest of the path
        return deepGet(v, path.slice(i))
      }
    }
    return undefined
  }
  return deepGet(obj, keys)
}

// #endregion

// #region Color Resolver

export function colorCSSGenerator(
  data: ReturnType<typeof parseColor>,
  property: string,
  varName: string,
  ctx?: RuleContext<Theme>,
): [CSSObject, ...CSSValueInput[]] | undefined {
  if (!data)
    return

  const { color, keys, alpha } = data
  const rawColorComment = ctx?.generator.config.envMode === 'dev' && color ? ` /* ${color} */` : ''
  const css: CSSObject = {}

  if (color) {
    const result: [CSSObject, ...CSSValueInput[]] = [css]

    if (Object.values(SpecialColorKey).includes(color)) {
      css[property] = color
    }
    else {
      const alphaKey = `--un-${varName}-opacity`
      const value = keys ? generateThemeVariable('colors', keys) : color

      css[alphaKey] = alpha
      css[property] = `color-mix(in oklch, ${value} var(${alphaKey}), transparent)${rawColorComment}`

      result.push(defineProperty(alphaKey, { syntax: '<percentage>', initialValue: '100%' }))

      if (keys) {
        themeTracking(`colors`, keys)
      }
      if (ctx?.theme) {
        detectThemeValue(color, ctx.theme)
      }
    }

    return result
  }
}

export function colorResolver(property: string, varName: string) {
  return ([, body]: string[], ctx: RuleContext<Theme>): (CSSValueInput | string)[] | undefined => {
    const data = parseColor(body ?? '', ctx.theme)
    if (!data)
      return

    return colorCSSGenerator(data, property, varName, ctx) as (CSSValueInput | string)[]
  }
}

// #endregion

export function colorableShadows(shadows: string | string[], colorVar: string) {
  const colored = []
  shadows = toArray(shadows)
  for (let i = 0; i < shadows.length; i++) {
    // shadow values are between 3 to 6 terms including color
    const components = getStringComponents(shadows[i], ' ', 6)
    if (!components || components.length < 3)
      return shadows

    let isInset = false
    const pos = components.indexOf('inset')
    if (pos !== -1) {
      components.splice(pos, 1)
      isInset = true
    }

    let colorVarValue = ''
    const lastComp = components.at(-1)
    if (parseCssColor(components.at(0))) {
      const color = parseCssColor(components.shift())
      if (color)
        colorVarValue = `, ${colorToString(color)}`
    }
    else if (parseCssColor(lastComp)) {
      const color = parseCssColor(components.pop())
      if (color)
        colorVarValue = `, ${colorToString(color)}`
    }
    else if (lastComp && cssVarFnRE.test(lastComp)) {
      const color = components.pop()!
      colorVarValue = `, ${color}`
    }

    colored.push(`${isInset ? 'inset ' : ''}${components.join(' ')} var(${colorVar}${colorVarValue})`)
  }

  return colored
}

export function hasParseableColor(color: string | undefined, theme: Theme) {
  return color != null && !!parseColor(color, theme)?.color
}

// #endregion

// #region resolve breakpoints
const reLetters = /[a-z]+/gi
const resolvedBreakpoints = new WeakMap<any, { point: string, size: string }[]>()

export function resolveBreakpoints({ theme, generator }: Readonly<VariantContext<Theme>>, key: 'breakpoint' | 'verticalBreakpoint' = 'breakpoint') {
  const breakpoints: Record<string, string> | undefined = (generator?.userConfig?.theme as any)?.[key] || theme[key]

  if (!breakpoints)
    return undefined

  if (resolvedBreakpoints.has(theme))
    return resolvedBreakpoints.get(theme)

  const resolved = Object.entries(breakpoints)
    .sort((a, b) => Number.parseInt(a[1].replace(reLetters, '')) - Number.parseInt(b[1].replace(reLetters, '')))
    .map(([point, size]) => ({ point, size }))

  resolvedBreakpoints.set(theme, resolved)
  return resolved
}

export function resolveVerticalBreakpoints(context: Readonly<VariantContext<Theme>>) {
  return resolveBreakpoints(context, 'verticalBreakpoint')
}
// #endregion

// #region Global static & defineProperty
export function makeGlobalStaticRules(prefix: string, property?: string): StaticRule[] {
  return globalKeywords.map(keyword => [`${prefix}-${keyword}`, { [property ?? prefix]: keyword }])
}

export function defineProperty(
  property: string,
  options: { syntax?: string, inherits?: boolean, initialValue?: unknown } = {},
): CSSValueInput {
  const {
    syntax = '*',
    inherits = false,
    initialValue,
  } = options

  const value: CSSObjectInput = {
    [symbols.shortcutsNoMerge]: true,
    [symbols.noMerge]: true,
    [symbols.variants]: () => [
      {
        parent: '',
        layer: 'cssvar-property',
        selector: () => `@property ${property}`,
      },
    ],
    syntax: JSON.stringify(syntax),
    inherits: inherits ? 'true' : 'false',
  }
  if (initialValue != null)
    value['initial-value'] = initialValue as keyof CSSObjectInput
  return value
}
// #endregion

// #region Basic util functions
export function isCSSMathFn(value: string | undefined) {
  return value != null && cssMathFnRE.test(value)
}

export function isSize(str: string) {
  if (str[0] === '[' && str.slice(-1) === ']')
    str = str.slice(1, -1)
  return cssMathFnRE.test(str) || numberWithUnitRE.test(str)
}

export function camelize(str: string) {
  return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '')
}

export function hyphenate(str: string) {
  return str.replace(/(?:^|\B)([A-Z])/g, '-$1').toLowerCase()
}

export function compressCSS(css: string, isDev = false) {
  if (isDev)
    return css.trim()
  return css.trim().replace(/\s+/g, ' ').replace(/\/\*[\s\S]*?\*\//g, '')
}
// #endregion
