import type { CSSObject, CSSValueInput, Rule, RuleContext } from '@unocss/core'
import type { Theme } from '@unocss/preset-wind4'
import {
  colorResolver,
  cornerMap,
  defineProperty,
  h,
  hasParseableColor,
  hyphenate,
  numberResolver,
  positionMap,
  themeTracking,
} from '../utils'

const linearMap: Record<string, string[]> = {
  t: ['top'],
  b: ['bottom'],
  l: ['left'],
  r: ['right'],
  x: ['left', 'right'],
  y: ['top', 'bottom'],
}

const maskInitialValue = 'linear-gradient(#fff, #fff)'

const baseMaskImage = {
  'mask-image': 'var(--un-mask-linear), var(--un-mask-radial), var(--un-mask-conic)',
  'mask-composite': 'intersect',
}

function handlePosition([,v = '']: string[]) {
  if (v in cornerMap) {
    const positions = v.split('').flatMap(c => linearMap[c]).join(' ')
    return { 'mask-position': positions }
  }
  const _v = h.bracket.cssvar.global.position(v)
  if (_v !== null)
    return { 'mask-position': _v }
}

function handleImage([_, gradient = '', direction, val]: string[], ctx: RuleContext<Theme>) {
  const css: CSSObject = { ...baseMaskImage }
  const props: (CSSValueInput | string)[] = []

  props.push(...['linear', 'radial', 'conic'].map(g => defineProperty(`--un-mask-${g}`, { initialValue: maskInitialValue })))

  if (gradient in linearMap) {
    css['--un-mask-linear'] = 'var(--un-mask-left), var(--un-mask-right), var(--un-mask-bottom), var(--un-mask-top)'

    for (const dir of linearMap[gradient]) {
      css[`--un-mask-${dir}`] = `linear-gradient(to ${dir}, var(--un-mask-${dir}-from-color) var(--un-mask-${dir}-from-position), var(--un-mask-${dir}-to-color) var(--un-mask-${dir}-to-position))`

      if (numberResolver(val) != null) {
        themeTracking('spacing')
        css[`--un-mask-${dir}-${direction}-position`] = `calc(var(--spacing) * ${h.bracket.cssvar.fraction.number(val)})`
      }
      else {
        css[`--un-mask-${dir}-${direction}-position`] = h.bracket.cssvar.fraction.rem(val)
      }

      if (hasParseableColor(val, ctx.theme)) {
        const result = colorResolver(`--un-mask-${dir}-${direction}-color`, hyphenate('colors'))([_, val], ctx)
        if (result) {
          const [c, ...p] = result
          Object.assign(css, c)
          props.push(...p)
        }
      }

      props.push(...['from', 'to'].flatMap(p => [
        defineProperty(`--un-mask-${dir}-${p}-position`, { syntax: '<length-percentage>', initialValue: p === 'from' ? '0%' : '100%' }),
        defineProperty(`--un-mask-${dir}-${p}-color`, { syntax: '<color>', initialValue: p === 'from' ? 'black' : 'transparent' }),
      ]))
    }

    props.push(...['top', 'right', 'bottom', 'left'].map(d => defineProperty(`--un-mask-${d}`, { initialValue: maskInitialValue })))
  }
  else {
    if (direction == null) {
      if (gradient === 'radial') {
        css['--un-mask-radial'] = 'radial-gradient(var(--un-mask-radial-stops, var(--un-mask-radial-size)))'
        css['--un-mask-radial-size'] = h.bracket.cssvar.rem(val)
      }
      else {
        css[`--un-mask-${gradient}`] = `${gradient}-gradient(var(--un-mask-${gradient}-stops, var(--un-mask-${gradient}-position)))`
        css[`--un-mask-${gradient}-position`] = numberResolver(val) ? `calc(1deg * ${h.bracket.cssvar.number(val)})` : h.bracket.cssvar.fraction(val)
      }
    }
    else {
      const gradientStopsPrefixMap: Record<string, string> = {
        linear: '',
        radial: 'var(--un-mask-radial-shape) var(--un-mask-radial-size) at ',
        conic: 'from ',
      }
      css[`--un-mask-${gradient}-stops`] = `${gradientStopsPrefixMap[gradient]}var(--un-mask-${gradient}-position), var(--un-mask-${gradient}-from-color) var(--un-mask-${gradient}-from-position), var(--un-mask-${gradient}-to-color) var(--un-mask-${gradient}-to-position)`
      css[`--un-mask-${gradient}`] = `${gradient}-gradient(var(--un-mask-${gradient}-stops))`

      if (hasParseableColor(val, ctx.theme)) {
        const result = colorResolver(`--un-mask-${gradient}-${direction}-color`, hyphenate('colors'))([_, val], ctx)
        if (result) {
          const [c, ...p] = result
          Object.assign(css, c)
          props.push(...p)
        }
      }
      else {
        if (numberResolver(val) != null) {
          themeTracking('spacing')
          css[`--un-mask-${gradient}-${direction}-position`] = `calc(var(--spacing) * ${h.bracket.cssvar.fraction.number(val)})`
        }
        else {
          css[`--un-mask-${gradient}-${direction}-position`] = h.bracket.cssvar.fraction.rem(val)
        }
      }
    }

    if (gradient === 'radial') {
      props.push(...[
        defineProperty('--un-mask-radial-shape', { initialValue: 'ellipse' }),
        defineProperty('--un-mask-radial-size', { initialValue: 'farthest-corner' }),
      ])
    }

    props.push(...['from', 'to'].flatMap(p => [
      defineProperty(`--un-mask-${gradient}-position`, { initialValue: gradient === 'radial' ? 'center' : '0deg' }),
      defineProperty(`--un-mask-${gradient}-${p}-position`, { syntax: '<length-percentage>', initialValue: p === 'from' ? '0%' : '100%' }),
      defineProperty(`--un-mask-${gradient}-${p}-color`, { syntax: '<color>', initialValue: p === 'from' ? 'black' : 'transparent' }),
    ]))
  }

  return [css, ...props]
}

