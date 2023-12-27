import fs from 'node:fs/promises'
import process from 'node:process'
import fg from 'fast-glob'

export async function verifyDist() {
  const cjsFiles = await fg('packages/*/dist/**/*.cjs', {
    ignore: ['**/node_modules/**'],
  })

  console.log(`${cjsFiles.length} cjs files found`)
  console.log(cjsFiles.map(i => ` - ${i}`).join('\n'))

  const forbidden = [
    // Make sure no CJS is importing UnoCSS packages as they are ESM only
    /require\(['"]@?unocss(\/core)?['"]\)/,
    // Use `exports.default` instead, should be patched by postbuild.ts
    'module.exports',
  ]

  let error = false
  await Promise.all(cjsFiles.map(async (file) => {
    const code = await fs.readFile(file, 'utf-8')
    const matches = forbidden.map(r => code.match(r)).filter(Boolean)
    if (matches.length) {
      console.error(`\nFound forbidden code in ${file}`)
      console.error(matches.map(i => ` - ${i![0]}`).join('\n'))
      error = true
    }
  }))

  if (error)
    process.exitCode = 1
  else
    console.log('\nDist files verify passed')
}

if (process.argv[1] === new URL(import.meta.url).pathname)
  await verifyDist()
