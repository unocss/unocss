import { escapeRegExp as e, isAttributifySelector } from '@unocss/core'

export function getMatchedPositions(code: string, matched: string[]) {
  const result: [number, number][] = []

  const attributify: RegExpMatchArray[] = []
  const plain = new Set<string>()

  Array.from(matched)
    .forEach((v) => {
      const match = isAttributifySelector(v)
      if (!match)
        plain.add(v)
      else if (!match[2])
        plain.add(match[1])
      else
        attributify.push(match)
    })

  // hightlight for plain classes
  let start = 0
  code.split(/[\s"';<>]/g).forEach((i) => {
    const end = start + i.length
    if (plain.has(i))
      result.push([start, end])
    start = end + 1
  })

  // attributify values
  attributify.forEach(([, name, value]) => {
    const regex = new RegExp(`${e(name)}=(['"])[^\\1]*?${e(value)}[^\\1]*?\\1`, 'g')
    Array.from(code.matchAll(regex))
      .forEach((match) => {
        const start = match.index! + match[0].indexOf(value)
        const end = start + value.length
        result.push([start, end])
      })
  })

  return result
}
