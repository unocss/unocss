import { basename, dirname, extname, relative } from 'node:path'
import { fdir as FDir } from 'fdir'
import fs from 'fs-extra'

// Generated index.ts files contain this comment
const exportSubmodules = '/* @export-submodules */'

const files = await new FDir()
  .withFullPaths()
  .exclude(dirName => dirName === 'node_modules')
  .filter((path, isDir) => path.endsWith('/index.ts') && !isDir)
  .crawl('.')
  .withPromise()

for (const file of files) {
  let content = await fs.readFile(file, 'utf-8')
  const index = content.indexOf(exportSubmodules)
  if (index !== -1) {
    const submodules = await new FDir()
      .filter((path, isDir) => path.endsWith('.ts') && !isDir && !path.endsWith('.test.ts'))
      .withFullPaths()
      .crawl(dirname(file))
      .withPromise()
    const imports = submodules
      .filter(i => i !== file)
      .map(i => relative(dirname(file), i))
      .map(i => `export * from './${basename(i, extname(i))}'`).join('\n')
    content = `${content.slice(0, index) + exportSubmodules}\n${imports}\n`
    await fs.writeFile(file, content, 'utf-8')
  }
}
