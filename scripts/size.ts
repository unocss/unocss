import fs from 'fs/promises'
import { sync as brotli } from 'brotli-size'
import { sync as gzip } from 'gzip-size'
import { minify } from 'terser'
import fg from 'fast-glob'
import { version } from '../package.json'

const packages = [
  'core',
  'preset-attributify',
  'preset-icons',
  'preset-uno',
]

for (const pkg of packages) {
  const files = fg.sync(`packages/${pkg}/dist/*.mjs`, { absolute: true })
  let minified = ''
  for (const file of files) {
    const code = await fs.readFile(file, 'utf8')
    minified += (await minify(code)).code
  }

  console.log()
  console.log(`@unocss/${pkg} v${version}`)
  console.log(`gzip    ${(gzip(minified) / 1024).toFixed(2)} KiB`)
  console.log(`brotli  ${(brotli(minified) / 1024).toFixed(2)} KiB`)
}
