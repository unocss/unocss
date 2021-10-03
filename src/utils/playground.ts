import { escapeRegExp as e, isAttributifySelector } from '.'

export function getMatchedPositions(code: string, matched: Set<string>) {
  const result: [number, number][] = []

  // hightlight for classes
  let start = 0
  code.split(/[\s"']/g).forEach((i) => {
    const end = start + i.length
    if (matched.has(i))
      result.push([start, end])
    start = end + 1
  })

  const attributify = Array.from(matched).map(isAttributifySelector).filter(Boolean) as RegExpMatchArray[]

  attributify.forEach(([, name, value]) => {
    const regex = new RegExp(`${e(name)}=(['"])[^\\1]*?${e(value)}[^\\1]*?\\1`, 'g')

    Array.from(code.matchAll(regex)).forEach((match) => {
      const start = match.index! + match[0].indexOf(value)
      const end = start + value.length
      result.push([start, end])
    })
  })

  return result
}
