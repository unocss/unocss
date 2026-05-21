export function removeOuterQuotes(input: string): string {
  if (!input)
    return ''
  return /^(['"]).*\1$/.test(input) ? input.slice(1, -1) : input
}
