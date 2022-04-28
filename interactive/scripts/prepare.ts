import { basename, parse } from 'path'
import fs from 'fs-extra'
import fg from 'fast-glob'
import YAML from 'js-yaml'
import { genArrayFromRaw, genObjectFromRaw } from 'knitwork'
import { objectMap } from '@antfu/utils'

const { copyFileSync, copySync, ensureDirSync, writeFileSync } = fs

copySync('node_modules/shiki/', 'public/shiki/', {
  filter: src => src === 'node_modules/shiki/' || src.includes('languages') || src.includes('dist'),
})

copySync('node_modules/theme-vitesse/themes', 'public/shiki/themes')
copySync('node_modules/theme-vitesse/themes', 'node_modules/shiki/themes', { overwrite: true })

ensureDirSync('guides/vendor/')

copyFileSync('../packages/preset-uno/README.md', 'guides/vendor/preset-uno.md')
copyFileSync('../packages/preset-wind/README.md', 'guides/vendor/preset-wind.md')
copyFileSync('../packages/preset-icons/README.md', 'guides/vendor/preset-icons.md')
copyFileSync('../packages/preset-mini/README.md', 'guides/vendor/preset-mini.md')
copyFileSync('../packages/preset-attributify/README.md', 'guides/vendor/preset-attributify.md')
copyFileSync('../packages/preset-web-fonts/README.md', 'guides/vendor/preset-web-fonts.md')
copyFileSync('../packages/preset-typography/README.md', 'guides/vendor/preset-typography.md')

copyFileSync('../packages/cli/README.md', 'guides/vendor/cli.md')
copyFileSync('../packages/vite/README.md', 'guides/vendor/vite.md')
copyFileSync('../packages/webpack/README.md', 'guides/vendor/webpack.md')
copyFileSync('../packages/runtime/README.md', 'guides/vendor/runtime.md')
copyFileSync('../packages/nuxt/README.md', 'guides/vendor/nuxt.md')

const code = genArrayFromRaw(
  fg.sync('guides/**/*.{md,vue}')
    .map((file) => {
      const ext = parse(file).ext
      const yml = `${file.slice(-ext.length)}.yml`
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
