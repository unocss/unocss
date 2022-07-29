import { resolve } from 'path'
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
      const output = await readUnocssFile(testDir)
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

function readUnocssFile(testDir: string) {
  return fs.readFile(resolve(testDir, 'uno.css'), 'utf8')
}

async function runCli(files: Record<string, string>) {
  const testDir = getTestDir()

  await initOutputFiles(testDir, files)
  await runAsyncChildProcess(testDir, 'views/**/*')

  const output = await readUnocssFile(testDir)

  return {
    output,
  }
}
