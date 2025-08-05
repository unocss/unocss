import { basename, parse } from 'node:path'
import { objectMap } from '@antfu/utils'
import fs from 'fs-extra'
import YAML from 'js-yaml'
import { genArrayFromRaw, genObjectFromRaw } from 'knitwork'
import { globSync } from 'tinyglobby'

const { writeFileSync } = fs

await fs.ensureDir('../app/guides/vendor/')
await fs.ensureDir('../app/data/')

const code = genArrayFromRaw(
  globSync(['../app/guides/**/*.{md,vue}'], { expandDirectories: false })
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

writeFileSync('../app/data/guides.ts', `
import type { GuideItem } from '~/types'

export const guideIndex: GuideItem[] = ${code}

export const guideColors = guideIndex.find(i => i.name === 'colors')!
`, 'utf-8')
