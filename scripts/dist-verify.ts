import fs from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { glob } from 'tinyglobby'

// UnoCSS packages ship no CJS types, so declaration output must not use
// `import x = require()` against them. Runtime `require()` of ESM is valid
// on Node >= 22.12 (the minimum engine), so runtime .cjs is not checked.
const forbiddenCjsImport = /\brequire\(\s*['"]@?unocss(?:\/core)?['"]\s*\)/

export async function verifyDist(root = process.cwd()) {
  const cjsDeclarationFiles = await glob([
    'packages-*/*/dist/**/*.d.ts',
    'packages-*/*/dist/**/*.d.cts',
  ], {
    cwd: root,
    ignore: ['**/node_modules/**'],
    expandDirectories: false,
  })

  console.log(`${cjsDeclarationFiles.length} CJS declaration files found`)
  console.log(cjsDeclarationFiles.map(i => ` - ${i}`).join('\n'))

  let error = false
  await Promise.all(cjsDeclarationFiles.map(async (file) => {
    const code = await fs.readFile(join(root, file), 'utf-8')
    const match = code.match(forbiddenCjsImport)
    if (match) {
      console.error(`\nFound forbidden code in ${file}`)
      console.error(` - ${match[0]}`)
      error = true
    }
  }))

  if (error)
    process.exitCode = 1
  else
    console.log('\nDist files verify passed')
}

if (process.argv[1] === new URL(import.meta.url).pathname)
  await verifyDist(process.argv[2])
