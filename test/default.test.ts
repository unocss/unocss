import { createGenerator } from 'miniwind'

const fixture = [
  'p-1',
  'pt-2',
  'p-t-2',
  'p-3',
  'pl-10px',
  'hover:p-4',
  '!p-5px',
  '!hover:px-10',
  'hover:!p-10',
  'op-10',
  'opacity-0',
  'flex',
  'text-red-300',
  'text-blue',
  'text-warn-gray',
  'text-black/10',
  'bg-teal-100/55',
  'border',
  'border-2',
  'font-mono',
  'm-auto',
  'my-auto',
  'm-[3em]',
  'sm:text-red-100',
  'sm:text-red-200/10',
  'sm:text-red-300/20',
  'md:!hidden',
  'rounded-t-sm',
  'rounded-md',
  'rounded-tr',
  'rounded-1/2',
  'rounded-rb-1/2',
  'rounded-full',
  'rounded-[4px]',
  'rounded',
  'dark:not-odd:text-red',
  'hover:not-first:checked:bg-red/10',
  'text-base',
  'text-lg',
  'text-4xl',
  'bg-red-100 bg-opacity-45',
  'border-b border-t-2 border-green-100/10',
  'blur-4',
  'gap-4',
  '-gap-y-5',
  'z-100',
  'order-first',
  'text-[#124]',
  'bg-[#153]/10',
  'bg-#452233/40',
  'bg-hex-452233/40',
].join(' ')

const generator = createGenerator()

test('default', async() => {
  const { css } = await generator(fixture)
  expect(css).toMatchSnapshot()
})

test('scope', async() => {
  const { css } = await generator(fixture, '', '.foo-scope')
  expect(css).toMatchSnapshot()
})
