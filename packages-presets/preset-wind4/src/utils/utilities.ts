import type { CSSEntries, CSSObject, CSSObjectInput, CSSValueInput, DynamicMatcher, RuleContext, StaticRule, VariantContext } from '@unocss/core'
import type { Theme } from '../theme'
import { symbols, toArray } from '@unocss/core'
import { colorToString, getStringComponent, getStringComponents, isInterpolatedMethod, parseCssColor } from '@unocss/rule-utils'
import { SpecialColorKey } from './constant'
import { h } from './handlers'
import { bracketTypeRe, numberWithUnitRE } from './handlers/regex'
import { cssMathFnRE, cssVarFnRE, directionMap, globalKeywords } from './mappings'
import { detectThemeValue, generateThemeVariable, propertyTracking, themeTracking } from './track'

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
 * Returns a {@link DynamicMatcher} that generates spacing CSS properties for directional utilities.
 *
 * @param property - The base CSS property name (e.g. 'margin', 'padding').
 * @param map - Optional mapping of direction keys to property postfixes. Defaults to {@link directionMap}.
 * @param formatter - Optional function to format the final property name. Defaults to `(p, d) => \`\${p}\${d}\``.
 */
export function directionSize(
  property: string,
  map: Record<string, string[]> = directionMap,
  formatter: (p: string, d: string) => string = (p, d) => `${p}${d}`,
): DynamicMatcher<Theme> {
  return (([_, direction, size]: (string | undefined)[], { theme }): CSSEntries | undefined => {
    if (size != null && direction != null) {
      let v: string | number | undefined

      const isNegative = size.startsWith('-')
      if (isNegative)
        size = size.slice(1)

      v = numberResolver(size)

      if (v != null && !Number.isNaN(v)) {
        themeTracking('spacing')
        return map[direction].map(i => [formatter(property, i), `calc(var(--spacing) * ${isNegative ? '-' : ''}${v})`])
      }
      else if (theme.spacing && size in theme.spacing) {
        themeTracking('spacing', size)
        return map[direction].map(i => [formatter(property, i), isNegative ? `calc(var(--spacing-${size}) * -1)` : `var(--spacing-${size})`])
      }

      v = h.bracket.cssvar.global.auto.fraction.rem(isNegative ? `-${size}` : size)

      if (v != null) {
        return map[direction].map(i => [formatter(property, i), v])
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
 * '[rgb(100 2 3)]/[var(--op)]/[in_oklab]' // Bracket with rgb color, bracket with opacity and bracket with interpolation method
 *
 * @param body - Color string to be parsed.
 * @param theme - {@link Theme} object.
 * @return object if string is parseable.
 */
export function parseColor(body: string, theme: Theme) {
  let split
  const [front, ...rest] = getStringComponents(body, ['/', ':'], 3) ?? []

  if (front != null) {
    const match = (front.match(bracketTypeRe) ?? [])[1]

    if (match == null || match === 'color') {
      split = [front, ...rest]
    }
  }

  if (!split)
    return

  let opacity: string | undefined
  let [main, opacityOrModifier, modifier] = split as [string, string | undefined, string | undefined]

  if (isInterpolatedMethod(opacityOrModifier) || isInterpolatedMethod(h.bracket(opacityOrModifier ?? ''))) {
    modifier = opacityOrModifier
  }
  else {
    opacity = opacityOrModifier
  }

  const colors = main
    .replace(/([a-z])(\d)(?![-_a-z])/g, '$1-$2')
    .split(/-/g)
  const [name] = colors

  if (!name)
    return

  let parsed = parseThemeColor(theme, colors)
  if (!parsed && colors.length >= 2) {
    // If the last part of the color is numbers, merge the last two parts
    // e.g. ['foo', 'bar', '1'] should be parsed as ['foo', 'bar1']
    // try the last key is `bar1` in the theme.
    const last = colors.at(-1)
    const secondLast = colors.at(-2)
    if (/^\d+$/.test(last!)) {
      const keys = colors.slice(0, -2).concat([`${secondLast}${last}`])
      parsed = parseThemeColor(theme, keys)
    }
  }

  let { no, keys, color } = parsed ?? {}

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
    modifier: (modifier && h.bracket.cssvar(modifier)) || modifier,
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

  const { color, keys, alpha, modifier } = data
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
      let method = modifier ?? (keys ? 'in srgb' : 'in oklab')
      if (!method.startsWith('in ') && !method.startsWith('var(')) {
        method = `in ${method}`
      }

      css[property] = `color-mix(${method}, ${value} ${alpha ?? `var(${alphaKey})`}, transparent)${rawColorComment}`
      result.push(defineProperty(alphaKey, { syntax: '<percentage>', initialValue: '100%' }))

      if (keys) {
        themeTracking(`colors`, keys)
        if (!modifier) {
          const colorValue = ['shadow', 'inset-shadow', 'text-shadow', 'drop-shadow'].includes(varName)
            ? `${alpha ? `color-mix(in oklab, ${value} ${alpha}, transparent)` : `${value}`} var(${alphaKey})`
            : `${value} ${alpha ?? `var(${alphaKey})`}`
          result.push({
            [symbols.parent]: '@supports (color: color-mix(in lab, red, red))',
            [symbols.noMerge]: true,
            [symbols.shortcutsNoMerge]: true,
            [property]: `color-mix(in oklab, ${colorValue}, transparent)${rawColorComment}`,
          })
        }
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

export function colorableShadows(shadows: string | string[], colorVar: string, alpha?: string) {
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
        colorVarValue = colorToString(color)
    }
    else if (parseCssColor(lastComp)) {
      const color = parseCssColor(components.pop())
      if (color)
        colorVarValue = colorToString(color)
    }
    else if (lastComp && cssVarFnRE.test(lastComp)) {
      const color = components.pop()
      if (color)
        colorVarValue = color
    }

    colored.push(`${isInset ? 'inset ' : ''}${components.join(' ')} var(${colorVar}, ${alpha ? `oklab(from ${colorVarValue} l a b / ${alpha})` : colorVarValue})`)
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
        layer: 'properties',
        selector: () => `@property ${property}`,
      },
    ],
    syntax: JSON.stringify(syntax),
    inherits: inherits ? 'true' : 'false',
  }
  if (initialValue != null) {
    value['initial-value'] = initialValue as keyof CSSObjectInput
  }
  propertyTracking(property, initialValue ? String(initialValue) : 'initial')
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
