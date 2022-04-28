import type { Rule } from '@unocss/core'
import { transitions } from './transition'
import { borders } from './border'
import { bgColors, opacity, textColors } from './color'
import { flex } from './flex'
import { fonts, tabSizes, textIndents, textShadows, textStrokes } from './typography'
import { gaps } from './gap'
import { grids } from './grid'
import { overflows } from './layout'
import { alignments, boxSizing, floats, insets, justifies, orders, placements, positions, zIndexes } from './position'
import { rings } from './ring'
import { boxShadows } from './shadow'
import { aspectRatio, sizes } from './size'
import { margins, paddings } from './spacing'
import { appearances, breaks, contents, cursors, displays, fontSmoothings, fontStyles, pointerEvents, resizes, textOverflows, textTransforms, userSelects, whitespaces } from './static'
import { transforms } from './transform'
import { cssProperty, cssVariables } from './variables'
import { questionMark } from './question-mark'
import { textAligns, verticalAligns } from './align'
import { appearance, outline, willChange } from './behaviors'
import { textDecorations } from './decoration'
import { svgUtilities } from './svg'

export const rules: Rule[] = [
  cssVariables,
  cssProperty,
  paddings,
  margins,
  displays,
  opacity,
  bgColors,
  svgUtilities,
  borders,
  contents,
  fonts,
  tabSizes,
  textIndents,
  textOverflows,
  textDecorations,
  textStrokes,
  textShadows,
  textTransforms,
  textAligns,
  textColors,
  fontStyles,
  fontSmoothings,
  boxShadows,
  rings,
  flex,
  grids,
  gaps,
  positions,
  sizes,
  aspectRatio,
  cursors,
  appearances,
  pointerEvents,
  resizes,
  verticalAligns,
  userSelects,
  whitespaces,
  breaks,
  overflows,
  outline,
  appearance,
  orders,
  justifies,
  alignments,
  placements,
  insets,
  floats,
  zIndexes,
  boxSizing,
  transitions,
  transforms,
  willChange,

  // should be the last
  questionMark,
].flat(1)
