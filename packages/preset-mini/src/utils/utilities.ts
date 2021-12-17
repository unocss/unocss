import type { CSSEntries, CSSObject, CSSPropertyValue, Rule, RuleContext } from '@unocss/core'
import { escapeRegExp, hex2rgba, toArray } from '@unocss/core'
import type { Theme } from '../theme'
import { handler as h } from './handlers'
import { directionMap } from './mappings'

export function capitalize<T extends string>(str: T) {
  return str.charAt(0).toUpperCase() + str.slice(1) as Capitalize<T>
}

export const directionSize = (prefix: string) => ([_, direction, size]: string[]): CSSEntries | undefined => {
  const v = h.bracket.auto.rem.fraction.cssvar(size)
  if (v !== undefined)
    return directionMap[direction].map(i => [`${prefix}${i}`, v])
}

const getThemeColor = (theme: Theme, colors: string[]) =>
  theme.colors?.[
    colors.join('-').replace(/(-[a-z])/g, n => n.slice(1).toUpperCase())
  ]

export const parseColor = (body: string, theme: Theme) => {
  const [main, opacity] = body.split(/(?:\/|:)/)
  const colors = main
    .replace(/([a-z])([0-9])/g, '$1-$2')
    .split(/-/g)
  const [name] = colors

  if (!name)
    return

  let color: string | undefined
  const bracket = h.bracket(main)
  const bracketOrMain = bracket || main

  if (bracketOrMain.startsWith('#'))
    color = bracketOrMain.slice(1)
  if (bracketOrMain.startsWith('hex-'))
    color = bracketOrMain.slice(4)

  color = color || bracket

  let no = 'DEFAULT'
  if (!color) {
    let colorData
    const [scale] = colors.slice(-1)
    if (scale.match(/^\d+$/)) {
      no = scale
      colorData = getThemeColor(theme, colors.slice(0, -1))
    }
    else {
      colorData = getThemeColor(theme, colors)
      if (!colorData) {
        [, no = no] = colors
        colorData = getThemeColor(theme, [name])
      }
    }

    if (typeof colorData === 'string')
      color = colorData
    else if (no && colorData)
      color = colorData[no]
  }

  return {
    opacity,
    name,
    no,
    color,
    rgba: hex2rgba(color),
  }
}

export const colorResolver = (attribute: string, varName: string) => ([, body]: string[], { theme }: RuleContext<Theme>) => {
  const data = parseColor(body, theme)

  if (!data)
    return

  const { opacity, color, rgba } = data

  if (!color)
    return

  const a = opacity
    ? opacity[0] === '['
      ? h.bracket.percent(opacity)!
      : (parseFloat(opacity) / 100)
    : rgba?.[3]

  if (rgba) {
    if (a != null && !Number.isNaN(a)) {
      // @ts-expect-error
      rgba[3] = typeof a === 'string' && !a.includes('%')
        ? parseFloat(a)
        : a
      return {
        [attribute]: `rgba(${rgba.join(',')})`,
      }
    }
    else {
      return {
        [`--un-${varName}-opacity`]: 1,
        [attribute]: `rgba(${rgba.slice(0, 3).join(',')},var(--un-${varName}-opacity))`,
      }
    }
  }
  else {
    return {
      [attribute]: color.replace('%alpha', `${a || 1}`),
    }
  }
}

export const colorOpacityResolver = (varName: string) => ([, o]: string[]) => {
  const v = h.bracket.percent.cssvar(o)
  if (v !== undefined)
    return { [`--un-${[varName]}-opacity`]: v }
}

export const createColorRule = (name: string, prop?: string, varName?: string): Rule => [
  new RegExp(`^${escapeRegExp(name)}-(.+)$`),
  colorResolver(prop ?? name, varName ?? name),
]

export const createColorOpacityRule = (name: string, varName?: string): Rule => [
  new RegExp(`^${escapeRegExp(name)}-op(?:acity)?-?(.+)$`),
  colorOpacityResolver(varName ?? name),
]

export const createColorAndOpacityRulePair = (name: string, prop?: string, varName?: string) => [
  createColorRule(name, prop, varName),
  createColorOpacityRule(name, varName),
]

function generateCssObject(props: string | string[], value: string | number) {
  if (typeof props === 'string')
    return { [props]: value }

  const css: CSSObject = {}
  props.forEach(prop => css[prop] = value)
  return css
}

export const keywordResolver = (props: string | string[], keywords: CSSPropertyValue[] = []) => {
  const cache = Object.fromEntries(keywords.map(toArray))
  return ([, s]: string[]) => {
    if (s in cache)
      return generateCssObject(props, cache[s] ?? s)
  }
}

export const globalKeywordResolver = (props: string | string[], keywords: CSSPropertyValue[] = []) => {
  const cache = Object.fromEntries(keywords.map(toArray))
  return ([, s]: string[]) => {
    const v = s in cache ? (cache[s] ?? s) : h.global(s)
    if (v !== undefined)
      return generateCssObject(props, v)
  }
}

export const createKeywordRules = (bases: string | string[], props: string | string[], keywords: CSSPropertyValue[] = []): Rule[] =>
  keywords
    .map(key => typeof key === 'string' ? [key, key] : key)
    .map(([k, v]) => {
      if (typeof bases === 'string')
        bases = [bases]
      return bases.map(base => [`${base}-${k}`, generateCssObject(props, v)] as Rule)
    })
    .flat(1)

export const createGlobalKeywordRules = (bases: string | string[], props: string | string[], keywords: CSSPropertyValue[] = []): Rule[] =>
  createKeywordRules(bases, props, ['inherit', 'initial', 'revert', 'unset', ...keywords])

export const sizeRemResolver = (prop: string) => ([, s]: string[]) => {
  const v = h.bracket.auto.rem.fraction.percent.cssvar(s)
  if (v !== undefined)
    return { [prop]: v }
}

export const sizePxResolver = (prop: string) => ([, s]: string[]) => {
  const v = h.bracket.px.cssvar(s)
  if (v !== undefined)
    return { [prop]: v }
}
