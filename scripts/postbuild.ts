import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { verifyDist } from './dist-verify'

const regexp = /export\s*\{([^}]*)\};/

function parseExports(dtsModulePath: string, defaultExport: string, content: string) {
  const exportAsDefault = `${defaultExport} as default`
  const entries = content.split('\n').reduce((acc, line) => {
    // skip LF if last line
    if (acc.content.length && acc.content.at(-1) === '\n' && line.trim().length === 0)
      return acc

    const match = line.match(regexp)
    if (match?.length && match[0].includes(exportAsDefault)) {
      const exportsArray = match[1].split(',').map(e => e.trim())
      const removeImport = `${defaultExport} as default`
      // Filtering out the default export
      const nonDefaultExports = exportsArray.filter(item => item !== removeImport).map(e => e.trim())
      acc.matched = true
      acc.content = nonDefaultExports.length > 0
        ? `${acc.content}\nexport = ${defaultExport};\nexport { ${nonDefaultExports.join(', ')} };\n`
        : `${acc.content}\nexport = ${defaultExport};\n`
    }
    else {
      // avoid adding LF at first line
      acc.content = acc.content.length > 0
        ? `${acc.content}\n${line}`
        : line
    }

    return acc
  }, { content: '', matched: false })

  if (entries.matched)
    return entries.content
  else
    throw new Error(`UPPS, no match found for ${defaultExport} in ${dtsModulePath}!`)
}

function patchDefaultCjsExport(dtsModuleName: string, defaultExport: string = '_default') {
  for (const path of [`${dtsModuleName}.d.ts`, `${dtsModuleName}.d.cts`]) {
    writeFileSync(
      path,
      parseExports(path, defaultExport, readFileSync(path, 'utf-8')),
      { encoding: 'utf-8' },
    )
  }
}

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

// @unocss/eslint-config
patchDefaultCjsExport(resolve('./packages/eslint-config/dist/flat'))
patchDefaultCjsExport(resolve('./packages/eslint-config/dist/index'))

// @unocss/eslint-plugin
patchDefaultCjsExport(resolve('./packages/eslint-plugin/dist/index'))

// @unocss/postcss
patchDefaultCjsExport(resolve('./packages/postcss/dist/index'), 'unocss')

// @unocss/webpack
patchDefaultCjsExport(resolve('./packages/webpack/dist/index'), 'WebpackPlugin')

// unocss
patchUnoCSSPostcssCjsExport(resolve('./packages/unocss/dist/postcss'))
patchDefaultCjsExport(resolve('./packages/unocss/dist/webpack'), 'UnocssWebpackPlugin')

await verifyDist()
