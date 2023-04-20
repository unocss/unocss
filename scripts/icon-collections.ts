import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const out = path.resolve(__dirname, '../packages/preset-icons')

async function prepareJSON() {
  const dir = path.resolve(__dirname, '../node_modules/@iconify/json/json')
  await fs.ensureDir(dir)

  const collections = (await fs.readdir(dir)).map(file => file.replace(/\.json$/, ''))
  await fs.writeJSON(path.resolve(out, 'src/collections.json'), collections)
}

async function prepare() {
  await prepareJSON()
}

prepare()
