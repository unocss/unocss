import type { UserConfig } from '@unocss/core'

export function deprecationCheck(config: UserConfig) {
  let warned = false

  function warn(msg: string) {
    warned = true
    console.warn(`[unocss] ${msg}`)
  }

  if (config.include)
    warn('`include` option is deprecated, use `content.pipeline.include` instead.')

  if (config.exclude)
    warn('`exclude` option is deprecated, use `content.pipeline.exclude` instead.')

  if (config.extraContent)
    warn('`extraContent` option is deprecated, use `content` instead.')

  if (config.content?.plain)
    warn('`content.plain` option is renamed to `content.inline`.')

  // eslint-disable-next-line node/prefer-global/process
  if (warned && typeof process !== 'undefined' && process.env.CI)
    throw new Error('deprecation warning')
}
