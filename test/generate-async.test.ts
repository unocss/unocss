import { createGenerator } from '@unocss/core'
import { describe, expect, test } from 'vitest'

describe('generate-async', () => {
  test('rule-first', async () => {
    const order: number[] = []
    const uno = createGenerator({
      rules: [
        [/^rule$/, () => new Promise(resolve => setTimeout(() => {
          order.push(1)
          resolve('/* rule */')
        }, 10))],
      ],
      preflights: [
        {
          getCSS: () => new Promise(resolve => setTimeout(() => {
            order.push(2)
            resolve('/* preflight */')
          }, 20)),
        },
      ],
    })
    await uno.generate('rule')
    expect(order).eql([1, 2])
  })

  test('preflight at the end', async () => {
    const order: number[] = []
    const uno = createGenerator({
      rules: [
        [/^rule$/, () => new Promise(resolve => setTimeout(() => {
          order.push(1)
          resolve('/* rule */')
        }, 20))],
      ],
      preflights: [
        {
          getCSS: () => new Promise((resolve) => {
            order.push(2)
            resolve('/* preflight */')
          }),
        },
      ],
    })
    await uno.generate('rule')
    expect(order).eql([1, 2])
  })
})

describe('generator timeout', () => {
  test('awaitable generator can timed-out', async () => {
    const order: number[] = []

    setTimeout(() => {
      order.push(1)
    }, 10)

    const uno = createGenerator({
      rules: [
        [/^rule$/, () => new Promise(resolve => setTimeout(() => {
          order.push(2)
          resolve('/* rule */')
        }, 20))],
      ],
    })

    await uno.generate('rule', { timeout: 15 })
    expect(order).eql([1])
  })

  test('timed-out generator returns false', async () => {
    const uno = createGenerator({
      rules: [
        [/^rule$/, () => new Promise(resolve => setTimeout(() => {
          resolve('/* rule */')
        }, 20))],
      ],
    })

    const result = await uno.generate('rule', { timeout: 15 })
    expect(result).eql(false)
  })
})
