import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execa } from 'execa'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ICONIFY_COLLECTION = path.resolve(__dirname, '../packages-presets/preset-icons/src/collections.ts')

async function update() {
  try {
    const collections: string[] = []
    const res = await fetch('https://api.github.com/repos/iconify/icon-sets/contents/json')
    const data: Array<{ name: string, type: 'file' | 'dir' }> = await res.json()

    for (const item of data) {
      if (item.type === 'file' && item.name.endsWith('.json')) {
        collections.push(item.name.replace(/\.json$/, ''))
      }
    }

    await writeFile(
      ICONIFY_COLLECTION,
      `export default ${JSON.stringify(collections)}`,
      'utf-8',
    )

    execa('eslint', ['--fix', '--no-ignore', ICONIFY_COLLECTION])
  }
  catch (err) {
    console.log(err)
  }
}

update()
