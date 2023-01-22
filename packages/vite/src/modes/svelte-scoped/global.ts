import type { UnoGenerator } from '@unocss/core'
import type { Config } from '@sveltejs/kit'
import { GLOBAL_STYLES_PLACEHOLDER } from './constants'

export function isServerHooksFile(path: string, svelteConfig: Config) {
  const hooksFilepath = (svelteConfig?.kit?.files?.hooks?.server) || 'src/hooks.server'
  return path.includes(hooksFilepath)
}

export async function replacePlaceholderWithPreflightsAndSafelist(uno: UnoGenerator, code: string) {
  const css = await generateGlobalCss(uno)
  return {
    code: code.replace(GLOBAL_STYLES_PLACEHOLDER, `<style>${css.replaceAll(/'/g, '\'')}</style>`),
  }
}

export async function generateGlobalCss(uno: UnoGenerator): Promise<string> {
  const { css } = await uno.generate('', { preflights: true, safelist: true, minify: true })
  return css
}
