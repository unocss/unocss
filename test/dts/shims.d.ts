import type { AttributifyAttributes } from '@unocss/preset-attributify'

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface HTMLAttributes<T> extends AttributifyAttributes {}
}
