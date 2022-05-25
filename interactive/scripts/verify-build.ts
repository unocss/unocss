import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { promises as fs } from 'fs'
import fg from 'fast-glob'

const dir = dirname(fileURLToPath(import.meta.url))

const files = await fg('entry-*.mjs', {
  cwd: join(dir, '../dist/_nuxt'),
  absolute: true,
  onlyFiles: true,
})

if (!files.length)
  throw new Error('No entry file found under dist/_nuxt/')

if (files.length !== 1)
  throw new Error('Multiple entry files found under dist/_nuxt/')

const file = files[0]
const content = await fs.readFile(file, 'utf8')

if (!content.includes('vueApp.component("NuxtPage"'))
  throw new Error('<NuxtPage/> is not registed, there is probably something wrong')
