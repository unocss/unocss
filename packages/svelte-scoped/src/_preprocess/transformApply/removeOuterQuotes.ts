export function removeOuterQuotes(input: string): string {
  if (!input)
    return ''
  return /^(['"]).*\1$/.test(input) ? input.slice(1, -1) : input
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest

  describe('removeOuterQuotes', () => {
    it('removes single quotes', () => {
      expect(removeOuterQuotes('\'hello\'')).toBe('hello')
    })

    it('removes double quotes', () => {
      expect(removeOuterQuotes('"hello"')).toBe('hello')
    })

    it('pass through normal', () => {
      expect(removeOuterQuotes('hello')).toBe('hello')
    })

    it('handles null', () => {
      expect(removeOuterQuotes(null as unknown as string)).toBe('')
    })
  })
}
