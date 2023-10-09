import { createGenerator } from '@unocss/core'
import { describe, expect, it } from 'vitest'

describe('generate-async', () => {
  it('rule-first', async () => {
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

  it('preflight at the end', async () => {
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
