import { promises as fs } from 'fs'
import { join } from 'path'
import { dir } from './meta.mjs'

const variants = [
  'hover',
  'focus',
  'hover:focus:first:active',
  'dark',
  'md',
  'sm',
  'lg',
]

const names = [
  'p',
  'pt',
  'mx',
  'm',
  'bg',
  'text',
  'opacity',
  'border-t',
]

const values = [
  ...Array.from({ length: 10 }, (_, i) => i.toString()),
  '100',
  '300',
  'red-100',
  'blue-100/10',
  '[1px]',
  '[3.555em]',
  'none',
  'xl',
  '2xl',
]

const classes = []

for (const v of variants) {
  for (const n of names) {
    for (const t of values)
      classes.push(`${v}:${n}-${t}`)
  }
}

// eslint-disable-next-line no-console
console.log(classes.length)

const content = `document.getElementById('app').className = "${classes.join(' ')}"`
await fs.writeFile(join(dir, 'source/gen.js'), content, 'utf-8')
