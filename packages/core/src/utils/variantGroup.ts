import type MagicString from 'magic-string'

export const regexClassGroup = /([!\w+:_/-]+?)([:-])\(((?:[~!\w\s:/\\,%#.$-]|\[.*?\])*?)\)/gm

export function expandVariantGroup(str: string, seperators?: ('-' | ':')[]): string
export function expandVariantGroup(str: MagicString, seperators?: ('-' | ':')[]): MagicString
export function expandVariantGroup(str: string | MagicString, seperators: ('-' | ':')[] = ['-', ':']) {
  regexClassGroup.lastIndex = 0
  let hasChanged = false
  let content = str.toString()
  do {
    const before = content
    content = content.replace(
      regexClassGroup,
      (from, pre, sep, body: string) => {
        if (!seperators.includes(sep))
          return from
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
