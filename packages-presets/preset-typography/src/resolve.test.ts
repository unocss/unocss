import { expect, it } from 'vitest'
import { smartMergeDeep } from './resolve'

it('removes property when patch value is null', () => {
  const original = {
    a: 1,
    nested: {
      keep: true,
      removeMe: 'x',
    },
  }

  const merged = smartMergeDeep(original, {
    nested: {
      removeMe: null as any,
    },
  })

  expect(merged).toEqual({
    a: 1,
    nested: {
      keep: true,
    },
  })
  expect(original).toEqual({
    a: 1,
    nested: {
      keep: true,
      removeMe: 'x',
    },
  })
})

it('resets property to empty object when patch value is {}', () => {
  const original = {
    a: 1,
    nested: {
      keep: true,
      deep: {
        value: 1,
      },
    },
  }

  const merged = smartMergeDeep(original, {
    nested: {},
  })

  expect(merged).toEqual({
    a: 1,
    nested: {},
  })
  expect(original).toEqual({
    a: 1,
    nested: {
      keep: true,
      deep: {
        value: 1,
      },
    },
  })
})
