import { resolve } from 'pathe'
import fs from 'fs-extra'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { startCli } from '../packages/cli/src/cli-start'

export const tempDir = resolve('.temp')
export const cli = resolve(__dirname, '../packages/cli/src/cli.ts')

beforeAll(async () => {
  await fs.remove(tempDir)
})

afterAll(async () => {
  await fs.remove(tempDir)
})

describe('cli', () => {
  it('builds uno.css', async () => {
    const { output } = await runCli({
      'views/index.html': '<div class="p-4 max-w-screen-md"></div>',
    })

    expect(output).toMatchSnapshot()
  })

  it('supports unocss.config.js', async () => {
    const { output } = await runCli({
      'views/index.html': '<div class="box"></div>',
      'unocss.config.js': `
import { defineConfig } from 'unocss'
export default defineConfig({
  shortcuts: [{ box: 'max-w-7xl mx-auto bg-gray-100 rounded-md shadow-sm p-4' }]
})
    `.trim(),
    })

    expect(output).toMatchSnapshot()
  })

  it('supports variantGroup transformer', async () => {
    const { output, transform } = await runCli({
      'views/index.html': '<div class="p-4 border-(solid red)"></div>',
      'unocss.config.js': `
import { defineConfig, transformerVariantGroup } from 'unocss'
export default defineConfig({
  transformers: [transformerVariantGroup()]
})
    `.trim(),
    }, 'views/index.html')
    expect(output).toMatchSnapshot()
    expect(transform).toMatchSnapshot()
  })

  it('supports directives transformer', async () => {
    const { output, transform } = await runCli({
      'views/index.css': '.btn-center{@apply text-center my-0 font-medium;}',
      'unocss.config.js': `
import { defineConfig, transformerDirectives } from 'unocss'
export default defineConfig({
  transformers: [transformerDirectives()]
})
    `.trim(),
    }, 'views/index.css')
    expect(output).toMatchSnapshot()
    expect(transform).toMatchSnapshot()
  })

  it('uno.css exclude initialized class after changing file', async () => {
    const fileName = 'views/index.html'
    const initializedContent = '<div class="bg-blue"></div>'
    const changedContent = '<div class="bg-red"></div>'
    const testDir = getTestDir()
    const absolutePathOfFile = resolve(testDir, fileName)
    await fs.outputFile(absolutePathOfFile, initializedContent)
    await runAsyncChildProcess(testDir, './views/**/*', '-w')
    const outputPath = resolve(testDir, 'uno.css')
    for (let i = 50; i >= 0; i--) {
      await sleep(50)
      if (fs.existsSync(outputPath))
        break
    }
    await fs.writeFile(absolutePathOfFile, changedContent)
    // polling until update
    for (let i = 100; i >= 0; i--) {
      await sleep(100)
      const output = await readFile(testDir)
      if (i === 0 || output.includes('.bg-red')) {
        expect(output).toContain('.bg-red')
        break
      }
    }
  })
})

// ----- Utils -----
function sleep(time = 300) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

function getTestDir() {
  return resolve(tempDir, Math.round(Math.random() * 100000).toString())
}

function initOutputFiles(testDir: string, files: Record<string, string>) {
  return Promise.all(
    Object.entries(files).map(([path, content]) =>
      fs.outputFile(resolve(testDir, path), content, 'utf8'),
    ),
  )
}

function runAsyncChildProcess(cwd: string, ...args: string[]) {
  return startCli(cwd, ['', '', ...args, '--no-preflights'])
}

function readFile(testDir: string, targetFile?: string) {
  return fs.readFile(resolve(testDir, targetFile ?? 'uno.css'), 'utf8')
}

async function runCli(files: Record<string, string>, transformFile?: string) {
  const testDir = getTestDir()

  await initOutputFiles(testDir, files)
  await runAsyncChildProcess(testDir, 'views/**/*')

  const output = await readFile(testDir)

  if (transformFile) {
    const transform = await readFile(testDir, transformFile)
    return {
      output,
      transform,
    }
  }

  return {
    output,
  }
}
