import fs from 'node:fs/promises'
import { resolve } from 'pathe'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const root = resolve(import.meta.dirname, 'fixtures/next')
const entry = resolve(root, 'globals.css')

// The loader caches at module level, so each test needs to start fresh
async function runCssLoader(source: string, resourcePath = entry) {
  const { default: loader } = await import('@unocss/next/loader-css')
  return new Promise<string | undefined>((resolve, reject) => {
    loader.call({
      resourcePath,
      rootContext: root,
      async: () => (err, code) => err ? reject(err) : resolve(code),
      addDependency() {},
      addContextDependency() {},
    }, source)
  })
}

function errnoError(code: string) {
  return Object.assign(new Error(code), { code })
}

describe('next css loader', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('replaces directive and ignores strings and comments', async () => {
    const source = [
      '@unocss;',
      '.example::after { content: "@unocss;"; }',
      `.single::after { content: '@unocss preflights;'; }`,
      '/* @unocss; */',
    ].join('\n')
    const css = (await runCssLoader(source))!

    expect(css).toContain('.text-red{')
    expect(css).toContain('.example::after { content: "@unocss;"; }')
    expect(css).toContain(`.single::after { content: '@unocss preflights;'; }`)
    expect(css).toContain('/* @unocss; */')
  })

  describe('output layers for multiple directives', () => {
    // keep in sync with fixtures/next
    const markers = {
      shortcuts: '.my-shortcut{',
      default: '.text-red{',
      custom: '.my-rule{',
    }

    async function layersOf(...directives: string[]) {
      const separator = '/* | */'
      const css = (await runCssLoader(directives.join(separator)))!
      return css.split(separator).map(part => Object.entries(markers)
        .filter(([, marker]) => part.includes(marker))
        .sort(([, a], [, b]) => part.indexOf(a) - part.indexOf(b))
        .map(([layer]) => layer))
    }

    it('fallback only emits remaining layers', async () => {
      expect(await layersOf(
        '@unocss shortcuts;',
        '@unocss default;',
        '@unocss;',
      )).toEqual([
        ['shortcuts'],
        ['default'],
        ['custom'],
      ])
    })

    it('fallback emits what a negation left out', async () => {
      expect(await layersOf(
        '@unocss !default;',
        '@unocss;',
      )).toEqual([
        ['shortcuts', 'custom'],
        ['default'],
      ])
    })

    it('a negation does not carry over to later directives', async () => {
      expect(await layersOf(
        '@unocss !default;',
        '@unocss default;',
      )).toEqual([
        ['shortcuts', 'custom'],
        ['default'],
      ])
    })

    it('fallback after all is empty', async () => {
      expect(await layersOf(
        '@unocss all;',
        '@unocss;',
      )).toEqual([
        ['shortcuts', 'custom', 'default'],
        [],
      ])
    })

    it('all includes layers already emitted', async () => {
      expect(await layersOf(
        '@unocss default;',
        '@unocss all;',
      )).toEqual([
        ['default'],
        ['shortcuts', 'custom', 'default'],
      ])
    })

    it('a named layer can be emitted twice', async () => {
      expect(await layersOf(
        '@unocss default;',
        '@unocss default;',
      )).toEqual([
        ['default'],
        ['default'],
      ])
    })

    it('names and negations can be mixed', async () => {
      expect(await layersOf(
        '@unocss default, !shortcuts;',
        '@unocss;',
      )).toEqual([
        ['default'],
        ['shortcuts', 'custom'],
      ])
    })

    it('all can be narrowed with a negation', async () => {
      expect(await layersOf(
        '@unocss all, !default;',
      )).toEqual([
        ['shortcuts', 'custom'],
      ])
    })

    it('invalid params emit nothing', async () => {
      expect(await layersOf(
        '@unocss !;',
        '@unocss , ;',
        '@unocss;',
      )).toEqual([
        [],
        [],
        ['shortcuts', 'custom', 'default'],
      ])
    })
  })

  it('includes inline content supplied by presets', async () => {
    const css = await runCssLoader('@unocss;')
    expect(css).toContain('.text-blue{')
  })

  it('skips files removed during the scan', async () => {
    const readFile = fs.readFile
    vi.spyOn(fs, 'readFile').mockImplementation(((path: string, ...args: any[]) => {
      if (path.endsWith('index.html'))
        return Promise.reject(errnoError('ENOENT'))
      return (readFile as any)(path, ...args)
    }) as typeof fs.readFile)

    const css = await runCssLoader('@unocss;')
    expect(css).not.toContain('.text-red{')
    expect(css).toContain('.text-blue{')
  })

  it('throws for filesystem errors other than file removed', async () => {
    const readFile = fs.readFile
    vi.spyOn(fs, 'readFile').mockImplementation(((path: string, ...args: any[]) => {
      if (path.endsWith('index.html'))
        return Promise.reject(errnoError('EMFILE'))
      return (readFile as any)(path, ...args)
    }) as typeof fs.readFile)

    await expect(runCssLoader('@unocss;')).rejects.toThrow('EMFILE')
  })

  it('bounds concurrent filesystem access', async () => {
    const generated = resolve(root, 'generated')
    const count = 300
    const BATCH_SIZE = 50 // keep in sync with loader-css.ts
    await fs.mkdir(generated, { recursive: true })
    try {
      await Promise.all(Array.from({ length: count }, (_, i) =>
        fs.writeFile(resolve(generated, `${i}.html`), `<div class="m-${i}"></div>`)))

      let inFlight = 0
      let peak = 0
      const stat = fs.stat
      vi.spyOn(fs, 'stat').mockImplementation((async (...args: Parameters<typeof fs.stat>) => {
        peak = Math.max(peak, ++inFlight)
        try {
          return await stat(...args)
        }
        finally {
          inFlight--
        }
      }) as typeof fs.stat)

      const css = (await runCssLoader('@unocss;'))!
      expect(peak).toBeGreaterThan(1)
      expect(peak).toBeLessThanOrEqual(BATCH_SIZE)
      for (let i = 0; i < count; i++)
        expect(css).toContain(`.m-${i}{`)
    }
    finally {
      await fs.rm(generated, { recursive: true, force: true })
    }
  })
})
