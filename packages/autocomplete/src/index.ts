import type { UnoGenerator } from '@unocss/core'

export function createAutocomplete(uno: UnoGenerator) {
  const staticUtils = Object.keys(uno.config.rulesStaticMap)

  async function suggest(input: string) {
    const results: string[] = []

    await uno.parseToken(input, '-').then((i) => {
      if (i)
        results.push(input)
    })

    results.push(
      ...staticUtils.filter(i => i.startsWith(input)),
    )

    return results
  }

  return {
    suggest,
  }
}
