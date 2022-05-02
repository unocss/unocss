import { mergeDeep } from '@unocss/core'
import { expect, it } from 'vitest'

it('mergeDeep', () => {
  expect(mergeDeep<any>({
    foo: true,
    bar: 1,
    arr: [1],
  }, {
    bar: {},
    arr: [2],
  } as any))
    .toMatchInlineSnapshot(`
      {
        "arr": [
          1,
          2,
        ],
        "bar": {},
        "foo": true,
      }
    `)
})
