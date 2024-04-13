import fs from 'node:fs/promises'
import { basename } from 'node:path'
import { sync as brotli } from 'brotli-size'
import { sync as gzip } from 'gzip-size'
import { minify } from 'terser'
import { fdir as FDir } from 'fdir'
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
  const files = new FDir()
    .filter((path, isDir) => path.endsWith('.mjs') && !isDir)
    .withFullPaths()
    .crawl(`packages/${pkg}/dist`)
    .sync()
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

const globals = await new FDir()
  .filter(path => path.endsWith('.global.js'))
  .withFullPaths()
  .crawl('packages/runtime')
  .withPromise()

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
