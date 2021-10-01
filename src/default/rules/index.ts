import { borders, rounded } from './border'
import { bgColors, borderColors, textColors } from './colors'
import { fonts } from './font'
import { opacity } from './opacity'
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
  ...rounded,
]
