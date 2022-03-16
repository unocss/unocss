import type { UnoGenerator } from '@unocss/core'

export function createAutocomplete(uno: UnoGenerator) {
  const staticUtils = Object.keys(uno.config.rulesStaticMap)

  async function suggest(input: string) {
    return await Promise.all([
      suggestSelf(input),
      suggestStatic(input),
      suggestDynamic(input),
    ]).then(i => i.flat())
  }

  async function suggestSelf(input: string) {
    const i = await uno.parseToken(input, '-')
    return i ? [input] : []
  }

  async function suggestStatic(input: string) {
    return staticUtils.filter(i => i.startsWith(input))
  }

  async function suggestDynamic(input: string) {
    return [] // TODO:
  }

  return {
    suggest,
  }
}
