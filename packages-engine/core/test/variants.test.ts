import { createGenerator } from '@unocss/core'
import { expect, it, vi } from 'vitest'

it('basic variants', async () => {
  const uno = await createGenerator({
    rules: [
      ['text-red', { color: 'red' }],
      ['text-green', { color: 'green' }],
    ],
    variants: [
      {
        name: 'foo',
        multiPass: false,
        match: (matcher) => {
          if (matcher.startsWith('v-')) {
            return {
              matcher: matcher.slice(2),
            }
          }
        },
      },
    ],
  })

  const { css } = await uno.generate('v-text-red', { preflights: false })
  expect(css).toMatchInlineSnapshot(`
    "/* layer: default */
    .v-text-red{color:red;}"
  `)
})

it('parses one variant result without Promise.all', async () => {
  const uno = await createGenerator({
    rules: [['text-red', { color: 'red' }]],
    variants: [
      {
        name: 'foo',
        match: matcher => matcher.startsWith('v-') ? { matcher: matcher.slice(2) } : undefined,
      },
    ],
  })
  const [variantMatch] = await uno.matchVariants('v-text-red')
  const context = uno.makeContext('v-text-red', variantMatch)
  const promiseAll = vi.spyOn(Promise, 'all')

  try {
    await expect(uno.parseUtil(variantMatch, context)).resolves.toHaveLength(1)
    expect(promiseAll).not.toHaveBeenCalled()
  }
  finally {
    promiseAll.mockRestore()
  }
})

it('variants with multiple returns', async () => {
  const uno = await createGenerator({
    rules: [
      ['text-red', { color: 'red' }],
      ['text-green', { color: 'green' }],
    ],
    variants: [
      {
        name: 'foo',
        multiPass: false,
        match: (matcher) => {
          if (matcher.startsWith('v-')) {
            return [
              {
                matcher: matcher.slice(2),
              },
              {
                matcher: matcher.slice(2).replace('red', 'green'),
              },
            ]
          }
        },
      },
    ],
  })

  const { css } = await uno.generate('v-text-red', { preflights: false })
  expect(css).toMatchInlineSnapshot(`
    "/* layer: default */
    .v-text-red{color:red;}
    .v-text-red{color:green;}"
  `)
})

it('variants with multiple returns with selector modifier', async () => {
  const uno = await createGenerator({
    rules: [
      ['text-red', { color: 'red' }],
      ['text-green', { color: 'green' }],
    ],
    variants: [
      {
        name: 'hover',
        match: (matcher) => {
          if (matcher.startsWith('hover:')) {
            return {
              matcher: matcher.slice(6),
              selector: input => `${input}:hover`,
            }
          }
        },
      },
      {
        name: 'foo',
        multiPass: false,
        match: (matcher) => {
          if (matcher.startsWith('v-')) {
            return [
              {
                matcher: matcher.slice(2),
              },
              {
                matcher: matcher.slice(2).replace('red', 'green'),
                selector: input => `${input}:foo`,
              },
            ]
          }
        },
      },
    ],
  })

  const { css } = await uno.generate('hover:v-text-red', { preflights: false })
  expect(css).toMatchInlineSnapshot(`
    "/* layer: default */
    .hover\\:v-text-red:hover{color:red;}
    .hover\\:v-text-red:foo:hover{color:green;}"
  `)
})

it('variants with multiple returns with partial match', async () => {
  const uno = await createGenerator({
    rules: [
      ['text-red', { color: 'red' }],
      ['text-green', { color: 'green' }],
    ],
    variants: [
      {
        name: 'hover',
        match: (matcher) => {
          if (matcher.startsWith('hover:')) {
            return {
              matcher: matcher.slice(6),
              selector: input => `${input}:hover`,
            }
          }
        },
      },
      {
        name: 'foo',
        multiPass: false,
        match: (matcher) => {
          if (matcher.startsWith('v-')) {
            return [
              {
                // use this variant to trigger another variant
                matcher: `hover:${matcher.slice(2)}`,
              },
              {
                matcher: `hover:${matcher.slice(2).replace('red', 'green')}`,
                selector: input => `${input}:foo`,
              },
              {
                // this doesn't match, but the rest should still work
                matcher: `hover:${matcher.slice(2).replace('red', 'blue')}`,
              },
            ]
          }
        },
      },
    ],
  })

  const { css } = await uno.generate('v-text-red', { preflights: false })
  expect(css).toMatchInlineSnapshot(`
    "/* layer: default */
    .v-text-red:hover{color:red;}
    .v-text-red:hover:foo{color:green;}"
  `)
})
