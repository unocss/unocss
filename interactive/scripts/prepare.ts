import { basename, dirname, parse } from 'path'
import fs from 'fs-extra'
import fg from 'fast-glob'
import YAML from 'js-yaml'
import { genArrayFromRaw, genObjectFromRaw } from 'knitwork'
import { objectMap } from '@antfu/utils'

const dereference = process.platform === 'win32' ? true : undefined

const { copyFile, copy, writeFileSync } = fs

await fs.ensureDir('guides/vendor/')

await copy('node_modules/shiki/', 'public/shiki/', {
  dereference,
  filter: src => src === 'node_modules/shiki/' || src.includes('languages') || src.includes('dist'),
})
await copy('node_modules/theme-vitesse/themes', 'public/shiki/themes', { dereference })
await copy('node_modules/theme-vitesse/themes', 'node_modules/shiki/themes', { overwrite: true, dereference })

await Promise.all([
  copyFile('../README.md', 'guides/vendor/intro.md'),
  ...fg.sync('../packages/*/README.md')
    .map(async (src) => {
      const name = basename(dirname(src))
      if (['unocss', 'scope', 'shared-integration'].includes(name))
        return
      copyFile(src, `guides/vendor/${name}.md`)
    }),
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
