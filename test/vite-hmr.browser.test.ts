import type { UnocssVitePluginAPI } from '@unocss/vite'
import type { Page } from 'playwright'
import type { HotPayload, ViteDevServer } from 'vite'
import { mkdtemp, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import transformerCompileClass from '@unocss/transformer-compile-class'
import UnoCSS from '@unocss/vite'
import { chromium } from 'playwright'
import { createServer } from 'vite'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

function deferred() {
  let resolve!: () => void
  const promise = new Promise<void>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

describe.runIf(process.env.BROWSER_TESTS === 'true')('global CSS in Chromium', () => {
  let browser: Awaited<ReturnType<typeof chromium.launch>>

  beforeAll(async () => {
    browser = await chromium.launch()
  })

  afterAll(async () => {
    await browser?.close()
  })

  async function fixture(options: { html?: string, main?: string, files?: Record<string, string>, filesystem?: boolean, config?: string } = {}) {
    const root = await realpath(await mkdtemp(join(tmpdir(), 'unocss-browser-')))
    const external = await realpath(await mkdtemp(join(tmpdir(), 'unocss-content-')))
    await writeFile(resolve(external, 'content.html'), '<div></div>')
    await writeFile(resolve(root, 'index.html'), `${options.html ?? '<div id="probe"></div>'}<script type="module" src="/main.ts"></script>`)
    await writeFile(resolve(root, 'main.ts'), options.main ?? 'import "uno.css"; window.appReady = true')
    for (const [name, code] of Object.entries(options.files ?? {}))
      await writeFile(resolve(root, name), code)
    if (options.config)
      await writeFile(resolve(root, 'uno.config.ts'), options.config)
    const server = await createServer({
      root,
      configFile: false,
      logLevel: 'error',
      server: { host: '127.0.0.1', port: 0, preTransformRequests: false, watch: { usePolling: true } },
      plugins: [UnoCSS({
        configFile: options.config ? resolve(root, 'uno.config.ts') : false,
        inspector: false,
        rules: [
          ['probe-red', { color: 'red' }],
          ['probe-blue', { color: 'blue' }],
        ],
        transformers: [transformerCompileClass()],
        content: options.filesystem ? { filesystem: [resolve(external, '*.html')] } : undefined,
      })],
    })
    await server.listen()
    const page = await browser.newPage()
    const api: UnocssVitePluginAPI = server.config.plugins.find(plugin => plugin.name === 'unocss:api')!.api
    return {
      root,
      external,
      server,
      page,
      ctx: api.getContext(),
      url: server.resolvedUrls!.local[0],
      async close() {
        await page.close()
        await server.close()
        await rm(root, { recursive: true, force: true })
        await rm(external, { recursive: true, force: true })
      },
    }
  }

  async function openWithRefresh(app: Awaited<ReturnType<typeof fixture>>) {
    const readyRefresh = app.page.waitForResponse(response =>
      response.url().includes('__uno.css') && new URL(response.url()).searchParams.has('t'),
    )
    await app.page.goto(app.url)
    const response = await readyRefresh
    await app.page.evaluate(`import(${JSON.stringify(response.url())})`)
  }

  async function expectColor(page: Page, color: string) {
    await expect.poll(() => page.locator('#probe').evaluate(el => getComputedStyle(el).color), { timeout: 10_000 }).toBe(color)
  }

  function nextRefresh(server: ViteDevServer) {
    const refreshed = deferred()
    const hot = server.environments.client.hot
    const send = hot.send.bind(hot)
    hot.send = (payload: HotPayload | string, data?: unknown) => {
      if (typeof payload === 'string')
        return send(payload, data)
      if (payload.type === 'custom' && payload.event === 'unocss:refresh')
        refreshed.resolve()
      return send(payload)
    }
    return refreshed.promise
  }

  it('recovers a refresh sent before the static graph evaluates', async () => {
    const app = await fixture({
      main: 'import "uno.css"; import { className } from "./leaf.tsx"; import "./gate.ts"; document.querySelector("#probe").className = className',
      files: { 'leaf.tsx': 'export const className = "probe-red"', 'gate.ts': 'export {}' },
    })
    try {
      const leafRequested = deferred()
      const releaseLeaf = deferred()
      const gateRequested = deferred()
      const releaseGate = deferred()
      await app.page.route('**/leaf.tsx', async (route) => {
        leafRequested.resolve()
        await releaseLeaf.promise
        await route.continue()
      })
      await app.page.route('**/gate.ts', async (route) => {
        gateRequested.resolve()
        await releaseGate.promise
        await route.continue()
      })
      const cssLoaded = app.page.waitForResponse(response => response.url().includes('__uno.css'))
      const navigation = app.page.goto(app.url, { waitUntil: 'commit' })
      await Promise.all([leafRequested.promise, gateRequested.promise, cssLoaded])
      const refresh = nextRefresh(app.server)
      releaseLeaf.resolve()
      await refresh
      releaseGate.resolve()
      await navigation
      await expectColor(app.page, 'rgb(255, 0, 0)')
    }
    finally {
      await app.close()
    }
  })

  it('recovers inline CSS before its accepting importer evaluates', async () => {
    const app = await fixture({
      html: `<div id="probe"></div><script type="module">
import { createHotContext } from '/@vite/client';
const hot = createHotContext('/observer');
hot.on('unocss:refresh', () => window.refreshSeen = true);
window.observerReady = true;
</script>`,
      main: `import css from "uno.css?inline"; import { className } from "./leaf.tsx"; import "./gate.ts";
window.inlineCSS = css; window.className = className; window.appReady = true;
if (import.meta.hot) import.meta.hot.accept("uno.css?inline", m => window.inlineCSS = m.default)`,
      files: { 'leaf.tsx': 'export const className = "probe-blue"', 'gate.ts': 'export {}' },
    })
    const releaseLeaf = deferred()
    const releaseGate = deferred()
    try {
      const leafRequested = deferred()
      const gateRequested = deferred()
      await app.page.route('**/leaf.tsx', async (route) => {
        leafRequested.resolve()
        await releaseLeaf.promise
        await route.continue()
      })
      await app.page.route('**/gate.ts', async (route) => {
        gateRequested.resolve()
        await releaseGate.promise
        await route.continue()
      })
      const cssLoaded = app.page.waitForResponse(response => response.url().includes('__uno.css'))
      const navigation = app.page.goto(app.url, { waitUntil: 'commit' })
      await Promise.all([leafRequested.promise, gateRequested.promise, cssLoaded])
      await app.page.waitForFunction('window.observerReady')
      releaseLeaf.resolve()
      await app.page.waitForFunction('window.refreshSeen')
      releaseGate.resolve()
      await navigation
      await expect.poll(() => app.page.evaluate('window.inlineCSS'), { timeout: 10_000 }).toContain('.probe-blue{color:blue;}')
    }
    finally {
      releaseLeaf.resolve()
      releaseGate.resolve()
      await app.close()
    }
  })

  it('updates a direct stylesheet link after public invalidation', async () => {
    const app = await fixture({
      html: '<link rel="stylesheet" href="/__uno.css"><div id="probe"></div>',
      main: 'window.appReady = true',
    })
    try {
      await app.page.goto(app.url)
      await app.page.waitForFunction('window.appReady')
      await app.page.evaluate('window.preserved = true; document.querySelector("#probe").className = "probe-blue"')
      app.ctx.tokens.add('probe-blue')
      app.ctx.invalidate()
      await expectColor(app.page, 'rgb(0, 0, 255)')
      expect(await app.page.evaluate('window.preserved')).toBe(true)
    }
    finally {
      await app.close()
    }
  })

  it('keeps compiled-class CSS when another extracted source is deleted', async () => {
    const app = await fixture({
      config: 'export default { rules: [["probe-blue", { color: "blue" }]] }',
      main: 'import "uno.css"; import "./view.tsx"; window.appReady = true',
      files: {
        'view.tsx': 'document.querySelector("#probe").className = ":uno: probe-blue"',
        'removed.tsx': 'export default "probe-blue"',
      },
    })
    try {
      await app.page.goto(app.url)
      await app.page.waitForFunction('window.appReady')
      await expectColor(app.page, 'rgb(0, 0, 255)')
      await app.page.evaluate('import("/removed.tsx")')
      await app.page.waitForFunction(() => [...document.querySelectorAll('style')].some(style => style.textContent?.includes('.probe-blue{color:blue;}')))
      const cssUpdated = app.page.waitForResponse(response => response.url().includes('__uno.css') && new URL(response.url()).searchParams.has('t'))
      await rm(resolve(app.root, 'removed.tsx'))
      const response = await cssUpdated
      await app.page.evaluate(`import(${JSON.stringify(response.url())})`)
      await expectColor(app.page, 'rgb(0, 0, 255)')
    }
    finally {
      await app.close()
    }
  })

  it('updates CSS after an HTML edit and page reload', async () => {
    const app = await fixture()
    try {
      await app.page.goto(app.url)
      await app.page.waitForFunction('window.appReady')
      await writeFile(resolve(app.root, 'index.html'), '<div id="probe" class="probe-red"></div><script type="module" src="/main.ts"></script>')
      await expectColor(app.page, 'rgb(255, 0, 0)')
    }
    finally {
      await app.close()
    }
  })

  it('updates CSS after external filesystem content changes', async () => {
    const app = await fixture({ filesystem: true })
    try {
      await app.page.goto(app.url)
      await app.page.waitForFunction('window.appReady')
      await app.page.locator('#probe').evaluate(el => el.setAttribute('class', 'probe-blue'))
      await writeFile(resolve(app.external, 'content.html'), '<div class="probe-blue"></div>')
      await expectColor(app.page, 'rgb(0, 0, 255)')
    }
    finally {
      await app.close()
    }
  })

  it('updates CSS for a lazy compile-class transform without reloading the page', async () => {
    const app = await fixture({
      main: 'import "uno.css"; import "./eager.tsx"; window.appReady = true',
      files: {
        'eager.tsx': 'export default "probe-red"',
        'lazy.tsx': 'export default ":uno: probe-red"',
      },
    })
    try {
      await app.page.goto(app.url)
      await app.page.waitForFunction('window.appReady')
      await app.page.evaluate('window.preserved = true; import("/lazy.tsx").then(m => document.querySelector("#probe").className = m.default)')
      await expectColor(app.page, 'rgb(255, 0, 0)')
      expect(await app.page.evaluate('window.preserved')).toBe(true)
    }
    finally {
      await app.close()
    }
  })

  it('updates CSS after the public context is invalidated', async () => {
    const app = await fixture()
    try {
      await app.page.goto(app.url)
      await app.page.waitForFunction('window.appReady')
      await app.page.locator('#probe').evaluate(el => el.setAttribute('class', 'probe-red'))
      app.ctx.tokens.add('probe-red')
      app.ctx.invalidate()
      await expectColor(app.page, 'rgb(255, 0, 0)')
    }
    finally {
      await app.close()
    }
  })

  it('updates an ordinary lazy module without losing application state', async () => {
    const app = await fixture({ files: { 'lazy.tsx': 'document.querySelector("#probe").className = "probe-blue"' } })
    try {
      await app.page.goto(app.url)
      await app.page.waitForFunction('window.appReady')
      await app.page.evaluate('window.preserved = true; import("/lazy.tsx")')
      await expectColor(app.page, 'rgb(0, 0, 255)')
      expect(await app.page.evaluate('window.preserved')).toBe(true)
    }
    finally {
      await app.close()
    }
  })

  it('updates a stylesheet after its config file changes', async () => {
    const app = await fixture({
      html: '<div id="probe" class="probe-red"></div>',
      config: 'export default { rules: [["probe-red", { color: "red" }]] }',
    })
    try {
      await app.page.goto(app.url)
      await expectColor(app.page, 'rgb(255, 0, 0)')
      await writeFile(resolve(app.root, 'uno.config.ts'), 'export default { rules: [["probe-red", { color: "blue" }]] }')
      await expectColor(app.page, 'rgb(0, 0, 255)')
    }
    finally {
      await app.close()
    }
  })

  it.each([false, true])('updates inline CSS with an accepting importer set to %s', async (accept) => {
    const app = await fixture({
      main: `import css from "uno.css?inline";
window.inlineCSS = css;
window.appReady = true;
window.loads = Number(sessionStorage.loads || 0) + 1;
sessionStorage.loads = window.loads;
${accept ? 'if (import.meta.hot) import.meta.hot.accept("uno.css?inline", m => window.inlineCSS = m.default)' : ''}`,
    })
    try {
      await app.page.goto(app.url)
      await app.page.waitForFunction('window.appReady')
      await writeFile(resolve(app.root, 'added.tsx'), 'export const className = "probe-blue"')
      await expect.poll(() => app.page.evaluate('window.inlineCSS'), { timeout: 10_000 }).toContain('.probe-blue{color:blue;}')
      expect(await app.page.evaluate('window.loads')).toBe(accept ? 1 : 2)
    }
    finally {
      await app.close()
    }
  })

  it.each([
    { trigger: 'invalidation', accept: true },
    { trigger: 'invalidation', accept: false },
    { trigger: 'filesystem content', accept: true },
    { trigger: 'filesystem content', accept: false },
    { trigger: 'lazy extraction', accept: true },
    { trigger: 'lazy extraction', accept: false },
  ])('updates inline CSS after $trigger with an accepting importer set to $accept', async ({ trigger, accept }) => {
    const app = await fixture({
      filesystem: trigger === 'filesystem content',
      main: `import css from "uno.css?inline";
window.inlineCSS = css;
window.appReady = true;
window.loads = Number(sessionStorage.loads || 0) + 1;
sessionStorage.loads = window.loads;
${accept ? 'if (import.meta.hot) import.meta.hot.accept("uno.css?inline", m => window.inlineCSS = m.default)' : ''}`,
      files: { 'lazy.tsx': 'export default "probe-blue"' },
    })
    try {
      await app.page.goto(app.url)
      await app.page.waitForFunction('window.appReady')
      await app.page.evaluate('window.preserved = true')
      if (trigger === 'invalidation') {
        app.ctx.tokens.add('probe-blue')
        app.ctx.invalidate()
      }
      else if (trigger === 'filesystem content') {
        await writeFile(resolve(app.external, 'content.html'), '<div class="probe-blue"></div>')
      }
      else {
        await app.page.evaluate('import("/lazy.tsx")')
      }
      await expect.poll(() => app.page.evaluate('window.inlineCSS'), { timeout: 10_000 }).toContain('.probe-blue{color:blue;}')
      expect(await app.page.evaluate('window.loads')).toBe(accept ? 1 : 2)
      expect(await app.page.evaluate('window.preserved')).toBe(accept ? true : undefined)
    }
    finally {
      await app.close()
    }
  })

  it.each(['uno.css', 'uno.css?theme=probe'])('keeps refreshing %s without adding style elements or reloading', async (entry) => {
    const app = await fixture({ main: `import "${entry}"; window.appReady = true` })
    try {
      await openWithRefresh(app)
      await app.page.evaluate('window.preserved = true')
      for (const [className, color] of [['probe-red', 'rgb(255, 0, 0)'], ['probe-blue', 'rgb(0, 0, 255)'], ['probe-red', 'rgb(255, 0, 0)']]) {
        await app.page.locator('#probe').evaluate((el, name) => el.setAttribute('class', name), className)
        app.ctx.tokens.delete('probe-red')
        app.ctx.tokens.delete('probe-blue')
        app.ctx.tokens.add(className)
        app.ctx.invalidate()
        await expectColor(app.page, color)
      }
      expect(await app.page.evaluate('window.preserved')).toBe(true)
      expect(await app.page.locator('style[data-vite-dev-id]').count()).toBe(1)
    }
    finally {
      await app.close()
    }
  })

  it('does not let a newer load hide a pending update for an existing browser', async () => {
    const app = await fixture()
    try {
      await openWithRefresh(app)
      await app.page.locator('#probe').evaluate(el => el.setAttribute('class', 'probe-red'))
      await app.ctx.extract('probe-red', resolve(app.root, 'lazy.tsx'))
      const moduleGraph = app.server.environments.client.moduleGraph
      moduleGraph.invalidateModule(moduleGraph.getModuleById('/__uno.css')!)
      const latest = await app.server.environments.client.transformRequest('/__uno.css')
      expect(latest?.code).toContain('.probe-red{color:red;}')
      await expectColor(app.page, 'rgb(255, 0, 0)')
    }
    finally {
      await app.close()
    }
  })

  it('does not let a newer inline entry hide a stale stylesheet', async () => {
    const app = await fixture({ files: { 'lazy.tsx': 'export const className = "probe-red"' } })
    try {
      await app.page.goto(app.url)
      await app.page.waitForFunction('window.appReady')
      await app.page.locator('#probe').evaluate(el => el.setAttribute('class', 'probe-red'))
      await app.server.environments.client.transformRequest('/lazy.tsx')
      const inline = await app.server.environments.client.pluginContainer.resolveId('uno.css?inline')
      await app.server.environments.client.transformRequest(inline!.id)
      await expectColor(app.page, 'rgb(255, 0, 0)')
    }
    finally {
      await app.close()
    }
  })
})
