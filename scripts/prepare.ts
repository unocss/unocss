import { basename, dirname, extname, relative } from 'path'
import fg from 'fast-glob'
import fs from 'fs-extra'

const exportSubmodules = '/* @export-submodules */'

const files = await fg(['packages/**/index.ts', '!node_modules/**'], {
  absolute: true,
})

for (const file of files) {
  let content = await fs.readFile(file, 'utf-8')
  const index = content.indexOf(exportSubmodules)
  if (index !== -1) {
    const submodules = await fg(['**/*.ts'], { cwd: dirname(file), absolute: true })
    const imports = submodules
      .filter(i => i !== file)
      .map(i => relative(dirname(file), i))
      .map(i => `export * from './${basename(i, extname(i))}'`).join('\n')
    content = `${content.slice(0, index) + exportSubmodules}\n${imports}\n`
    await fs.writeFile(file, content, 'utf-8')
  }
}
