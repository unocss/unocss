// this file is only needed if you use `@unocss/preset-attributify`
import type { AttributifyAttributes } from '@unocss/preset-attributify'

declare module 'react' {

  interface HTMLAttributes extends AttributifyAttributes { }
}
