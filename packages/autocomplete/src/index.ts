import type { UnoGenerator } from '@unocss/core'

export function createAutocomplete(uno: UnoGenerator) {
  function suggest(input: string) {
    return [
      input,
    ]
  }

  return {
    suggest,
  }
}
