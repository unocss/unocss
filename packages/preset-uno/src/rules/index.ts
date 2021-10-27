import { Rule } from 'unocss'
import { transitions } from './animations'
import { borders, borderStyles, borderRadius } from './border'
import { bgColors, borderColors, opacity, textColors } from './colors'
import { filters } from './filters'
import { flex } from './flex'
import { fonts, fontSizes, fontWeights, leadings, trackings } from './font'
import { gaps } from './gap'
import { grids } from './grid'
import { overflows } from './layouts'
import { alignContents, alignItems, alignSelfs, floats, insets, justifies, justifyItems, justifySelfs, objectPositions, orders, placeContents, placeItems, placeSelfs, positions, zIndexes } from './positions'
import { shadows } from './shadows'
import { sizes } from './size'
import { paddings, margins } from './spacing'
import { verticalAligns, appearances, breaks, cursors, displays, pointerEvents, resizes, textAligns, textDecorations, textOverflows, textTransforms, userSelects, whitespaces } from './static'
import { transforms } from './transform'

export const rules: Rule[] = [
  paddings,
  margins,
  displays,
  opacity,
  bgColors,
  borders,
  borderColors,
  borderStyles,
  borderRadius,
  fonts,
  fontSizes,
  fontWeights,
  textOverflows,
  textDecorations,
  textTransforms,
  textAligns,
  textColors,
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
  breaks,
  trackings,
  leadings,
  overflows,
  positions,
  orders,
  shadows,
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
  objectPositions,
  transitions,
  filters,
  transforms,
].flat(1)
