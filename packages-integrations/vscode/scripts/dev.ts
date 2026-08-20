import process from 'node:process'
import { execa } from 'execa'
import { readPackage, vscodeRoot, withTempName } from './utils'

async function dev() {
  // Change package.json name to "unocss" temporary
  // as VS Code will append it with the publisher, causing the dev extension fail to override the production extension.
  const { rawJSON, pkg } = await readPackage()
  if (pkg.name !== 'unocss')
    console.log('Update package.json name to "unocss"')

  await withTempName(rawJSON, async () => {
    const child = execa('tsdown', ['--watch', 'src'], { cwd: vscodeRoot, stdio: 'inherit' })

    for (const signal of ['SIGINT', 'SIGTERM'] as const)
      process.once(signal, () => child.kill(signal))

    try {
      await child
    }
    catch (error) {
      if (!(error instanceof Error) || !('signal' in error))
        throw error
    }
  })
}

await dev()
