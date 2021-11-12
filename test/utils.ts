import { resolve } from 'path'
import { readFile, outputFile } from 'fs-extra'
import execa from 'execa'

export const cacheDir = resolve(__dirname, '.cache')
export const cli = resolve(__dirname, '../packages/cli/src/cli.ts')

// https://stackoverflow.com/questions/52788380/get-the-current-test-spec-name-in-jest
export const getTestName = () => expect.getState().currentTestName

export async function runCli(files: Record<string, string>) {
  const testDir = resolve(cacheDir, getTestName())

  await Promise.all(
    Object.entries(files).map(([path, content]) =>
      outputFile(resolve(testDir, path), content, 'utf8'),
    ),
  )

  const { exitCode, stdout, stderr } = await execa('npx', ['esno', cli, 'views/**/*'], {
    cwd: testDir,
  })

  const logs = stdout + stderr
  if (exitCode !== 0)
    throw new Error(logs)

  const output = await readFile(resolve(testDir, 'uno.css'), 'utf8')

  return {
    output,
    logs,
  }
}
