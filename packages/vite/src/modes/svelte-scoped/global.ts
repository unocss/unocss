import type { UnoGenerator } from '@unocss/core'

export function isServerHooksFile(path: string) {
  return path.includes('hooks.server.js') || path.includes('hooks.server.ts')
}

export async function replacePlaceholderWithPreflightsAndSafelist(uno: UnoGenerator, code: string) {
  const { css } = await uno.generate('', { preflights: true, safelist: true, minify: true })
  return {
    code: code.replace('__UnoCSS_Svelte_Scoped_global_styles__', `<style>${css}</style>`),
  }
}
