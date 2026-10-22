import { readFile, writeFile } from 'node:fs/promises'
import { dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
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
  const content = JSON.parse(await readFile(file, 'utf-8'))
  const dir = relative(root, dirname(file))
  console.log(content, file)
  content.homepage = 'https://unocss.dev'
  content.repository = {
    type: 'git',
    url: 'https://github.com/unocss/unocss',
    directory: dir,
  }
  await writeFile(file, `${JSON.stringify(content, null, 2)}\n`, 'utf-8')
}
