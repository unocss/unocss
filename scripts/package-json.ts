import { dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'
import { glob } from 'tinyglobby'

const root = fileURLToPath(new URL('../', import.meta.url))

const files = await glob(
  ['packages-{engine,integrations,presets}/*/package.json'],
  {
    ignore: [
      '**/node_modules/**',
    ],
    cwd: root,
    absolute: true,
    expandDirectories: false,
  },
)

for (const file of files) {
  const content = await fs.readJSON(file, 'utf-8')
  const dir = relative(root, dirname(file))
  console.log(content, file)
  content.homepage = 'https://unocss.dev'
  content.repository = {
    type: 'git',
    url: 'https://github.com/unocss/unocss',
    directory: dir,
  }
  await fs.writeJSON(file, content, { spaces: 2, EOL: '\n' })
}
