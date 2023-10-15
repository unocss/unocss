import type { Shortcut } from '@unocss/core'
import type { Theme } from '@unocss/preset-mini'

export const mediaHover: Shortcut<Theme>[] = [
  [/^(group|peer|parent|previous)-mouse-hover\b(.+)$/, ([, tag, rest]) => `${tag}-hover:media-mouse${rest}`],
]