function handleSize([, v = '']: string[]) {
  const _v = h.bracket.cssvar.global.fraction.rem(v)
  if (_v !== null)
    return { 'mask-size': _v }
}

export const masks: Rule<Theme>[] = [
  // mask-clip
  ['mask-clip-border', { 'mask-clip': 'border-box' }],
  ['mask-clip-padding', { 'mask-clip': 'padding-box' }],
  ['mask-clip-content', { 'mask-clip': 'content-box' }],
  ['mask-clip-fill', { 'mask-clip': 'fill-box' }],
  ['mask-clip-stroke', { 'mask-clip': 'stroke-box' }],
  ['mask-clip-view', { 'mask-clip': 'view-box' }],
  ['mask-no-clip', { 'mask-clip': 'no-clip' }],

  // mask-composite
  ['mask-add', { 'mask-composite': 'add' }],
  ['mask-subtract', { 'mask-composite': 'subtract' }],
  ['mask-intersect', { 'mask-composite': 'intersect' }],
  ['mask-exclude', { 'mask-composite': 'exclude' }],

  // mask-image
  [/^mask-(.+)$/, ([,v]) => ({ 'mask-image': h.bracket.cssvar(v) })],
  [/^mask-(linear|radial|conic|[xytblr])-(from|to)()(?:-(.+))?$/, handleImage, {
    autocomplete: [
      'mask-(linear|radial|conic)-(from|to)-$colors',
      'mask-(linear|radial|conic)-(from|to)-<percentage>',
      'mask-(linear|radial|conic)-(from|to)',
      'mask-(linear|radial|conic)-<percent>',
      'mask-(x|y|t|b|l|r)-(from|to)-$colors',
      'mask-(x|y|t|b|l|r)-(from|to)-<percentage>',
      'mask-(x|y|t|b|l|r)-(from|to)',
      'mask-(x|y|t|b|l|r)-<percent>',
    ],
  }],
  [/^mask-(linear|radial|conic)-(from|to)?-?(.*)$/, handleImage],
  [/^mask-([trblxy])-(from|to)-(.*)$/, handleImage],
  ['mask-none', { 'mask-image': 'none' }],
  ['mask-radial-circle', { '--un-mask-radial-shape': 'circle' }],
  ['mask-radial-ellipse', { '--un-mask-radial-shape': 'ellipse' }],
  ['mask-radial-closest-side', { '--un-mask-radial-size': 'closest-side' }],
  ['mask-radial-closest-corner', { '--un-mask-radial-size': 'closest-corner' }],
  ['mask-radial-farthest-side', { '--un-mask-radial-size': 'farthest-side' }],
  ['mask-radial-farthest-corner', { '--un-mask-radial-size': 'farthest-corner' }],
  [/^mask-radial-at-([-\w]{3,})$/, ([, s]) => ({ '--un-mask-radial-position': positionMap[s] }), {
    autocomplete: [`mask-radial-at-(${Object.keys(positionMap).filter(p => p.length > 2).join('|')})`],
  }],

  // mask-mode
  ['mask-alpha', { 'mask-mode': 'alpha' }],
  ['mask-luminance', { 'mask-mode': 'luminance' }],
  ['mask-match', { 'mask-mode': 'match-source' }],

  // mask-origin
  ['mask-origin-border', { 'mask-origin': 'border-box' }],
  ['mask-origin-padding', { 'mask-origin': 'padding-box' }],
  ['mask-origin-content', { 'mask-origin': 'content-box' }],
  ['mask-origin-fill', { 'mask-origin': 'fill-box' }],
  ['mask-origin-stroke', { 'mask-origin': 'stroke-box' }],
  ['mask-origin-view', { 'mask-origin': 'view-box' }],

  // mask-position
  [/^mask-([rltb]{1,2})$/, handlePosition],
  [/^mask-([-\w]{3,})$/, ([, s]) => ({ 'mask-position': positionMap[s] })],
  [/^mask-(?:position-|pos-)(.+)$/, handlePosition],

  // mask-repeat
  ['mask-repeat', { 'mask-repeat': 'repeat' }],
  ['mask-no-repeat', { 'mask-repeat': 'no-repeat' }],
  ['mask-repeat-x', { 'mask-repeat': 'repeat-x' }],
  ['mask-repeat-y', { 'mask-repeat': 'repeat-y' }],
  ['mask-repeat-space', { 'mask-repeat': 'space' }],
  ['mask-repeat-round', { 'mask-repeat': 'round' }],

  // mask-size
  ['mask-auto', { 'mask-size': 'auto' }],
  ['mask-cover', { 'mask-size': 'cover' }],
  ['mask-contain', { 'mask-size': 'contain' }],
  [/^mask-size-(.+)$/, handleSize],

  // mask-type
  ['mask-type-luminance', { 'mask-type': 'luminance' }],
  ['mask-type-alpha', { 'mask-type': 'alpha' }],
]
