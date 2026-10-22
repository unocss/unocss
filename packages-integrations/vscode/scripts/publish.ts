import process from 'node:process'
import { x } from 'tinyexec'
import { readPackage, vscodeRoot, withTempName } from './utils'

async function publish() {
  const { rawJSON, pkg } = await readPackage()
  if (!/^[\d.]+$/.test(pkg.version)) {
    console.warn(`VS Code release skipped because the version ${pkg.version} is not a stable release.`)
    return
  }

  await x('npm', ['run', 'build'], { nodeOptions: { cwd: vscodeRoot, stdio: 'inherit' }, throwOnError: true })

  await withTempName(rawJSON, async () => {
    console.log('\nPublish to VSCE...\n')
    await x('npx', ['@vscode/vsce', 'publish', '--no-dependencies', '-p', process.env.VSCE_TOKEN!], { nodeOptions: { cwd: vscodeRoot, stdio: 'inherit' }, throwOnError: true })

    console.log('\nPublish to OVSE...\n')
    await x('npx', ['ovsx', 'publish', '--no-dependencies', '-p', process.env.OVSX_TOKEN!], { nodeOptions: { cwd: vscodeRoot, stdio: 'inherit' }, throwOnError: true })
  })
}

await publish()
