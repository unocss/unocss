import { resolve } from 'path'
import fs from 'fs-extra'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { execa } from 'execa'

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

  it('uno.css exclude initialized class after changing file', async () => {
    const fileName = 'views/index.html'
    const initializedContent = '<div class="bg-blue"></div>'
    const changedContent = '<div class="bg-red"></div>'
    const testDir = getTestDir()
    const absolutePathOfFile = resolve(testDir, fileName)
    await fs.outputFile(absolutePathOfFile, initializedContent)
    const subProcess = runAsyncChildProcess(testDir, './views/**/*', '-w')
    const { stdout } = subProcess
    const { waiting, $resolve } = createWaiting()
    stdout!.on('data', (data) => {
      if (data.toString().includes('[info] Watching for changes'))
        $resolve()
    })
    await waiting
    await sleep()
    await fs.writeFile(absolutePathOfFile, changedContent)
    // polling until update
    for (let i = 20; i >= 0; i--) {
      await sleep(50)
      const output = await readUnocssFile(testDir)
      if (i === 0 || output.includes('.bg-red'))
        expect(output).toContain('.bg-red')
    }
    subProcess.cancel()
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
})

// ----- Utils -----

function createWaiting() {
  const loop = () => { }
  let $resolve = loop
  let $reject = loop
  const waiting = new Promise<void>((resolve, reject) => {
    $resolve = resolve
    $reject = reject
  })
  return {
    waiting,
    $resolve,
    $reject,
  }
}

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
  return execa('npx', ['esno', cli, ...args], {
    cwd,
    // stdio: 'inherit',
  })
}

function readUnocssFile(testDir: string) {
  return fs.readFile(resolve(testDir, 'uno.css'), 'utf8')
}

async function runCli(files: Record<string, string>) {
  const testDir = getTestDir()

  await initOutputFiles(testDir, files)

  const { exitCode, stdout, stderr } = await runAsyncChildProcess(testDir, 'views/**/*')

  const logs = stdout + stderr
  if (exitCode !== 0)
    throw new Error(logs)

  const output = await readUnocssFile(testDir)

  return {
    output,
    logs,
  }
}
