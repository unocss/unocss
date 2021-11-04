import { Rule } from 'unocss'
import { transitions } from './transition'
import { borders } from './border'
import { bgColors, opacity, textColors, textDecorationColors, textStrokeColors } from './color'
import { bgAttachments, bgBlendModes, bgClips, bgGradients, bgImages, bgOrigins, bgPositions, bgSizes, bgRepeats } from './background'
import { filters } from './filters'
import { flex } from './flex'
import { fonts, leadings, tabSizes, textDecorationLengths, textDecorationOffsets, textIndents, textStrokeWidths, trackings } from './typography'
import { gaps } from './gap'
import { grids } from './grid'
import { overflows } from './layout'
import { alignContents, alignItems, alignSelfs, floats, insets, justifies, justifyItems, justifySelfs, objectPositions, boxSizing, orders, placeContents, placeItems, placeSelfs, positions, zIndexes } from './position'
import { rings } from './ring'
import { mixBlendModes, shadows } from './shadow'
import { sizes } from './size'
import { paddings, margins } from './spacing'
import { verticalAligns, appearances, breaks, cursors, displays, pointerEvents, resizes, textAligns, textDecorations, textOverflows, textTransforms, userSelects, whitespaces, fontStyles, fontSmoothings, hyphens, textDecorationStyles, writingModes, writingOrientations } from './static'
import { tables } from './table'
import { transforms } from './transform'
import { listStyle, caretColors, boxDecorationBreaks, caretOpacity, imageRenderings, appearance, placeholder, overscrolls, outline } from './behaviors'
import { animations } from './animation'
import { cssVariables } from './variables'

export const rules: Rule[] = [
  cssVariables,
  paddings,
  margins,
  displays,
  opacity,
  bgAttachments,
  bgBlendModes,
  bgClips,
  bgColors,
  bgGradients,
  bgImages,
  bgOrigins,
  bgPositions,
  bgSizes,
  bgRepeats,
  borders,
  fonts,
  tabSizes,
  textIndents,
  textOverflows,
  textDecorations,
  textDecorationStyles,
  textDecorationColors,
  textDecorationLengths,
  textDecorationOffsets,
  textStrokeWidths,
  textStrokeColors,
  textTransforms,
  textAligns,
  textColors,
  fontStyles,
  fontSmoothings,
  hyphens,
  writingModes,
  writingOrientations,
  mixBlendModes,
  shadows,
  rings,
  flex,
  grids,
  gaps,
  positions,
  sizes,
  cursors,
  appearances,
  pointerEvents,
  resizes,
  verticalAligns,
  userSelects,
  whitespaces,
  listStyle,
  caretColors,
  boxDecorationBreaks,
  caretOpacity,
  imageRenderings,
  appearance,
  outline,
  placeholder,
  overscrolls,
  breaks,
  trackings,
  leadings,
  overflows,
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
  animations,
  insets,
  floats,
  zIndexes,
  objectPositions,
  boxSizing,
  transitions,
  filters,
  tables,
  transforms,
].flat(1)
