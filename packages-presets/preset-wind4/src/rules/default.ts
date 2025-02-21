import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { textAligns, verticalAligns } from './align'
import { animations } from './animation'
import { backgroundStyles } from './background'
import { accents, appearance, carets, imageRenderings, listStyle, outline, overscrolls, scrollBehaviors, willChange } from './behaviors'
import { borders } from './border'
import { bgColors, colorScheme, opacity } from './color'
import { columns } from './columns'
import { container, containerParent } from './container'
import { textDecorations } from './decoration'
import { divides } from './divide'
import { filters } from './filters'
import { flex } from './flex'
import { gaps } from './gap'
import { grids } from './grid'
import { overflows } from './layout'
import { lineClamps } from './line-clamp'
import { placeholders } from './placeholder'
import { alignments, boxSizing, flexGridJustifiesAlignments, floats, insets, justifies, orders, placements, positions, zIndexes } from './position'
import { questionMark } from './question-mark'
import { rings } from './ring'
import { scrolls } from './scrolls'
import { boxShadows } from './shadow'
import { aspectRatio, sizes } from './size'
import { margins, paddings, spaces } from './spacing'
import { appearances, backgroundBlendModes, breaks, contains, contents, contentVisibility, cursors, displays, dynamicViewportHeight, fontSmoothings, fontStyles, hyphens, isolations, mixBlendModes, objectPositions, pointerEvents, resizes, screenReadersAccess, textOverflows, textTransforms, textWraps, userSelects, whitespaces, writingModes, writingOrientations } from './static'
import { svgUtilities } from './svg'
import { tables } from './table'
import { touchActions } from './touch-actions'
import { transforms } from './transform'
import { transitions } from './transition'
import { fonts, fontVariantNumeric, tabSizes, textIndents, textShadows, textStrokes } from './typography'
import { cssProperty, cssVariables } from './variables'
import { viewTransition } from './view-transition'

export const rules: Rule<Theme>[] = [
  fonts,
  tabSizes,
  textIndents,
  textStrokes,
  textShadows,
  margins,
  paddings,
  textAligns,
  verticalAligns,
  appearance,
  outline,
  willChange,
  listStyle,
  accents,
  carets,
  imageRenderings,
  overscrolls,
  outline,
  scrollBehaviors,
  willChange,

  borders,
  bgColors,
  opacity,
  colorScheme,
  container,
  containerParent,
  textDecorations,
  flex,
  gaps,
  grids,
  sizes,
  aspectRatio,
  displays,
  appearances,
  cursors,
  contains,
  pointerEvents,
  resizes,
  userSelects,
  whitespaces,
  contentVisibility,
  contents,
  breaks,
  textWraps,
  textOverflows,
  textTransforms,
  fontStyles,
  fontSmoothings,
  rings,
  boxShadows,
  transforms,
  transitions,
  cssVariables,
  cssProperty,
  alignments,
  boxSizing,
  flexGridJustifiesAlignments,
  floats,
  insets,
  justifies,
  orders,
  placements,
  positions,
  zIndexes,
  overflows,
  svgUtilities,
  animations,
  backgroundStyles,
  hyphens,
  writingModes,
  writingOrientations,
  screenReadersAccess,
  isolations,
  objectPositions,
  backgroundBlendModes,
  mixBlendModes,
  dynamicViewportHeight,

  columns,
  filters,
  lineClamps,
  placeholders,
  scrolls,
  tables,
  touchActions,
  fontVariantNumeric,
  viewTransition,
  questionMark,
  spaces,
  divides,
].flat()
