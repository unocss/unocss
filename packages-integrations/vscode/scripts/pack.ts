import { x } from 'tinyexec'
import { readPackage, vscodeRoot, withTempName } from './utils'

async function pack() {
  const { rawJSON } = await readPackage()
  await withTempName(rawJSON, async () => {
    await x('npx', ['@vscode/vsce', 'package', '--no-dependencies'], { nodeOptions: { cwd: vscodeRoot, stdio: 'inherit' }, throwOnError: true })
  })
}

await pack()
