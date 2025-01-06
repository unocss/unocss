import { execa } from 'execa'
import fs from 'fs-extra'
import { globSync } from 'tinyglobby'

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
    execa('pnpm', ['run', 'update:iconify-collections']),
    fixVSCodePackage(),
    preparePackagesBundle(),
    execa('npx', ['simple-git-hooks']),
  ])
}

prepare()
