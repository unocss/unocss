export function searchUsageBoundary(line: string, index: number) {
  let start = index
  let end = index
  while (start && /[^\s"']/.test(line.charAt(start - 1))) --start
  while (end < line.length && /[^\s"']/.test(line.charAt(end))) ++end

  return {
    content: line.slice(start, end),
    start,
    end,
  }
}
