import fs from 'node:fs/promises'
import { basename } from 'node:path'
import { sync as brotli } from 'brotli-size'
import { sync as gzip } from 'gzip-size'
import { minify } from 'terser'
import { glob, globSync } from 'tinyglobby'
import { version } from '../package.json'

const packages = [
  'core',
  'preset-attributify',
  'preset-icons',
  'preset-mini',
  'preset-wind',
  'preset-uno',
]

console.log()
console.log(`unocss v${version}`)

for (const pkg of packages) {
  const files = globSync([`packages-*/${pkg}/dist/**/*.mjs`], { absolute: true, expandDirectories: false })
  let minified = ''
  for (const file of files) {
    const code = await fs.readFile(file, 'utf8')
    minified += (await minify(code)).code
  }

  console.log()
  console.log(`@unocss/${pkg}`)
  console.log(`gzip    ${(gzip(minified) / 1024).toFixed(2)} KiB`)
  console.log(`brotli  ${(brotli(minified) / 1024).toFixed(2)} KiB`)
}

const globals = await glob(['packages-engine/runtime/*.global.js'], {
  absolute: true,
  expandDirectories: false,
})

console.log()
console.log('@unocss/runtime')
for (const f of globals) {
  console.log()
  console.log(basename(f))
  const code = await fs.readFile(f, 'utf8')
  const minified = (await minify(code)).code || ''
  console.log(`gzip    ${(gzip(minified) / 1024).toFixed(2)} KiB`)
  console.log(`brotli  ${(brotli(minified) / 1024).toFixed(2)} KiB`)
}
