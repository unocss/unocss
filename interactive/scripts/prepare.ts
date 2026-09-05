import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path, { basename, parse } from 'node:path'
import { fileURLToPath } from 'node:url'
import { objectMap } from '@antfu/utils'
import { genArrayFromRaw, genObjectFromRaw } from 'knitwork'
import { globSync } from 'tinyglobby'
import { parse as parseYaml } from 'yaml'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

mkdirSync(path.join(__dirname, '../app/guides/vendor/'), { recursive: true })
mkdirSync(path.join(__dirname, '../app/data/'), { recursive: true })

const code = genArrayFromRaw(
  globSync([path.join(__dirname, '../app/guides/**/*.{md,vue}')], { expandDirectories: false })
    .map((file) => {
      const ext = parse(file).ext
      const yml = `${file.slice(0, -ext.length)}.yml`
      const data: any = existsSync(yml)
        ? parseYaml(readFileSync(yml, 'utf-8'))
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

writeFileSync(path.join(__dirname, '../app/data/guides.ts'), `
import type { GuideItem } from '~/types'

export const guideIndex: GuideItem[] = ${code}

export const guideColors = guideIndex.find(i => i.name === 'colors')!
`, 'utf-8')
