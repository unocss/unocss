import type { Rule } from '@unocss/core'
import { transitions } from './transition'
import { borders } from './border'
import { bgColors, opacity, textColors } from './color'
import { flex } from './flex'
import { fonts, tabSizes, textIndents, textShadows, textStrokes } from './typography'
import { gaps } from './gap'
import { grids } from './grid'
import { overflows } from './layout'
import { alignments, floats, insets, justifies, boxSizing, orders, placements, positions, zIndexes } from './position'
import { rings } from './ring'
import { boxShadows } from './shadow'
import { sizes, aspectRatio } from './size'
import { paddings, margins } from './spacing'
import { appearances, breaks, cursors, displays, pointerEvents, resizes, textOverflows, textTransforms, userSelects, whitespaces, fontStyles, fontSmoothings, contents } from './static'
import { transforms } from './transform'
import { cssVariables } from './variables'
import { questionMark } from './question-mark'
import { textAligns, verticalAligns } from './align'
import { appearance, outline, placeholder, willChange } from './behaviors'
import { textDecorations } from './decoration'
import { svgUtilities } from './svg'

export const rules: Rule[] = [
  cssVariables,
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
  placeholder,
  positions,
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
