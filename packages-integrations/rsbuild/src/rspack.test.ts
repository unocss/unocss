import type { Stats } from '@rspack/core'
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
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
  await writeFile(join(sourceDirectory, 'index.js'), 'import "uno.css"; import "./view.jsx";', 'utf8')
  await writeFile(join(sourceDirectory, 'view.jsx'), 'export const view = `<div class="text-red"></div>`;', 'utf8')

  const compiler = rspack({
    context: root,
    mode: 'development',
    entry: './src/index.js',
    experiments: { css: true },
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
    const watching = compiler.watch({}, async (error, stats) => {
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
        watching.close(() => resolve())
      }
      catch (watchError) {
        clearTimeout(timeout)
        watching.close(() => reject(watchError))
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

async function readCss(outputDirectory: string): Promise<string> {
  const files = await readdir(outputDirectory)
  const cssFiles = files.filter(file => file.endsWith('.css'))
  return (await Promise.all(cssFiles.map(file => readFile(join(outputDirectory, file), 'utf8')))).join('\n')
}
