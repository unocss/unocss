import { basename, parse } from 'node:path'
import fs from 'fs-extra'
import fg from 'fast-glob'
import YAML from 'js-yaml'
import { genArrayFromRaw, genObjectFromRaw } from 'knitwork'
import { objectMap } from '@antfu/utils'

const { writeFileSync } = fs

await fs.ensureDir('guides/vendor/')

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
