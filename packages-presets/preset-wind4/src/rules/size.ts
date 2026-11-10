import type { Rule, RuleContext } from '@unocss/core'
import type { Theme } from '../theme'
import type { Wind4Context } from '../utils/context'
import { resolveBreakpoints } from '@unocss/rule-utils'
import { generateThemeVariable, h, themeTracking } from '../utils'

const sizeMapping: Record<string, string> = {
  h: 'height',
  w: 'width',
  inline: 'inline-size',
  block: 'block-size',
}

function getPropName(minmax: string, hw: string) {
  return `${minmax || ''}${sizeMapping[hw]}`
}

function getSizeValue(ctx: Wind4Context, hw: string, prop: string) {
  const { theme } = ctx

  let v: string | undefined

  const keys: (keyof Theme)[] = ['container', 'spacing']
  for (const key of keys) {
    if ((theme[key] as Record<string, any>)?.[prop]) {
      themeTracking(key, prop, ctx)
      v = generateThemeVariable(key, prop)
      break
    }
  }

  if (!v) {
    switch (prop) {
      case 'fit':
      case 'max':
      case 'min':
        v = `${prop}-content`
        break
      case 'stretch':
        v = 'stretch'
        break
      case 'screen':
        v = hw === 'w' ? '100vw' : '100vh'
        break
    }
  }

  if (!v && h.number(prop) != null) {
    themeTracking(`spacing`, undefined, ctx)
    v = `calc(var(--spacing) * ${h.number(prop)})`
  }

  return v ?? h.bracket.cssvar.global.auto.none.fraction.rem(prop, ctx)
}

export const sizes: Rule<Theme>[] = [
  [/^size-(min-|max-)?(.+)$/, ([, m, s], ctx) => ({
    [getPropName(m, 'w')]: getSizeValue(ctx, 'w', s),
    [getPropName(m, 'h')]: getSizeValue(ctx, 'h', s),
  })],
  [/^(?:size-)?(min-|max-)?([wh])-?(.+)$/, ([, m, w, s], ctx) => ({ [getPropName(m, w)]: getSizeValue(ctx, w, s) })],
  [/^(?:size-)?(min-|max-)?(block|inline)-(.+)$/, ([, m, w, s], ctx) => ({ [getPropName(m, w)]: getSizeValue(ctx, w, s) }), {
    autocomplete: [
      '(w|h)-<num>',
      '(w|h)-(full|screen|fit|max|min)',
      '(max|min)-(w|h)-<num>',
      '(max|min)-(w|h)-(full|screen|fit|max|min)',
      '(block|inline)-<num>',
      '(block|inline)-(full|screen|fit|max|min)',
      '(max|min)-(w|h|block|inline)',
      '(max|min)-(w|h|block|inline)-<num>',
      '(max|min)-(w|h|block|inline)-(full|screen|fit|max|min)',
    ],
  }],
  [/^(?:size-)?(min-|max-)?(h)-screen-(.+)$/, ([, m, h, p], context) => ({ [getPropName(m, h)]: handleBreakpoint(context, p, 'verticalBreakpoint') })],
  [/^(?:size-)?(min-|max-)?(w)-screen-(.+)$/, ([, m, w, p], context) => ({ [getPropName(m, w)]: handleBreakpoint(context, p) }), {
    autocomplete: [
      '(w|h)-screen',
      '(min|max)-(w|h)-screen',
      'h-screen-$breakpoint',
      '(min|max)-h-screen-$breakpoint',
      'w-screen-$breakpoint',
      '(min|max)-w-screen-$breakpoint',
    ],
  }],
]

function handleBreakpoint(context: Readonly<RuleContext<Theme>>, point: string, key: 'breakpoint' | 'verticalBreakpoint' = 'breakpoint') {
  const bp = resolveBreakpoints(context, key)
  if (bp)
    return bp.find(i => i.point === point)?.size
}

function getAspectRatio(prop: string, ctx?: Wind4Context) {
  if (/^\d+\/\d+$/.test(prop))
    return prop

  switch (prop) {
    case 'square': return '1/1'
    case 'video': return '16/9'
  }

  return h.bracket.cssvar.global.auto.number(prop, ctx)
}

export const aspectRatio: Rule<Theme>[] = [
  [/^(?:size-)?aspect-(?:ratio-)?(.+)$/, ([, d]: string[], ctx) => ({ 'aspect-ratio': getAspectRatio(d, ctx) }), { autocomplete: ['aspect-(square|video|ratio)', 'aspect-ratio-(square|video)'] }],
]
