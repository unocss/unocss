export function searchUsageBoundary(
  line: string,
  index: number,
  attributify = true,
  classAttributes: string[] = [],
) {
  let start = index
  let end = index

  const regex = /[^\s>"'`;]/
  while (start && regex.test(line.charAt(start - 1))) --start
  while (end < line.length && regex.test(line.charAt(end))) ++end

  if (attributify) {
    return {
      content: line.slice(start, end),
      start,
      end,
    }
  }

  let temp = start - 1
  // match class="" or className="" or custom classAttributes or @apply
  const matchClassTexts = ['class', 'className', ...classAttributes]
  const applyText = '@apply'
  while (temp > 0 && !/[="'{}><@;]/.test(line[temp--])) {
    // Continue to match attrName forward
  }
  if (line[temp + 1] === '@') {
    const data = line.slice(temp + 1, temp + applyText.length + 1)
    if (data === applyText) {
      return {
        content: line.slice(start, end),
        start,
        end,
      }
    }
  }
  if (line[temp] !== '=')
    return
  for (const matchText of matchClassTexts) {
    if (temp >= matchText.length) {
      const data = line.slice(temp - matchText.length, temp)
      if (data === matchText) {
        return {
          content: line.slice(start, end),
          start,
          end,
        }
      }
    }
  }
}

export function searchAttrKey(content: string, cursor: number) {
  const text = content.substring(0, cursor)
  if (/<\w[^>]*$/.test(text))
    // eslint-disable-next-line regexp/no-super-linear-backtracking
    return text.match(/\S+(?=\s*=(?:\s*["'])?[^"']*$)/)?.[0]
}

export function cartesian<T>(arr: T[][]): T[][] {
  return arr.reduce(
    (a, b) => {
      const ret: T[][] = []
      a.forEach((a) => {
        b.forEach((b) => {
          ret.push(a.concat([b]))
        })
      })
      return ret
    },
    [[]] as T[][],
  )
}
