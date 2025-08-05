import path, { basename, parse } from 'node:path'
import { fileURLToPath } from 'node:url'
import { objectMap } from '@antfu/utils'
import fs from 'fs-extra'
import YAML from 'js-yaml'
import { genArrayFromRaw, genObjectFromRaw } from 'knitwork'
import { globSync } from 'tinyglobby'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const { writeFileSync } = fs

await fs.ensureDir(path.join(__dirname, '../app/guides/vendor/'))
await fs.ensureDir(path.join(__dirname, '../app/data/'))

const code = genArrayFromRaw(
  globSync([path.join(__dirname, '../app/guides/**/*.{md,vue}')], { expandDirectories: false })
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

writeFileSync(path.join(__dirname, '../app/data/guides.ts'), `
import type { GuideItem } from '~/types'

export const guideIndex: GuideItem[] = ${code}

export const guideColors = guideIndex.find(i => i.name === 'colors')!
`, 'utf-8')
