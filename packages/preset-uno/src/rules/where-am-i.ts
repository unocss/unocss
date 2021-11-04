import { Rule } from '@unocss/core'

export const whereAmI = (debug: boolean): Rule => {
  const animation0 = 'box-shadow: inset 4px 4px rgb(236, 15, 170), inset -4px -4px rgb(236, 15, 170);'
  const animation100 = 'box-shadow: inset 8px 8px rgb(236, 15, 170), inset -8px -8px rgb(236, 15, 170);'
  return [/^(wai)$/, (ignore, { constructCSS }) => {
    return debug
      ? `@keyframes un-wai {0% {${animation0}} 100% {${animation100}}}\n${constructCSS({ animation: 'un-wai 0.5s ease-in-out alternate infinite' })}`
      : undefined
  }]
}
