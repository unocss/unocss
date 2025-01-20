import { fileURLToPath } from 'node:url'
import { execa } from 'execa'
import fs from 'fs-extra'
import { relative } from 'pathe'
import { globSync } from 'tinyglobby'

async function fixVSCodePackage() {
  const json = await fs.readJSON('./packages-integrations/vscode/package.json')
  if (json.name !== '@unocss/vscode') {
    json.name = '@unocss/vscode'
    await fs.writeJSON('./packages-integrations/vscode/package.json', json, { spaces: 2, EOL: '\n' })
  }
}

async function preparePackagesBundle() {
  const allPackages = globSync(
    ['./packages-*/*/package.json'],
    { absolute: true, expandDirectories: false },
  )
    .map((p) => {
      const json = JSON.parse(fs.readFileSync(p, 'utf-8'))
      if (json.private)
        return undefined
      return json.name
    })
    .filter(x => !!x)

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

  const clientPackages = allPackages.filter(p => !ignores.some(i => p.includes(i)))

  await fs.writeFile(
    './virtual-shared/docs/src/packages.ts',
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
    './virtual-shared/docs/src/unocss-bundle.ts',
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

async function updateTsconfig() {
  const root = fileURLToPath(new URL('..', import.meta.url))
  const alias = await import('../alias').then(r => r.alias)
  const tsconfig = await fs.readJSON('./tsconfig.json')
  tsconfig.compilerOptions.paths = Object.fromEntries(
    Object.entries(alias).map(([k, v]) => {
      let path = `./${relative(root, v)}`
      if (!path.match(/\.\w+$/) && !path.endsWith('/'))
        path = `${path}/`
      return [k, [path]]
    }),
  )
  await fs.writeJSON('./tsconfig.json', tsconfig, { spaces: 2, EOL: '\n' })
}

async function prepare() {
  await Promise.all([
    execa('pnpm', ['run', 'update:iconify-collections']),
    fixVSCodePackage(),
    preparePackagesBundle(),
    updateTsconfig(),
    execa('npx', ['simple-git-hooks']),
  ])
}

prepare()
