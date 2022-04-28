import { basename, parse } from 'path'
import fs from 'fs-extra'
import fg from 'fast-glob'
import YAML from 'js-yaml'
import { genArrayFromRaw, genObjectFromRaw } from 'knitwork'
import { objectMap } from '@antfu/utils'

const { copyFile, copy, writeFileSync } = fs

await fs.ensureDir('guides/vendor/')

await Promise.all([
  copy('node_modules/shiki/', 'public/shiki/', {
    filter: src => src === 'node_modules/shiki/' || src.includes('languages') || src.includes('dist'),
  }),
  copy('node_modules/theme-vitesse/themes', 'public/shiki/themes'),
  copy('node_modules/theme-vitesse/themes', 'node_modules/shiki/themes', { overwrite: true }),

  copyFile('../README.md', 'guides/vendor/intro.md'),
  copyFile('../packages/preset-uno/README.md', 'guides/vendor/preset-uno.md'),
  copyFile('../packages/preset-wind/README.md', 'guides/vendor/preset-wind.md'),
  copyFile('../packages/preset-icons/README.md', 'guides/vendor/preset-icons.md'),
  copyFile('../packages/preset-mini/README.md', 'guides/vendor/preset-mini.md'),
  copyFile('../packages/preset-attributify/README.md', 'guides/vendor/preset-attributify.md'),
  copyFile('../packages/preset-web-fonts/README.md', 'guides/vendor/preset-web-fonts.md'),
  copyFile('../packages/preset-typography/README.md', 'guides/vendor/preset-typography.md'),
  copyFile('../packages/cli/README.md', 'guides/vendor/cli.md'),
  copyFile('../packages/vite/README.md', 'guides/vendor/vite.md'),
  copyFile('../packages/webpack/README.md', 'guides/vendor/webpack.md'),
  copyFile('../packages/runtime/README.md', 'guides/vendor/runtime.md'),
  copyFile('../packages/nuxt/README.md', 'guides/vendor/nuxt.md'),
  copyFile('../packages/vscode/README.md', 'guides/vendor/vscode.md'),
])

const code = genArrayFromRaw(
  fg.sync('guides/**/*.{md,vue}')
    .map((file) => {
      const ext = parse(file).ext
      const yml = `${file.slice(0, -ext.length)}.yml`
      const data: any = fs.existsSync(yml)
        ? YAML.load(fs.readFileSync(yml, 'utf-8'))
        : {}
      return genObjectFromRaw({
        ...objectMap({
          type: 'guide',
          name: basename(file, ext),
          title: basename(file, ext),
          ...data,
        }, (k, v) => [k, JSON.stringify(v)]),
        component: `() => import('../${file}')`,
      })
    }),
)

writeFileSync('data/guides.ts', `
import type { GuideItem } from '~/types'

export const guideIndex: GuideItem[] = ${code}

export const guideColors = guideIndex.find(i => i.name === 'colors')!
`, 'utf-8')
