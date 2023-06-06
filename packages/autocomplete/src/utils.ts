export function searchUsageBoundary(line: string, index: number) {
  let start = index
  let end = index

  const regex = /[^\s>"'`;]/
  while (start && regex.test(line.charAt(start - 1))) --start
  while (end < line.length && regex.test(line.charAt(end))) ++end

  return {
    content: line.slice(start, end),
    start,
    end,
  }
}

export function searchAttrKey(content: string, cursor: number) {
  const text = content.substring(0, cursor)
  if (text.match(/(<\w+\s*)[^>]*$/) !== null)
    return text.match(/\S+(?=\s*=\s*["']?[^"']*$)/)?.[0]
}
