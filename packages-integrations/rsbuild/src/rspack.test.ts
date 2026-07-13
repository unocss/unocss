import type { Stats } from '@rspack/core'
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { rspack } from '@rspack/core'
import presetUno from '@unocss/preset-uno'
import { afterEach, expect, it } from 'vitest'
// This integration test intentionally verifies the built package and loader path.
// eslint-disable-next-line antfu/no-import-dist
import { UnoCSSRspackPlugin } from '../dist/rspack.mjs'

const temporaryDirectories: string[] = []

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map(directory => rm(directory, { force: true, recursive: true })))
})

it('updates generated CSS during native Rspack watch', async () => {
  const root = await mkdtemp(join(tmpdir(), 'unocss-rspack-watch-'))
  temporaryDirectories.push(root)
  const sourceDirectory = join(root, 'src')
  const outputDirectory = join(root, 'dist')
  await import('node:fs/promises').then(fs => fs.mkdir(sourceDirectory, { recursive: true }))
  await writeFile(
    join(sourceDirectory, 'index.js'),
    'import "uno.css?test"; import "uno:utilities.css?test"; import "./view.jsx";',
    'utf8',
  )
  await writeFile(join(sourceDirectory, 'view.jsx'), 'export const view = `<div class="text-red"></div>`;', 'utf8')

  const compiler = rspack({
    context: root,
    mode: 'development',
    entry: './src/index.js',
    experiments: { css: true },
    watchOptions: { poll: 50 },
    output: {
      path: outputDirectory,
      filename: 'bundle.js',
    },
    plugins: [
      new UnoCSSRspackPlugin({
        configOrPath: { presets: [presetUno()] },
        root,
      }),
    ],
  })

  await new Promise<void>((resolve, reject) => {
    let builds = 0
    const timeout = setTimeout(() => reject(new Error('Rspack watch did not emit updated UnoCSS within 15 seconds.')), 15_000)
    const watching = compiler.watch({ poll: 50 }, async (error, stats) => {
      try {
        if (error)
          throw error
        assertStats(stats)
        builds += 1
        const css = await readCss(outputDirectory)
        if (builds === 1) {
          expect(css).toContain('.text-red')
          expect(css).not.toContain('#--unocss-hash--')
          await writeFile(join(sourceDirectory, 'view.jsx'), 'export const view = `<div class="text-blue"></div>`;', 'utf8')
          return
        }
        if (!css.includes('.text-blue'))
          return
        expect(css).not.toContain('.text-red')
        clearTimeout(timeout)
        closeCompiler(compiler, watching, resolve, reject)
      }
      catch (watchError) {
        clearTimeout(timeout)
        closeCompiler(compiler, watching, () => reject(watchError), reject)
      }
    })
  })
})

it('runs transformers once for modules matched by existing rules', async () => {
  const root = await mkdtemp(join(tmpdir(), 'unocss-rspack-loader-once-'))
  temporaryDirectories.push(root)
  const sourceDirectory = join(root, 'src')
  const outputDirectory = join(root, 'dist')
  const loaderFile = join(root, 'passthrough-loader.cjs')
  await mkdir(sourceDirectory, { recursive: true })
  await writeFile(loaderFile, 'module.exports = source => source', 'utf8')
  await writeFile(join(sourceDirectory, 'App.vue'), 'export default `<div class="text-red"></div>`', 'utf8')

  let transformCalls = 0
  const compiler = rspack({
    context: root,
    mode: 'production',
    entry: './src/App.vue',
    module: {
      rules: [{ test: /\.vue$/, type: 'javascript/auto', use: [loaderFile] }],
    },
    output: {
      path: outputDirectory,
      filename: 'bundle.js',
    },
    plugins: [
      new UnoCSSRspackPlugin({
        configOrPath: {
          presets: [presetUno()],
          transformers: [{
            name: 'count-transformer-runs',
            transform() {
              transformCalls += 1
            },
          }],
        },
        root,
      }),
    ],
  })

  await runCompiler(compiler)

  expect(transformCalls).toBe(1)
})

it('watches newly added external content files', async () => {
  const root = await mkdtemp(join(tmpdir(), 'unocss-rspack-content-watch-'))
  temporaryDirectories.push(root)
  const sourceDirectory = join(root, 'src')
  const contentDirectory = join(root, 'content')
  const outputDirectory = join(root, 'dist')
  await Promise.all([
    mkdir(sourceDirectory, { recursive: true }),
    mkdir(contentDirectory, { recursive: true }),
  ])
  await writeFile(join(sourceDirectory, 'index.js'), 'import "uno.css";', 'utf8')

  const compiler = rspack({
    context: root,
    mode: 'development',
    entry: './src/index.js',
    experiments: { css: true },
    watchOptions: { poll: 50 },
    output: {
      path: outputDirectory,
      filename: 'bundle.js',
    },
    plugins: [
      new UnoCSSRspackPlugin({
        configOrPath: {
          content: { filesystem: ['content/**/*.html'] },
          presets: [presetUno()],
        },
        root,
      }),
    ],
  })

  await new Promise<void>((resolve, reject) => {
    let created = false
    const timeout = setTimeout(() => reject(new Error('Rspack watch did not detect newly added UnoCSS content within 15 seconds.')), 15_000)
    const watching = compiler.watch({ poll: 50 }, async (error, stats) => {
      try {
        if (error)
          throw error
        assertStats(stats)
        const css = await readCss(outputDirectory)
        if (!created) {
          created = true
          setTimeout(() => {
            writeFile(join(contentDirectory, 'new.html'), '<div class="text-green"></div>', 'utf8').catch(reject)
          }, 100)
          return
        }
        if (!css.includes('.text-green'))
          return
        clearTimeout(timeout)
        closeCompiler(compiler, watching, resolve, reject)
      }
      catch (watchError) {
        clearTimeout(timeout)
        closeCompiler(compiler, watching, () => reject(watchError), reject)
      }
    })
  })
})

