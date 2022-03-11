import type MagicString from 'magic-string'

export const regexClassGroup = /([!\w+:_/-]+?)([:-])\(((?:[!\w\s:/\\,%#.$-]|\[.*?\])*?)\)/gm

export function expandVariantGroup(str: string): string
export function expandVariantGroup(str: MagicString): MagicString
export function expandVariantGroup(str: string | MagicString) {
  regexClassGroup.lastIndex = 0
  return str.replace(
    regexClassGroup,
    (_, pre, sep, body: string) => {
      return body.split(/\s/g).map(i => i.replace(/^(!?)(.*)/, `$1${pre}${sep}$2`)).join(' ')
    },
  )
}
