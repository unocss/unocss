import type { UnoGenerator } from '@unocss/core'
import type { UnocssSvelteScopedViteOptions } from './types'
import { getReset } from './getReset'

export async function generateGlobalCss(uno: UnoGenerator, injectReset?: UnocssSvelteScopedViteOptions['injectReset']): Promise<string> {
  const { css } = await uno.generate('', { preflights: true, safelist: true, minify: true })
  const reset = injectReset ? getReset(injectReset) : ''
  return reset + css
}
