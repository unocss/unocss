import { readFileSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { relative } from 'pathe'
import { x } from 'tinyexec'
import { globSync } from 'tinyglobby'

async function fixVSCodePackage() {
  const json = JSON.parse(await readFile('./packages-integrations/vscode/package.json', 'utf-8'))
  if (json.name !== '@unocss/vscode') {
    json.name = '@unocss/vscode'
    await writeFile('./packages-integrations/vscode/package.json', `${JSON.stringify(json, null, 2)}\n`, 'utf-8')
  }
}

async function preparePackagesBundle() {
  const allPackages = globSync(
    ['./packages-*/*/package.json'],
    { absolute: true, expandDirectories: false },
  )
    .map((p) => {
      const json = JSON.parse(readFileSync(p, 'utf-8'))
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
    'rollup',
    'shared',
    'scope',
    'babel',
    '/config',
    'extractor',
    'processor-lightningcss',
    'language-server',
    'twoslash',
  ]

  const clientPackages = allPackages.filter(p => !ignores.some(i => p.includes(i)))

  await writeFile(
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

  await writeFile(
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
  const { alias, aliasSource } = await import('../alias')

  function toPath(value: string) {
    let path = `./${relative(root, value)}`
    if (!/\.\w+$/.test(path) && !path.endsWith('/'))
      path = `${path}/`
    return path
  }

  // The root config is used by builds and by package sources, so workspace
  // packages resolve through their declared dependencies. Only the test
  // project maps them to source.
  const virtualPaths = Object.fromEntries(
    Object.entries(alias).map(([key, value]) => [key, [toPath(value)]]),
  )
  const testPaths: Record<string, string[]> = { ...virtualPaths }
  for (const [key, value] of Object.entries(aliasSource)) {
    const path = toPath(value)
    testPaths[key] = [path]
    if (path.endsWith('/'))
      testPaths[`${key}/*`] = [`${path}*`]
  }

  const tsconfig = JSON.parse(await readFile('./tsconfig.json', 'utf-8'))
  tsconfig.compilerOptions.paths = Object.fromEntries(
    Object.entries(virtualPaths).sort(([a], [b]) => a.localeCompare(b)),
  )
  await writeFile('./tsconfig.json', `${JSON.stringify(tsconfig, null, 2)}\n`, 'utf-8')

  await writeFile('./tsconfig.test.json', `${JSON.stringify({
    extends: './tsconfig.json',
    compilerOptions: {
      lib: ['esnext', 'dom'],
      paths: Object.fromEntries(
        Object.entries(testPaths).sort(([a], [b]) => a.localeCompare(b)),
      ),
    },
    include: [
      'test/**/*.ts',
      'packages-*/**/test/**/*.ts',
      'packages-*/**/src/**/*.test.ts',
      'virtual-shared/**/test/**/*.ts',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/__snapshots__/**',
      '**/test/dts/**',
      '**/fixtures/**',
      'packages-integrations/eslint-plugin/**',
    ],
  }, null, 2)}\n`, 'utf-8')
}

async function prepare() {
  await Promise.all([
    x('pnpm', ['run', 'update:iconify-collections'], { throwOnError: true }),
    fixVSCodePackage(),
    preparePackagesBundle(),
    updateTsconfig(),
    x('npx', ['simple-git-hooks'], { throwOnError: true }),
  ])
}

prepare()
