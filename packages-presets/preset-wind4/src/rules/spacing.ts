import type { CSSEntries, Rule, RuleContext } from '@unocss/core'
import type { Theme } from '../theme'
import { directionMap, directionSize, h } from '../utils'

export const paddings: Rule<Theme>[] = [
  [/^pa?()-?(.+)$/, directionSize('padding'), { autocomplete: ['(m|p)<num>', '(m|p)-<num>'] }],
  [/^p-?xy()()$/, directionSize('padding'), { autocomplete: '(m|p)-(xy)' }],
  [/^p-?([xy])(?:-?(.+))?$/, directionSize('padding')],
  [/^p-?([rltbse])(?:-?(.+))?$/, directionSize('padding'), { autocomplete: '(m|p)<directions>-<num>' }],
  [/^p-(block|inline)(?:-(.+))?$/, directionSize('padding'), { autocomplete: '(m|p)-(block|inline)-<num>' }],
  [/^p-?([bi][se])(?:-?(.+))?$/, directionSize('padding'), { autocomplete: '(m|p)-(bs|be|is|ie)-<num>' }],
]

export const margins: Rule<Theme>[] = [
  [/^ma?()-?(.+)$/, directionSize('margin')],
  [/^m-?xy()()$/, directionSize('margin')],
  [/^m-?([xy])(?:-?(.+))?$/, directionSize('margin')],
  [/^m-?([rltbse])(?:-?(.+))?$/, directionSize('margin')],
  [/^m-(block|inline)(?:-(.+))?$/, directionSize('margin')],
  [/^m-?([bi][se])(?:-?(.+))?$/, directionSize('margin')],
]

// TODO: space variants effect

export const spaces: Rule<Theme>[] = [
  [/^space-([xy])-(.+)$/, handlerSpace, { autocomplete: ['space-(x|y|block|inline)', 'space-(x|y|block|inline)-reverse', 'space-(x|y|block|inline)-$spacing'] }],
  [/^space-([xy])-reverse$/, ([, d]) => ({ [`--un-space-${d}-reverse`]: 1 })],
  [/^space-(block|inline)-(.+)$/, handlerSpace],
  [/^space-(block|inline)-reverse$/, ([, d]) => ({ [`--un-space-${d}-reverse`]: 1 })],
]

function handlerSpace([, d, s]: string[], { theme }: RuleContext<Theme>): CSSEntries | undefined {
  let v = theme.spacing?.[s || 'DEFAULT'] ?? h.bracket.cssvar.auto.fraction.rem(s || '1')
  if (v != null) {
    if (v === '0')
      v = '0px'

    const results = directionMap[d].map((item): [string, string] => {
      const key = `margin${item}`
      const value = (item.endsWith('right') || item.endsWith('bottom'))
        ? `calc(${v} * var(--un-space-${d}-reverse))`
        : `calc(${v} * calc(1 - var(--un-space-${d}-reverse)))`
      return [key, value]
    })

    if (results) {
      return [
        [`--un-space-${d}-reverse`, 0],
        ...results,
      ]
    }
  }
}
