export const regexClassGroup = /([!\w+:_/-]+?)([:-])\(((?:[!\w\s:/\\,%#.$-]|\[.*?\])*?)\)/gm

export function expandVariantGroup(str: string): string {
  const replaces: [number, number, string][] = []
  let match
  // eslint-disable-next-line no-cond-assign
  while ((match = regexClassGroup.exec(str))) {
    const start = match.index
    const end = start + match[0].length
    const [, pre, sep, body] = match
    const replacement = body.split(/\s/g).map(i => i.replace(/^(!?)(.*)/, `$1${pre}${sep}$2`)).join(' ')
    replaces.unshift([start, end, replacement])
  }
  let result = str
  replaces.forEach(([start, end, replacement]) => {
    result = result.slice(0, start) + replacement + result.slice(end)
  })
  return result
}
