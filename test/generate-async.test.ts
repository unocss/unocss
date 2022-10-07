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

  test('preflight-first', async () => {
    const order: number[] = []
    const uno = createGenerator({
      rules: [
        [/^rule$/, () => new Promise(resolve => setTimeout(() => {
          order.push(2)
          resolve('/* rule */')
        }, 20))],
      ],
      preflights: [
        {
          getCSS: () => new Promise(resolve => setTimeout(() => {
            order.push(1)
            resolve('/* preflight */')
          }, 10)),
        },
      ],
    })
    await uno.generate('rule')
    expect(order).eql([1, 2])
  })
})

describe('firing-events', () => {
  test('config-event', async () => {
    const order: number[] = []
    const uno = createGenerator()

    uno.events.on('config', () => order.push(order.length))
    expect(order).eql([])

    uno.setConfig({})
    expect(order).eql([0])
  })

  test('extracted-event', async () => {
    const order: number[] = []
    const uno = createGenerator({
      rules: [
        [/^rule$/, () => '/* rule */'],
      ],
    })
    uno.events.on('extracted', () => order.push(order.length))

    await uno.generate('rule')
    expect(order).eql([0])

    await uno.generate('rule')
    expect(order).eql([0, 1])
  })

  test('tokens-generated-event', async () => {
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
    uno.events.on('tokens', () => order.push(3))
    await uno.generate('rule')
    expect(order).eql([1, 3, 2])
  })

  test('preflight-generated-event', async () => {
    const order: number[] = []
    const uno = createGenerator({
      rules: [
        [/^rule$/, () => new Promise(resolve => setTimeout(() => {
          order.push(2)
          resolve('/* rule */')
        }, 20))],
      ],
      preflights: [
        {
          getCSS: () => new Promise(resolve => setTimeout(() => {
            order.push(1)
            resolve('/* preflight */')
          }, 10)),
        },
      ],
    })
    uno.events.on('preflights', () => order.push(3))
    await uno.generate('rule')
    expect(order).eql([1, 3, 2])
  })

  test('preflight-event-fires-without-preflight', async () => {
    const order: number[] = []
    const uno = createGenerator({
      rules: [
        [/^rule$/, () => new Promise(resolve => setTimeout(() => {
          order.push(10)
          resolve('/* rule */')
        }, 10))],
      ],
    })
    uno.events.on('preflights', () => order.push(order.length))

    await uno.generate('rule', { preflights: false })
    expect(order).eql([0, 10])

    await uno.generate('rule', { preflights: true })
    expect(order).eql([0, 10, 2])
  })

  test('generated-event', async () => {
    const order: number[] = []
    const uno = createGenerator({
      rules: [
        [/^rule$/, () => '/* rule */'],
      ],
    })
    uno.events.on('generated', () => order.push(order.length))

    await uno.generate('rule')
    expect(order).eql([0])

    await uno.generate('rule')
    expect(order).eql([0, 1])
  })
})
