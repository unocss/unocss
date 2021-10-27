import { createGenerator, escapeSelector, presetUno } from 'unocss'

const targets = [
  '-gap-y-5',
  '-m-auto',
  '!hover:px-10',
  '!p-5px',
  'all:m-auto',
  'bg-[#153]/10',
  'bg-[#1533]',
  'bg-[#1533]/10',
  'bg-#452233/40',
  'bg-hex-452233/40',
  'bg-opacity-45',
  'bg-red-100',
  'bg-teal-100/55',
  'blur-4',
  'border-2',
  'border-b',
  'border-green-100/10',
  'border-t-2',
  'border',
  'children:m-auto',
  'dark:not-odd:text-red',
  'dark:text-xl',
  'duration-111',
  'flex-[hi]',
  'flex',
  'font-mono',
  'gap-4',
  'gap-x-1',
  'grid-cols-[1fr,2fr,100px,min-content]',
  'grid-cols-2',
  'grid-rows-[1fr,2fr,100px,min-content]',
  'grid-rows-3',
  'grid',
  'h-1',
  'hover:!p-10',
  'hover:not-first:checked:bg-red/10',
  'hover:p-4',
  'leading-2',
  'light:text-sm',
  'm-[3em]',
  'm-0',
  'm-1/2',
  'm-auto',
  'max-h-[1px]',
  'md:!hidden',
  'md:m-1',
  'my-auto',
  'op-10',
  'opacity-0',
  'order-first',
  'overflow-auto',
  'overflow-x-scroll',
  'p-2',
  'p-t-2',
  'p2',
  'pl-10px',
  'pt-2',
  'pt2',
  'rounded-[4px]',
  'rounded-1/2',
  'rounded-full',
  'rounded-md',
  'rounded-rb-1/2',
  'rounded-t-sm',
  'rounded-tr',
  'rounded',
  'sm:m-1',
  'sm:m1',
  'lt-sm:m1',
  'lt-lg:m2',
  'text-[#124]',
  'text-4xl',
  'text-base',
  'text-black/10',
  'text-blue',
  'text-lg',
  'text-red-100',
  'text-red-200/10',
  'text-red-300/20',
  'text-red100',
  'text-red2',
  'top-0',
  'tracking-wide',
  'transition-200',
  'transition',
  'w-1/2',
  'z-1',
  'z-100',
  'filter',
  'invert',
  'shadow',
  'shadow-xl',
  'mt-[-10.2%]',
  'ring',
  'ring-10',
  'ring-red2',
  'ring-offset-4',
  'ring-offset-green5',
  'inset-x-5',
  'translate-y-1/4',
]

const nonTargets = [
  '--p-2',
  'hover:hover:m2',
]

const uno = createGenerator({
  presets: [
    presetUno(),
  ],
})

test('targets', async() => {
  const code = targets.join(' ')
  const { css } = await uno.generate(code)
  const { css: css2 } = await uno.generate(code)

  const unmatched = []
  for (const i of targets) {
    if (!css.includes(escapeSelector(i)))
      unmatched.push(i)
  }
  expect(unmatched).toEqual([])
  expect(css).toMatchSnapshot()
  expect(css).toEqual(css2)
})

test('non-targets', async() => {
  const code = nonTargets.join(' ')
  const { css, matched } = await uno.generate(code)

  expect(Array.from(matched)).toEqual([])
  expect(css).toMatch('')
})
