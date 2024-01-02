import type { Rule } from '@unocss/core'
import * as _ from '@unocss/preset-mini/rules'
import type { Theme } from '@unocss/preset-mini'
import { container } from './container'
import { backgroundStyles } from './background'
import { filters } from './filters'
import { spaces } from './spacing'
import { backgroundBlendModes, dynamicViewportHeight, hyphens, isolations, mixBlendModes, objectPositions, screenReadersAccess, textTransforms, writingModes, writingOrientations } from './static'
import { tables } from './table'
import { accents, carets, imageRenderings, listStyle, overscrolls, scrollBehaviors } from './behaviors'
import { animations } from './animation'
import { cssVariables } from './variables'
import { divides } from './divide'
import { lineClamps } from './line-clamp'
import { fontVariantNumeric } from './typography'
import { touchActions } from './touch-actions'
import { scrolls } from './scrolls'
import { columns } from './columns'
import { placeholders } from './placeholder'
import { viewTransition } from './view-transition'

// _. indicates that the rule is from @unocss/preset-mini

export const rules: Rule<Theme>[] = [
  _.cssVariables,
  cssVariables,
  _.cssProperty,
  container,
  _.contains,
  screenReadersAccess,
  _.pointerEvents,
  _.appearances,
  _.positions,
  _.insets,
  lineClamps,
  isolations,
  _.zIndexes,
  _.orders,
  _.grids,
  _.floats,
  _.margins,
  _.boxSizing,
  _.displays,
  _.aspectRatio,
  _.sizes,
  _.flex,
  tables,
  _.transforms,
  animations,
  _.cursors,
  touchActions,
  _.userSelects,
  _.resizes,
  scrolls,
  listStyle,
  _.appearance,
  columns,
  _.placements,
  _.alignments,
  _.justifies,
  _.gaps,
  _.flexGridJustifiesAlignments,
  spaces,
  divides,
  _.overflows,
  overscrolls,
  scrollBehaviors,
  _.textOverflows,
  _.whitespaces,
  _.breaks,
  _.borders,
  _.bgColors,
  backgroundStyles,
  _.svgUtilities,
  objectPositions,
  _.paddings,
  _.textAligns,
  _.textIndents,
  _.textWraps,
  _.verticalAligns,
  _.fonts,
  _.textTransforms,
  textTransforms,
  _.fontStyles,
  fontVariantNumeric,
  _.textDecorations,
  _.fontSmoothings,
  _.tabSizes,
  _.textStrokes,
  _.textShadows,
  hyphens,
  writingModes,
  writingOrientations,
  carets,
  accents,
  _.opacity,
  backgroundBlendModes,
  mixBlendModes,
  _.boxShadows,
  _.outline,
  _.rings,
  imageRenderings,
  filters,
  _.transitions,
  _.willChange,
  _.contentVisibility,
  _.contents,
  placeholders,
  _.containerParent,
  viewTransition,
  dynamicViewportHeight,

  // should be the last
  _.questionMark,
].flat(1)
