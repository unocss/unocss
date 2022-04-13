import type { Rule } from '@unocss/core'
import { handler as h } from '../utils'

export const clips: Rule[] = [
  [/^clip-rect-(.+)/, ([, c]) => ({ clip: `rect(${h.bracket(c)})` })],
  ['clip-auto', { clip: 'auto' }],
  ['clip-inherit', { clip: 'inherit' }],
]

export const clipPaths: Rule[] = [
  // source
  [/^clip-(?:source-)?(.+)$/, ([, c]) => ({ '--un-clip-source': h.bracket(c), 'clip-path': 'var(--un-clip-source)' })],

  // clip-path-[source:(), shape:(), url:(), none:()]
  [/^clip-path-(.+)$/, ([, c]) => ({ '--un-clip-path': h.bracket(c) })],

  ['clip-path-none', { 'clip-path': 'none' }],
]
