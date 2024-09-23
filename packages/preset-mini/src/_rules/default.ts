import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { textAligns, verticalAligns } from './align'
import { appearance, outline, willChange } from './behaviors'
import { borders } from './border'
import { bgColors, colorScheme, opacity } from './color'
import { containerParent } from './container'
import { textDecorations } from './decoration'
import { flex } from './flex'
import { gaps } from './gap'
import { grids } from './grid'
import { overflows } from './layout'
import { alignments, boxSizing, flexGridJustifiesAlignments, floats, insets, justifies, orders, placements, positions, zIndexes } from './position'
import { questionMark } from './question-mark'
import { rings } from './ring'
import { boxShadows } from './shadow'
import { aspectRatio, sizes } from './size'
import { margins, paddings } from './spacing'
import { appearances, breaks, contains, contents, contentVisibility, cursors, displays, fontSmoothings, fontStyles, pointerEvents, resizes, textOverflows, textTransforms, textWraps, userSelects, whitespaces } from './static'
import { svgUtilities } from './svg'
import { transforms } from './transform'
import { transitions } from './transition'
import { fonts, tabSizes, textIndents, textShadows, textStrokes } from './typography'
import { cssProperty, cssVariables } from './variables'

export const rules: Rule<Theme>[] = [
  cssVariables,
  cssProperty,
  contains,
  pointerEvents,
  appearances,
  positions,
  insets,
  zIndexes,
  orders,
  grids,
  floats,
  margins,
  boxSizing,
  displays,
  aspectRatio,
  sizes,
  flex,
  transforms,
  cursors,
  userSelects,
  resizes,
  appearance,
  placements,
  alignments,
  justifies,
  gaps,
  flexGridJustifiesAlignments,
  overflows,
  textOverflows,
  whitespaces,
  breaks,
  borders,
  bgColors,
  colorScheme,
  svgUtilities,
  paddings,
  textAligns,
  textIndents,
  textWraps,
  verticalAligns,
  fonts,
  textTransforms,
  fontStyles,
  textDecorations,
  fontSmoothings,
  tabSizes,
  textStrokes,
  textShadows,
  opacity,
  boxShadows,
  outline,
  rings,
  transitions,
  willChange,
  contentVisibility,
  contents,
  containerParent,

  // should be the last
  questionMark,
].flat(1)
