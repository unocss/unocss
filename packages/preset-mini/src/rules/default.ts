import { Rule } from '@unocss/core'
import { transitions } from './transition'
import { borders } from './border'
import { bgColors, opacity, textColors, textDecorationColors, textStrokeColors, fillColors } from './color'
import { flex } from './flex'
import { fonts, leadings, tabSizes, textIndents, textShadows, textStrokeWidths, trackings, wordSpacings } from './typography'
import { gaps } from './gap'
import { grids } from './grid'
import { overflows } from './layout'
import { alignContents, alignItems, alignSelfs, floats, insets, justifies, justifyItems, justifySelfs, boxSizing, orders, placeContents, placeItems, placeSelfs, positions, zIndexes } from './position'
import { rings } from './ring'
import { boxShadows } from './shadow'
import { sizes, aspectRatio } from './size'
import { paddings, margins } from './spacing'
import { appearances, breaks, cursors, displays, pointerEvents, resizes, textOverflows, textTransforms, userSelects, whitespaces, fontStyles, fontSmoothings, contents } from './static'
import { transforms } from './transform'
import { cssVariables } from './variables'
import { questionMark } from './question-mark'
import { textAligns, verticalAligns } from './align'
import { appearance, outline, placeholder } from './behaviors'
import { textDecorations } from './decoration'

export const rules: Rule[] = [
  cssVariables,
  paddings,
  margins,
  displays,
  opacity,
  bgColors,
  fillColors,
  borders,
  contents,
  fonts,
  tabSizes,
  textIndents,
  textOverflows,
  textDecorations,
  textDecorationColors,
  textStrokeWidths,
  textStrokeColors,
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
  trackings,
  wordSpacings,
  leadings,
  overflows,
  outline,
  appearance,
  placeholder,
  positions,
  orders,
  justifies,
  justifyItems,
  justifySelfs,
  alignContents,
  alignItems,
  alignSelfs,
  placeContents,
  placeItems,
  placeSelfs,
  insets,
  floats,
  zIndexes,
  boxSizing,
  transitions,
  transforms,

  // should be the last
  questionMark,
].flat(1)
