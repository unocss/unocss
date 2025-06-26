/* eslint-disable unused-imports/no-unused-vars */
import type { UserConfig } from '@unocss/core'

export function deprecationCheck(config: UserConfig) {
  let warned = false

  function warn(msg: string) {
    warned = true
    console.warn(`[unocss] ${msg}`)
  }

  // eslint-disable-next-line node/prefer-global/process
  if (warned && typeof process !== 'undefined' && process.env.CI)
    throw new Error('deprecation warning')
}
