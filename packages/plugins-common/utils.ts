import { escapeRegExp as e, isAttributifySelector } from '@unocss/core'

export function getPath(id: string) {
  return id.replace(/\?.*$/, '')
}

// https://github.com/dsblv/string-replace-async/blob/main/index.js
export function replaceAsync(string: string, searchValue: RegExp, replacer: (...args: string[]) => Promise<string>) {
  try {
    if (typeof replacer === 'function') {
      const values: Promise<string>[] = []
      String.prototype.replace.call(string, searchValue, (...args) => {
        values.push(replacer(...args))
        return ''
      })
      return Promise.all(values).then((resolvedValues) => {
        return String.prototype.replace.call(string, searchValue, () => {
          return resolvedValues.shift() || ''
        })
      })
    }
    else {
      return Promise.resolve(
        String.prototype.replace.call(string, searchValue, replacer),
      )
    }
  }
  catch (error) {
    return Promise.reject(error)
  }
}

export function getMatchedPositions(code: string, matched: string[]) {
  const result: [number, number, string][] = []
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
      result.push([start, end, i])
    start = end + 1
  })

  // attributify values
  attributify.forEach(([, name, value]) => {
    const regex = new RegExp(`(${e(name)}=)(['"])[^\\2]*?${e(value)}[^\\2]*?\\2`, 'g')
    Array.from(code.matchAll(regex))
      .forEach((match) => {
        const escaped = match[1]
        const body = match[0].slice(escaped.length)
        const bodyIndex = body.indexOf(value)
        if (bodyIndex < 0)
          return
        const start = match.index! + escaped.length + bodyIndex
        const end = start + value.length
        result.push([start, end, `[${name}="${value}"]`])
      })
  })

  return result
}
