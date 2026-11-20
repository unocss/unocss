import type { Plugin } from 'vite'
import { resolveConfig } from 'vite'
import { describe, expect, it } from 'vitest'
import UnocssSvelteScopedVite from '../src/vite'

// Mirrors SvelteKit's `transform_index_html_unsupported` check, which runs in its `configResolved` hook
function fakeSvelteKit(name: string, report: string[]): Plugin {
  return {
    name,
    configResolved(config) {
      report.push(...config.plugins.filter(p => p.transformIndexHtml).map(p => p.name))
    },
  }
}

async function collectHtmlHookPlugins(kitPluginName: string) {
  const report: string[] = []
  await resolveConfig({
    configFile: false,
    logLevel: 'silent',
    plugins: [
      UnocssSvelteScopedVite({ onlyGlobal: true, configOrPath: { presets: [] } }),
      fakeSvelteKit(kitPluginName, report),
    ],
  }, 'serve')
  return report.filter(name => name.startsWith('unocss:'))
}

describe('svelte-scoped vite plugin with SvelteKit', () => {
  it('drops transformIndexHtml before SvelteKit checks for it', async () => {
    expect(await collectHtmlHookPlugins('vite-plugin-sveltekit-setup')).toEqual([])
  })

  it('keeps transformIndexHtml without SvelteKit', async () => {
    expect(await collectHtmlHookPlugins('some-other-plugin')).toEqual(['unocss:svelte-scoped:global-styles'])
  })
})
