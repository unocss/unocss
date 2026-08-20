import process from 'node:process'
import { execa } from 'execa'
import { readPackage, vscodeRoot, withTempName } from './utils'

async function publish() {
  const { rawJSON, pkg } = await readPackage()
  if (!/^[\d.]+$/.test(pkg.version)) {
    console.warn(`VS Code release skipped because the version ${pkg.version} is not a stable release.`)
    return
  }

  await execa('npm', ['run', 'build'], { cwd: vscodeRoot, stdio: 'inherit' })

  await withTempName(rawJSON, async () => {
    console.log('\nPublish to VSCE...\n')
    await execa('npx', ['@vscode/vsce', 'publish', '--no-dependencies', '-p', process.env.VSCE_TOKEN!], { cwd: vscodeRoot, stdio: 'inherit' })

    console.log('\nPublish to OVSE...\n')
    await execa('npx', ['ovsx', 'publish', '--no-dependencies', '-p', process.env.OVSX_TOKEN!], { cwd: vscodeRoot, stdio: 'inherit' })
  })
}

await publish()
