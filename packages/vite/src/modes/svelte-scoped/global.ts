import type { UnoGenerator } from '@unocss/core'

export function isServerHooksFile(path: string, svelteConfig: any) {
  const hooksFile = (svelteConfig?.kit?.files?.hooks?.server) ?? 'src/hooks.server'
  return path.includes(hooksFile)
}

export async function replacePlaceholderWithPreflightsAndSafelist(uno: UnoGenerator, code: string) {
  const { css } = await uno.generate('', { preflights: true, safelist: true, minify: true })
  return {
    code: code.replace('__UnoCSS_Svelte_Scoped_global_styles__', `<style>${css.replaceAll(/'/g, '\'')}</style>`),
  }
}
