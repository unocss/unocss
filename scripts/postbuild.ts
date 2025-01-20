import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { verifyDist } from './dist-verify'

function patchUnoCSSPostcssCjsExport(dtsModuleName: string) {
  for (const path of [`${dtsModuleName}.d.ts`, `${dtsModuleName}.d.cts`]) {
    const content = readFileSync(path, 'utf-8')
    writeFileSync(
      path,
      content.replace('export { default } from \'@unocss/postcss\';', '\nexport = postcss;'),
      { encoding: 'utf-8' },
    )
  }
}

// unocss
patchUnoCSSPostcssCjsExport(resolve('./packages-presets/unocss/dist/postcss'))

await verifyDist()
