import { borders, borderStyles, rounded } from './border'
import { bgColors, borderColors, opacity, textColors } from './colors'
import { flex } from './flex'
import { fonts, fontSizes, fontWeights, leadings, trackings } from './font'
import { gaps } from './gap'
import { overflows } from './layouts'
import { sizes } from './size'
import { paddings, margins } from './spacing'
import { verticals, appearances, breaks, cursors, displays, pointerEvents, resizes, textAligns, textDecorations, textOverflows, textTransforms, userSelects, whitespaces } from './static'

export const defaultRules = [
  ...paddings,
  ...margins,
  ...displays,
  ...opacity,
  ...textColors,
  ...textOverflows,
  ...textDecorations,
  ...textTransforms,
  ...textAligns,
  ...bgColors,
  ...borders,
  ...borderColors,
  ...borderStyles,
  ...fonts,
  ...fontSizes,
  ...fontWeights,
  ...rounded,
  ...flex,
  ...gaps,
  ...sizes,
  ...cursors,
  ...appearances,
  ...pointerEvents,
  ...resizes,
  ...verticals,
  ...userSelects,
  ...whitespaces,
  ...breaks,
  ...trackings,
  ...leadings,
  ...overflows,
]
