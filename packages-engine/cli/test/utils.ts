import process from 'node:process'
import fs from 'fs-extra'
import { resolve } from 'pathe'
import { startCli } from '../src/cli-start'

const isCI = !!process.env.CI

export const tempDir = resolve('_temp')
export const cli = resolve(__dirname, '../src/cli.ts')

export function sleep(time = 300) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

export function getTestDir() {
  return resolve(tempDir, Math.round(Math.random() * 100000).toString())
}

function initOutputFiles(testDir: string, files: Record<string, string>) {
  return Promise.all(
    Object.entries(files).map(([path, content]) => fs.outputFile(resolve(testDir, path), content, 'utf8')),
  )
}

export function runAsyncChildProcess(cwd: string, ...args: string[]) {
  return startCli(cwd, ['', '', ...args, '--preflights', 'false'])
}

export function readFile(testDir: string, targetFile?: string) {
  return fs.readFile(resolve(testDir, targetFile ?? 'uno.css'), 'utf8')
}

export async function runCli(files: Record<string, string>, options?: { transformFile?: string, args?: string[], outFile?: string }) {
  const testDir = getTestDir()
  const hasConfigFile = Object.keys(files).some(f => f.includes('uno.config') || f.includes('unocss.config'))

  if (!hasConfigFile && !(options?.args?.includes('--preset'))) {
    files['uno.config.ts'] = `
import { defineConfig, presetWind3, transformerDirectives } from 'unocss'
export default defineConfig({
  presets: [
    presetWind3(),
  ],
  transformers: [
    transformerDirectives(),
  ],
})
      `.trim()
  }

  const fileName = options?.outFile || 'uno.css'

  await initOutputFiles(testDir, files)
  const process = runAsyncChildProcess(testDir, 'views/**/*', ...options?.args ?? [])

  if (options?.args?.includes('-w')) {
    while (true) {
      await sleep(isCI ? 1000 : 100)
      const outFilePath = resolve(testDir, fileName)

      if (fs.existsSync(outFilePath)) {
        const content = await readFile(testDir, fileName)
        if (content.length > 0)
          break
      }
    }
  }
  else {
    await process
  }

  const output = await readFile(testDir, fileName)

  if (options?.transformFile) {
    const transform = await readFile(testDir, options.transformFile)
    return {
      output,
      transform,
    }
  }

  return {
    output,
    testDir,
  }
}
