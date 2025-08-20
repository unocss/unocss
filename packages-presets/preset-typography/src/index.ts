import type { Preset } from '@unocss/core'
import type { Theme } from '@unocss/preset-mini'
import type { TypographyCSSObject, TypographyOptions } from './types'
import { definePreset, mergeDeep } from '@unocss/core'
import { alphaPlaceholders, colorToString } from '@unocss/rule-utils'
import { modifiers, ProseDefaultCSSObject, ProseDefaultSize } from './constants'
import { getCSS, getElements, resolveColorScheme, resolveSizeScheme } from './resolve'

export * from './types'

export const presetTypography = definePreset((options?: TypographyOptions<Theme>): Preset<Theme> => {
  const selectorName = options?.selectorName ?? 'prose'
  const disableNotUtility = options?.compatibility?.noColonNot || options?.compatibility?.noColonWhere
  const cssVarPrefix = options?.cssVarPrefix ?? '--un-prose'
  const resolvedColorScheme = resolveColorScheme(options?.colorScheme)
  const resolvedSizeScheme = resolveSizeScheme(options?.sizeScheme)
  const extended = (entries: TypographyCSSObject, theme: Theme) => {
    const extend = typeof options?.cssExtend === 'function' ? options?.cssExtend(theme) : options?.cssExtend
    return mergeDeep(entries, extend ?? {})
  }

  // Regex
  const defaultRE = new RegExp(`^${selectorName}-default$`)
  const colorsRE = new RegExp(`^${selectorName}-([-\\w]+)$`)
  const sizeRE = new RegExp(`^${selectorName}-(${Object.keys(resolvedSizeScheme).join('|')})$`)

  return {
    name: '@unocss/preset-typography',
    enforce: 'post',
    layers: { typography: -20 },
    shortcuts: [
      [
        selectorName,
        [`${selectorName}-default`, 'prose-gray'],
        { layer: 'typography' },
      ],
    ],
    rules: [
      [
        defaultRE,
        (_, { symbols, theme }) => {
          const entries = extended(mergeDeep(ProseDefaultCSSObject, ProseDefaultSize.base), theme)
          const css = getCSS(entries, options ?? {})
          return {
            [symbols.body]: css,
          }
        },
        { layer: 'typography', autocomplete: 'prose', internal: true },
      ],
      // Colors
      [
        colorsRE,
        ([, color], { theme }) => {
          const baseColor = theme.colors?.[color] as Record<string, string> | string
          if (!baseColor || typeof baseColor !== 'object')
            return

          /**
           * Accent color palette names that only override link colors use [600, 500]
           */
          const ACCENT_COLORS = ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose']

          if (ACCENT_COLORS.includes(color)) {
            return {
              [`${cssVarPrefix}-links`]: baseColor['600'],
              [`${cssVarPrefix}-invert-links`]: baseColor['500'],
            }
          }
          else {
            return Object.entries(resolvedColorScheme).reduce((acc, [key, value]) => {
              const [colorKey, invertKey] = value as [string, string]
              const resolve = (key: string) => baseColor[key] ?? theme[key as keyof Theme] ?? key
              const color = resolve(colorKey)
              const invertColor = resolve(invertKey)
              const cssVarColorKey = `${cssVarPrefix}-${key}`
              const cssVarInvertColorKey = `${cssVarPrefix}-invert-${key}`

              acc[cssVarColorKey] = colorToString(color, `var(${cssVarColorKey}-opacity)`)
              acc[cssVarInvertColorKey] = colorToString(invertColor, `var(${cssVarInvertColorKey}-opacity)`)

              for (const [c, k] of [[color, `${cssVarColorKey}-opacity`], [invertColor, `${cssVarInvertColorKey}-opacity`]]) {
                if (alphaPlaceholders.some(p => c.includes(p)))
                  acc[k] = '1'
              }

              return acc
            }, {} as Record<string, string>)
          }
        },
        { layer: 'typography', autocomplete: `${selectorName}-$colors` },
      ],
      // Size
      [
        sizeRE,
        ([, size], { symbols, theme }) => {
          const css = getCSS(extended(resolvedSizeScheme[size], theme), options ?? {})

          return {
            [symbols.body]: css,
            [symbols.selector]: (selector) => {
              if (typeof options?.important === 'string') {
                selector = `${options.important} ${selector}`
              }
              if (!options?.compatibility?.noColonIs) {
                selector = `:is(${selector})`
              }
              return selector
            },
          }
        },
        { layer: 'typography', autocomplete: `${selectorName}-(${Object.keys(resolvedSizeScheme).join('|')})` },
      ],
      // Invert
      [
        `${selectorName}-invert`,
        {
          '--un-prose-body': 'var(--un-prose-invert-body)',
          '--un-prose-headings': 'var(--un-prose-invert-headings)',
          '--un-prose-lead': 'var(--un-prose-invert-lead)',
          '--un-prose-links': 'var(--un-prose-invert-links)',
          '--un-prose-bold': 'var(--un-prose-invert-bold)',
          '--un-prose-counters': 'var(--un-prose-invert-counters)',
          '--un-prose-bullets': 'var(--un-prose-invert-bullets)',
          '--un-prose-hr': 'var(--un-prose-invert-hr)',
          '--un-prose-quotes': 'var(--un-prose-invert-quotes)',
          '--un-prose-quote-borders': 'var(--un-prose-invert-quote-borders)',
          '--un-prose-captions': 'var(--un-prose-invert-captions)',
          '--un-prose-kbd': 'var(--un-prose-invert-kbd)',
          '--un-prose-kbd-shadows': 'var(--un-prose-invert-kbd-shadows)',
          '--un-prose-code': 'var(--un-prose-invert-code)',
          '--un-prose-pre-code': 'var(--un-prose-invert-pre-code)',
          '--un-prose-pre-bg': 'var(--un-prose-invert-pre-bg)',
          '--un-prose-th-borders': 'var(--un-prose-invert-th-borders)',
          '--un-prose-td-borders': 'var(--un-prose-invert-td-borders)',
        },
        { layer: 'typography' },
      ],
    ],
    variants: [
      {
        name: 'typography element modifiers',
        match: (matcher) => {
          if (matcher.startsWith(`${selectorName}-`)) {
            const modifyRe = new RegExp(`^${selectorName}-(\\w+)[:-].+$`)
            const modifier = matcher.match(modifyRe)?.[1]
            if (modifier) {
              const elements = getElements(modifier)
              if (elements?.length) {
                return {
                  matcher: matcher.slice(selectorName.length + modifier.length + 2),
                  selector: (s) => {
                    const notProseSelector = `:not(:where(.not-${selectorName},.not-${selectorName} *))`
                    const escapedSelector = disableNotUtility
                      ? elements.map(e => `${s} ${e}`).join(',')
                      : `${s} :is(:where(${elements})${notProseSelector})`
                    return escapedSelector
                  },
                }
              }
            }
          }
        },
        autocomplete: `${selectorName}-(${modifiers.map(m => `${m[0]}:`).join('|')})`,
      },
    ],
  }
})

export default presetTypography
