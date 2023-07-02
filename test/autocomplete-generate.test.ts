import { createAutocomplete } from '@unocss/autocomplete'
import { createGenerator } from '@unocss/core'
import { describe, it } from 'vitest'
import presetUno from '@unocss/preset-uno'

/**
 *  test autocomplete generator performance
 */
describe('autocomplete-generator', () => {
  const uno = createGenerator({
    presets: [
      presetUno(),
    ],
    shortcuts: [
      {
        'foo': 'text-red',
        'foo-bar': 'text-red',
      },
      [/^bg-mode-(.+)$/, ([, mode]) => `bg-blend-${mode}`, { autocomplete: ['bg-mode-(color|normal)'] }],
    ],
  })

  const ac = createAutocomplete(uno, {
    matchType: 'fuzzy',
  })

  const timing = async <T>(name: string, fn: () => Promise<T>) => {
    const now = performance.now()
    const result = await fn()
    const end = performance.now()
    const time = end - now
    // eslint-disable-next-line no-console
    console.debug(`${name}: ${time}ms`)
    return { time, result }
  }

  it('generator', async () => {
    const { result: list } = await timing('suggest', () => {
      return ac.suggest('tdo')
    })

    await timing('generate', () => {
      return Promise.all(list.map(r => uno.generate(r)))
    })

    const { result: list2 } = await timing('repeat suggest', () => {
      return ac.suggest('tdo')
    })

    await timing('repeat generate', () => {
      return Promise.all(list2.map(r => uno.generate(r)))
    })
  })
})
