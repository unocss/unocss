import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'
import { execa } from 'execa'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const out = path.resolve(__dirname, '../packages/preset-icons')

async function prepareCollections() {
  const dir = path.resolve(__dirname, '../node_modules/@iconify/json/json')
  await fs.ensureDir(dir)

  const collections = (await fs.readdir(dir)).map(file => file.replace(/\.json$/, ''))
  await fs.writeJSON(path.resolve(out, 'src/collections.json'), collections)
}

async function fixVSCodePackage() {
  const json = await fs.readJSON('./packages/vscode/package.json')
  if (json.name !== '@unocss/vscode') {
    json.name = '@unocss/vscode'
    await fs.writeJSON('./packages/vscode/package.json', json, { spaces: 2, EOL: '\n' })
  }
}

async function prepare() {
  await Promise.all([
    prepareCollections(),
    fixVSCodePackage(),
    execa('npx', ['simple-git-hooks']),
  ])
}

prepare()
