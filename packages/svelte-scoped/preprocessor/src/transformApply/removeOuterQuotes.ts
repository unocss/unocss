export function removeOuterQuotes(input: string): string {
  if (!input)
    return ''
  const match = input.match(/^(['"]).*\1$/)
  return match ? input.slice(1, -1) : input
}
