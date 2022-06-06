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
