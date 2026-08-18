import { createGenerator } from '@unocss/core'
import { expect, it } from 'vitest'

it('rule-first', async () => {
  const order: number[] = []
  const uno = await createGenerator({
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
  const uno = await createGenerator({
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

it('waits for a token batch before parsing the next batch', async () => {
  let firstBatchFinished = false
  const uno = await createGenerator({
    rules: [
      [/^token-(\d+)$/, async ([, index]) => {
        if (index === '0') {
          await new Promise(resolve => setTimeout(resolve, 0))
          firstBatchFinished = true
        }
        else if (index === '4096') {
          expect(firstBatchFinished).toBe(true)
        }
        return { color: index }
      }],
    ],
  })

  const tokens = Array.from({ length: 4097 }, (_, index) => `token-${index}`)
  const result = await uno.generate(tokens, { preflights: false })

  expect(result.matched.size).toBe(tokens.length)
})
