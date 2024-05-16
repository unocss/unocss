export function searchUsageBoundary(
  line: string,
  index: number,
  attributify = true,
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
  // match class="" or className=""
  const matchClassText = 'class'
  const matchClassNameText = 'className'
  while (temp > matchClassText.length && !/[="{}><]/.test(line[temp--])) {
    // Continue to match attrName forward
  }
  if (line[temp] !== '=')
    return
  if (temp > matchClassNameText.length) {
    const data = line.slice(temp - matchClassNameText.length, temp)
    if (data === matchClassNameText) {
      return {
        content: line.slice(start, end),
        start,
        end,
      }
    }
  }
  if (temp > matchClassText.length) {
    const data = line.slice(temp - matchClassText.length, temp)
    if (data === matchClassText) {
      return {
        content: line.slice(start, end),
        start,
        end,
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
