import type { GenerateResult, ResolvedConfig, StringifiedUtil, UnoGenerator } from '@unocss/core'

const mockClasses = ['mb-1', 'mr-1', 'font-bold', 'text-lg', 'text-red-600', 'text-green-600', 'italic']

const utils: StringifiedUtil<{}>[] = mockClasses.map((name, index) => [
  index,
  name,
  '',
  undefined,
  undefined,
  undefined,
  undefined,
])

export const shortcutName = 'my-shortcut'
// @ts-expect-error config not being fully fleshed out
const config: ResolvedConfig = {
  safelist: [],
  shortcuts: [[shortcutName, 'px-1']],
}

// @ts-expect-error generator not being fully fleshed out
export const unoMock: UnoGenerator = {
  config,
  parseToken: async (token: string) => {
    const util = utils.find(([, name]) => name === token)
    if (util)
      return [util]
    return undefined
  },
  generate: async (selectors: string[]) => { return { css: selectors.join('') } as GenerateResult },
}
