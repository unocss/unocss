import { NanowindVariant } from '../..'

export const darkClass: NanowindVariant = {
  match: input => input.startsWith('dark:') ? input.slice(5) : undefined,
  selector: input => `.dark ${input}`,
}

export const lightClass: NanowindVariant = {
  match: input => input.startsWith('light:') ? input.slice(6) : undefined,
  selector: input => `.light ${input}`,
}

export const darkMedia: NanowindVariant = {
  match: input => input.startsWith('dark:') ? input.slice(5) : undefined,
  mediaQuery: () => '@media (prefers-color-scheme: dark)',
}

export const lightMedia: NanowindVariant = {
  match: input => input.startsWith('light:') ? input.slice(6) : undefined,
  mediaQuery: () => '@media (prefers-color-scheme: light)',
}
