import { Rule } from 'unocss'
import { transitions } from './transition'
import { borders } from './border'
import { bgColors, opacity, textColors } from './color'
import { bgAttachments, bgBlendModes, bgClips, bgGradients, bgImages, bgOrigins, bgPositions, bgSizes, bgRepeats } from './background'
import { filters } from './filters'
import { flex } from './flex'
import { fonts, leadings, trackings } from './font'
import { gaps } from './gap'
import { grids } from './grid'
import { overflows } from './layout'
import { alignContents, alignItems, alignSelfs, floats, insets, justifies, justifyItems, justifySelfs, objectPositions, orders, placeContents, placeItems, placeSelfs, positions, zIndexes } from './position'
import { rings } from './ring'
import { shadows } from './shadow'
import { sizes } from './size'
import { paddings, margins } from './spacing'
import { verticalAligns, appearances, breaks, cursors, displays, pointerEvents, resizes, textAligns, textDecorations, textOverflows, textTransforms, userSelects, whitespaces } from './static'
import { tables } from './table'
import { transforms } from './transform'

export const rules: Rule[] = [
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
  textOverflows,
  textDecorations,
  textTransforms,
  textAligns,
  textColors,
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
  insets,
  floats,
  zIndexes,
  objectPositions,
  transitions,
  filters,
  tables,
  transforms,
].flat(1)
