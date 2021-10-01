import { borders, rounded } from './border'
import { bgColors, borderColors, textColors } from './colors'
import { flex } from './flex'
import { fonts, fontSizes } from './font'
import { gaps } from './gap'
import { opacity } from './opacity'
import { sizes } from './size'
import { paddings, margins } from './spacing'
import { displays } from './static'

export const defaultRules = [
  ...paddings,
  ...margins,
  ...displays,
  ...opacity,
  ...borders,
  ...textColors,
  ...bgColors,
  ...borderColors,
  ...fonts,
  ...fontSizes,
  ...rounded,
  ...flex,
  ...gaps,
  ...sizes,
]
