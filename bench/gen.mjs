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
]

const values = [
  ...Array.from({ length: 10 }, (_, i) => i.toString()),
  '100',
  '300',
  'red-100',
  'teal-100/10',
  '[1px]',
  '[3.555em]',
  'none',
  'xl',
]

const classes = []

for (const v of variants) {
  for (const n of names) {
    for (const t of values)
      classes.push(`${v}:${n}-${t}`)
  }
}

const content = `<template><div v-pre><div class="${classes.join(' ')}"/></div></template>`
await fs.writeFile(join(dir, 'fixtures/none/src/Gen.vue'), content, 'utf-8')
