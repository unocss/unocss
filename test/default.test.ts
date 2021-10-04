import { createGenerator, escapeSelector } from 'unocss'

const classes = [
  '-gap-y-5',
  '!hover:px-10',
  '!p-5px',
  'bg-[#153]/10',
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
  'dark:not-odd:text-red',
  'flex',
  'font-mono',
  'gap-4',
  'hover:!p-10',
  'hover:not-first:checked:bg-red/10',
  'hover:p-4',
  'm-[3em]',
  'm-0',
  'm-1/2',
  'm-auto',
  '-m-auto',
  'md:!hidden',
  'md:m-1',
  'my-auto',
  'op-10',
  'opacity-0',
  'order-first',
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
  'text-[#124]',
  'text-4xl',
  'text-base',
  'text-black/10',
  'text-blue',
  'text-lg',
  'text-red-100',
  'text-red-200/10',
  'text-red-300',
  'text-red-300/20',
  'top-0',
  'z-100',
]

const code = classes.join(' ')
const uno = createGenerator()

test('default', async() => {
  const { css } = await uno.generate(code)

  const unmatched = []
  for (const i of classes) {
    if (!css.includes(escapeSelector(i)))
      unmatched.push(i)
  }
  expect(unmatched).toEqual([])
  expect(css).toMatchSnapshot()
})
