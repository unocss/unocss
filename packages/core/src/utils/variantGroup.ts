import type MagicString from 'magic-string'

export const regexClassGroup = /([!\w+:_/-]+?)([:-])\(((?:[~!\w\s:/\\,%#.$-]|\[.*?\])*?)\)/gm

export function expandVariantGroup(str: string): string
export function expandVariantGroup(str: MagicString): MagicString
export function expandVariantGroup(str: string | MagicString) {
  regexClassGroup.lastIndex = 0
  let hasChanged = false
  let content = str.toString()
  do {
    const before = content
    content = content.replace(
      regexClassGroup,
      (_, pre, sep, body: string) => {
        return body
          .split(/\s/g)
          .map(i => i === '~' ? pre : i.replace(/^(!?)(.*)/, `$1${pre}${sep}$2`))
          .join(' ')
      },
    )
    hasChanged = content !== before
  } while (hasChanged)

  if (typeof str === 'string')
    return content
  else
    return str.overwrite(0, str.length(), content)
}
