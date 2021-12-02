import { Rule } from '@unocss/core'
import { container } from './container'
import { bgAttachments, bgBlendModes, bgClips, bgGradients, bgImages, bgOrigins, bgPositions, bgSizes, bgRepeats } from './background'
import { filters } from './filters'
import { mixBlendModes } from './shadow'
import { spaces } from './spacing'
import { screenReadersAccess, textTransforms, hyphens, writingModes, writingOrientations, isolations, objectPositions } from './static'
import { tables } from './table'
import { listStyle, caretColors, boxDecorationBreaks, caretOpacity, imageRenderings, overscrolls } from './behaviors'
import { animations } from './animation'
import { cssVariables } from './variables'
import { divides } from './divide'
import { lineClamps } from './line-clamp'
import { fontVariantNumeric } from './typography'

export const rules: Rule[] = [
  screenReadersAccess,
  cssVariables,
  spaces,
  lineClamps,
  isolations,
  container,
  bgAttachments,
  bgBlendModes,
  bgClips,
  bgGradients,
  bgImages,
  bgOrigins,
  bgPositions,
  bgSizes,
  bgRepeats,
  divides,
  textTransforms,
  hyphens,
  writingModes,
  writingOrientations,
  mixBlendModes,
  listStyle,
  caretColors,
  boxDecorationBreaks,
  caretOpacity,
  imageRenderings,
  overscrolls,
  fontVariantNumeric,
  objectPositions,
  animations,
  filters,
  tables,
].flat(1)
