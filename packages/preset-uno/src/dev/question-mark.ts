import { Rule } from '@unocss/core'

export const questionMark: Rule = [
  /^(\?)$/, (_, { constructCSS }) => {
    return `@keyframes __un_qm {0% {box-shadow: inset 4px 4px rgb(236, 15, 170), inset -4px -4px rgb(236, 15, 170);} 100% {box-shadow: inset 8px 8px rgb(236, 15, 170), inset -8px -8px rgb(236, 15, 170);}}\n${constructCSS({ animation: '__un_qm 0.5s ease-in-out alternate infinite' })}`
  },
]
