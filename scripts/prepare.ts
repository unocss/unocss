import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'
import { execa } from 'execa'
import { globSync } from 'tinyglobby'

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

const ignores = [
  'vscode',
  'cli',
  'astro',
  'nuxt',
  'postcss',
  'webpack',
  'vite',
  'inspector',
  'eslint',
  'reset',
  'svelte',
  'runtime',
  'mdc',
  'shared',
  'pug',
  'scope',
  'babel',
  '/config',
]

async function preparePackagesBundle() {
  const allPackages = globSync(['./packages/*/package.json'], { absolute: true, expandDirectories: false })
    .map(p => JSON.parse(fs.readFileSync(p, 'utf-8')).name)

  const clientPackages = allPackages.filter(p => !ignores.some(i => p.includes(i)))

  await fs.writeFile(
    './packages/shared-docs/src/packages.ts',
    [
      '// GENERATED FILE, DO NOT EDIT',
      '/* eslint-disable eslint-comments/no-unlimited-disable */',
      '/* eslint-disable */',
      '',
      `export const allPackages = ${JSON.stringify(allPackages, null, 2)}`,
      '',
      `export const bundlePackages = ${JSON.stringify(clientPackages, null, 2)}`,
    ].join('\n'),
    'utf-8',
  )

  await fs.writeFile(
    './packages/shared-docs/src/unocss-bundle.ts',
    [
      '// GENERATED FILE, DO NOT EDIT',
      '/* eslint-disable eslint-comments/no-unlimited-disable */',
      '/* eslint-disable */',
      '',
      `export const unocssBundle = new Map([`,
      clientPackages.map(p => `  [${JSON.stringify(p)}, () => import('${p}')] as any,`).join('\n'),
      `]) as Map<string, () => Promise<any>>`,
    ].join('\n'),
    'utf-8',
  )
}

async function prepare() {
  await Promise.all([
    prepareCollections(),
    fixVSCodePackage(),
    preparePackagesBundle(),
    execa('npx', ['simple-git-hooks']),
  ])
}

prepare()
