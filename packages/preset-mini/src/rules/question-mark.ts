import type { Rule } from '@unocss/core'

/**
 * Used for debugging, only avaliable in development mode.
 *
 * @example `?` / `where`
 */
export const questionMark: Rule[] = [
  [
    /^(where|\?)$/, (_, { constructCSS, generator }) => {
      if (generator.userConfig.envMode === 'dev')
        return `@keyframes __un_qm{0%{box-shadow:inset 4px 4px #ff1e90, inset -4px -4px #ff1e90}100%{box-shadow:inset 8px 8px #3399ff, inset -8px -8px #3399ff}}\n${constructCSS({ animation: '__un_qm 0.5s ease-in-out alternate infinite' })}`
    },
  ],
]
