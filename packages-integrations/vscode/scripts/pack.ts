import { execa } from 'execa'
import { readPackage, vscodeRoot, withTempName } from './utils'

async function pack() {
  const { rawJSON } = await readPackage()
  await withTempName(rawJSON, async () => {
    await execa('npx', ['@vscode/vsce', 'package', '--no-dependencies'], { cwd: vscodeRoot, stdio: 'inherit' })
  })
}

await pack()