it('reloads config and invalidates transformed modules', async () => {
  const root = await mkdtemp(join(tmpdir(), 'unocss-rspack-config-watch-'))
  temporaryDirectories.push(root)
  const sourceDirectory = join(root, 'src')
  const outputDirectory = join(root, 'dist')
  const configFile = join(root, 'uno.config.ts')
  await mkdir(sourceDirectory, { recursive: true })
  await writeFile(join(sourceDirectory, 'index.js'), 'import "uno.css"; import "./view.jsx";', 'utf8')
  await writeFile(join(sourceDirectory, 'view.jsx'), 'export const view = `<div class="TOKEN"></div>`;', 'utf8')
  await writeTransformerConfig(configFile, 'text-red')

  const compiler = rspack({
    context: root,
    mode: 'development',
    entry: './src/index.js',
    experiments: { css: true },
    watchOptions: { poll: 50 },
    output: {
      path: outputDirectory,
      filename: 'bundle.js',
    },
    plugins: [
      new UnoCSSRspackPlugin({
        configOrPath: configFile,
        root,
      }),
    ],
  })

  await new Promise<void>((resolve, reject) => {
    let configChanged = false
    const timeout = setTimeout(() => reject(new Error('Rspack watch did not reload the UnoCSS config within 15 seconds.')), 15_000)
    const watching = compiler.watch({ poll: 50 }, async (error, stats) => {
      try {
        if (error)
          throw error
        assertStats(stats)
        const [css, js] = await Promise.all([
          readCss(outputDirectory),
          readFile(join(outputDirectory, 'bundle.js'), 'utf8'),
        ])
        if (!configChanged && css.includes('.text-red') && js.includes('text-red')) {
          configChanged = true
          setTimeout(() => {
            writeTransformerConfig(configFile, 'text-blue').catch(reject)
          }, 100)
          return
        }
        if (!configChanged || !css.includes('.text-blue') || !js.includes('text-blue'))
          return
        expect(css).not.toContain('.text-red')
        expect(js).not.toContain('text-red')
        clearTimeout(timeout)
        closeCompiler(compiler, watching, resolve, reject)
      }
      catch (watchError) {
        clearTimeout(timeout)
        closeCompiler(compiler, watching, () => reject(watchError), reject)
      }
    })
  })
})

function assertStats(stats: Stats | undefined): asserts stats is Stats {
  if (!stats)
    throw new Error('Rspack did not return stats.')
  if (stats.hasErrors())
    throw new Error(stats.toString({ all: false, errors: true }))
}

function runCompiler(compiler: ReturnType<typeof rspack>): Promise<void> {
  return new Promise((resolve, reject) => {
    compiler.run((error, stats) => {
      if (error) {
        reject(error)
        return
      }
      try {
        assertStats(stats)
      }
      catch (statsError) {
        reject(statsError)
        return
      }
      compiler.close(closeError => closeError ? reject(closeError) : resolve())
    })
  })
}

async function readCss(outputDirectory: string): Promise<string> {
  const files = await readdir(outputDirectory)
  const cssFiles = files.filter(file => file.endsWith('.css'))
  return (await Promise.all(cssFiles.map(file => readFile(join(outputDirectory, file), 'utf8')))).join('\n')
}

function closeCompiler(
  compiler: ReturnType<typeof rspack>,
  watching: ReturnType<ReturnType<typeof rspack>['watch']>,
  resolve: () => void,
  reject: (error: Error) => void,
): void {
  watching.close((watchError) => {
    if (watchError) {
      reject(watchError)
      return
    }
    compiler.close((closeError) => {
      if (closeError)
        reject(closeError)
      else
        resolve()
    })
  })
}

async function writeTransformerConfig(file: string, replacement: string): Promise<void> {
  await writeFile(
    file,
    `export default {
  rules: [
    ['text-red', { color: 'red' }],
    ['text-blue', { color: 'blue' }],
  ],
  transformers: [{
    name: 'test-transformer',
    transform(source) {
      source.replaceAll('TOKEN', '${replacement}')
    },
  }],
}\n`,
    'utf8',
  )
}
