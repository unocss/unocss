import fs from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { glob } from 'tinyglobby'

// UnoCSS packages are ESM-only, so CJS output must not require them
const forbiddenCjsImport = /\brequire\(\s*['"]@?unocss(?:\/core)?['"]\s*\)/

export async function verifyDist(root = process.cwd()) {
  const cjsOutputFiles = await glob([
    'packages-*/*/dist/**/*.cjs',
    'packages-*/*/dist/**/*.d.cts',
  ], {
    cwd: root,
    ignore: ['**/node_modules/**'],
    expandDirectories: false,
  })

  console.log(`${cjsOutputFiles.length} CJS output files found`)
  console.log(cjsOutputFiles.map(i => ` - ${i}`).join('\n'))

  let error = false
  await Promise.all(cjsOutputFiles.map(async (file) => {
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
