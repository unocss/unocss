import { existsSync, promises as fs } from 'fs'
import { join } from 'path'
import { dir } from './meta.mjs'

const sizes = [
  'sm',
  'lg',
  'xl',
]

const colors = map(
  [
    'red',
    'orange',
    'blue',
  ],
  [
    '200',
    '400',
  ],
)

const variants = [
  'hover',
  'first',
  'active',
  'dark',
  'dark:hover:focus:first:active',
  ...sizes,
  ...map(sizes, ['dark:hover:focus:first:active'], ':'),
]

const names = [
  ...map(
    ['p', 'pt', 'm', 'mx', 'top'],
    [
      ...Array.from({ length: 10 }, (_, i) => i.toString()),
      '[1px]',
      '[3vh]',
      '[3.555em]',
    ],
  ),
  ...map(
    ['text', 'bg', 'border'],
    [
      ...colors,
      ...map(colors, ['10', '20'], '/'),
      '[#525343]',
      '[#124453]',
      '[#942]',
    ],
  ),
  ...map(
    ['text', 'rounded'],
    [
      ...sizes,
    ],
  ),
  ...map([
    'grid-cols',
  ], [
    '1',
    '2',
    '[1fr,3em]',
    '[20px,min-content,1fr]',
  ]),
]

function map(a, b, join = '-') {
  const classes = []
  for (const n of a) {
    for (const t of b)
      classes.push(n + join + t)
  }
  return classes
}

export const classes = [
  ...names,
  ...map(variants, names, ':'),
]

export async function writeMock() {
  const content = () => `document.getElementById('app').innerHTML = \`${chunk(shuffle(classes)).map(c => `<div class="${c.join(' ')}" />`).join('\n')}\``
  if (!existsSync(join(dir, 'source')))
    await fs.mkdir(join(dir, 'source'))
  await fs.writeFile(join(dir, 'source/gen1.js'), content(), 'utf-8')
  await fs.writeFile(join(dir, 'source/gen2.js'), content(), 'utf-8')
  await fs.writeFile(join(dir, 'source/gen3.js'), content(), 'utf-8')
  await fs.writeFile(join(dir, 'source/gen.js'), 'import "./gen1";import "./gen2";import "./gen3";', 'utf-8')
  return classes
}

export function shuffle(array) {
  array = Array.from(array)
  let curr = array.length
  let idx

  // While there remain elements to shuffle...
  while (curr !== 0) {
    // Pick a remaining element...
    idx = Math.floor(Math.random() * curr)
    curr--;

    // And swap it with the current element.
    [array[curr], array[idx]] = [array[idx], array[curr]]
  }

  return array
}

export function chunk(array, size = 15) {
  const chunks = []
  for (let i = 0; i < array.length; i += size)
    chunks.push(array.slice(i, i + size))
  return chunks
}
