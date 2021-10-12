import { BetterMap, UnoGenerator } from 'unocss'
import { UnocssUserOptions } from './types'

export function createContext(
  uno: UnoGenerator,
  config: UnocssUserOptions,
  configFilepath?: string,
) {
  const invalidations: Array<() => void> = []

  const modules = new BetterMap<string, string>()
  const tokens = new Set<string>()

  function invalidate() {
    invalidations.forEach(cb => cb())
  }

  async function scan(code: string, id?: string) {
    if (id)
      modules.set(id, code)
    await uno.applyExtractors(code, id, tokens)
    invalidate()
  }

  return {
    tokens,
    modules,
    invalidate,
    onInvalidate(fn: () => void) {
      invalidations.push(fn)
    },
    uno,
    scan,
    config,
    configFilepath,
  }
}

export type Context = ReturnType<typeof createContext>
