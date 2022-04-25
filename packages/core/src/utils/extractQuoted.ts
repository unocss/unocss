export type Range = [start: number, end: number]

export interface ExtractStringOptions<Details extends boolean = false> {
  deep?: boolean
  templateStaticOnly?: boolean
  details?: Details
  range?: Range
}

export interface DetailString {
  value: string
  range: Range
  quote: '\'' | '"' | '`'
}

export function matchingPair(
  text: string,
  [left, right]: Iterable<string>,
  i: number,
  allowEscape?: boolean,
) {
  const len = text.length
  let stack = +(text[i] === left)
  while (++i < len) {
    const char = text[i]
    if (char === left) {
      stack++
    }
    else if (char === right) {
      stack--
      if (stack === 0)
        return i
    }
    else if (allowEscape && char === '\\') {
      i++
    }
  }
  return -1
}

const QUOTES = ['\'', '"', '`'] as const

export function extractQuoted(str: string, options?: ExtractStringOptions<false>): string[]
export function extractQuoted(str: string, options: ExtractStringOptions<true>): DetailString[]
export function extractQuoted(
  str: string,
  options: ExtractStringOptions<boolean> = {},
): any[] {
  const {
    deep = false,
    templateStaticOnly = false,
    details = false,
    range: [rstart, rend] = [0, str.length],
  } = options

  const result: (string | DetailString)[] = []
  let quote: DetailString['quote']
  const addResult = (start: number, end: number) => result.push(
    details
      ? {
          value: str.slice(start, end),
          range: [start, end],
          quote,
        }
      : str.slice(start, end),
  )

  let i = rstart
  while (i < rend) {
    const char = str[i]
    if ((QUOTES.includes as (c: string) => c is typeof quote)(char)) {
      quote = char
      const start = i + 1
      const isTemplate = quote === '`'
      let templateStart = start
      let end = start
      while (end < rend) {
        const nextChar = str[end]
        if (nextChar === quote) {
          if (isTemplate && templateStaticOnly) {
            addResult(templateStart, end)
            break
          }
          addResult(start, end)
          break
        }
        if (nextChar === '\\') {
          end += 2
        }
        else if (isTemplate && nextChar === '$' && str[end + 1] === '{') {
          const nestStart = end + 2
          end = matchingPair(str, '{}', end + 1, true)
          if (templateStaticOnly) {
            addResult(
              templateStart,
              nestStart - 2,
            )
          }
          templateStart = end + 1
          if (deep) {
            result.push(
              ...extractQuoted(
                str,
                {
                  ...options,
                  range: [nestStart, end],
                } as ExtractStringOptions<any>,
              ),
            )
          }
        }
        else {
          end += 1
        }
      }
      i = end + 1
    }
    else {
      i++
    }
  }

  return result
}
