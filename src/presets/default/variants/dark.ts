import { MiniwindVariant } from '../../../types'

export const variantColorsClass: MiniwindVariant[] = [
  {
    match: input => input.startsWith('dark:') ? input.slice(5) : undefined,
    selector: input => `.dark $$ ${input}`,
  },
  {
    match: input => input.startsWith('light:') ? input.slice(6) : undefined,
    selector: input => `.light $$ ${input}`,
  },
]

export const variantColorsMedia: MiniwindVariant[] = [
  {
    match: input => input.startsWith('dark:') ? input.slice(5) : undefined,
    mediaQuery: () => '@media (prefers-color-scheme: dark)',
  },
  {
    match: input => input.startsWith('light:') ? input.slice(6) : undefined,
    mediaQuery: () => '@media (prefers-color-scheme: light)',
  },
]
