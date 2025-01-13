import { basename, dirname, extname, relative } from 'node:path'
import fs from 'fs-extra'
import { glob } from 'tinyglobby'

// Generated index.ts files contain this comment
const exportSubmodules = '/* @export-submodules */'

const files = await glob(
  ['packages-*/**/index.ts'],
  {
    ignore: [
      '**/node_modules/**',
    ],
    absolute: true,
    expandDirectories: false,
  },
)

for (const file of files) {
  let content = await fs.readFile(file, 'utf-8')
  const index = content.indexOf(exportSubmodules)
  if (index !== -1) {
    const submodules = await glob(['**/*.ts'], {
      cwd: dirname(file),
      absolute: true,
      ignore: ['**/*.test.ts'],
      expandDirectories: false,
    })
    const imports = submodules
      .filter(i => i !== file)
      .map(i => relative(dirname(file), i))
      .map(i => `export * from './${basename(i, extname(i))}'`)
      .join('\n')
    content = `${content.slice(0, index) + exportSubmodules}\n${imports}\n`
    await fs.writeFile(file, content, 'utf-8')
  }
}
