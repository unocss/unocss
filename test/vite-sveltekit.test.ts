import type { Plugin } from 'vite'
import UnoCSS from '@unocss/vite'
import { resolveConfig } from 'vite'
import { describe, expect, it } from 'vitest'

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
      UnoCSS({ configFile: false, presets: [] }),
      fakeSvelteKit(kitPluginName, report),
    ],
  }, 'serve')
  return report.filter(name => name.startsWith('unocss:'))
}

describe('vite plugin with SvelteKit', () => {
  it('drops transformIndexHtml hooks before SvelteKit checks them', async () => {
    expect(await collectHtmlHookPlugins('vite-plugin-sveltekit-setup')).toEqual([])
  })

  it('keeps transformIndexHtml hooks without SvelteKit', async () => {
    expect(await collectHtmlHookPlugins('some-other-plugin')).toEqual(
      expect.arrayContaining(['unocss:global', 'unocss:transformers:default']),
    )
  })
})
