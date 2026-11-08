import { createGenerator } from '@unocss/core'
import presetWind4 from '@unocss/preset-wind4'
import { expect, it } from 'vitest'

// Utility-prefix reuse is an independent defect. Keep this in a fresh module
// process so configuring shared rule prefixes cannot hide isolation failures.
it('collects before variable-prefix and ordinary user postprocessing under utility variants', async () => {
  const seen: string[] = []
  const uno = await createGenerator({
    presets: [presetWind4({ prefix: 'u-', variablePrefix: 'probe-', important: true, preflights: { reset: false, property: { parent: false, selector: '.scope' } } })],
    postprocess(util) {
      if (util.selector.startsWith('@property'))
        seen.push(util.selector)
    },
  })
  const tokens = ['u-translate-x-4', '!u-translate-x-4', '-u-translate-x-4', 'hover:u-translate-x-4', 'md:u-translate-x-4']
  const result = await uno.generate(tokens)
  for (const token of tokens)
    expect(result.matched.has(token), token).toBe(true)
  expect(seen.length).toBeGreaterThan(0)
  expect(seen.every(s => s.startsWith('@property --probe-'))).toBe(true)
  expect(result.css).toContain('.scope{--probe-translate-x:initial;--probe-translate-y:initial;--probe-translate-z:initial;}')
  const properties = uno.config.presets.find(p => p.name === '@unocss/preset-wind4')!.meta!.propertyDeps
  expect([...properties.keys()]).toEqual(['--un-translate-x', '--un-translate-y', '--un-translate-z'])
  await createGenerator({ presets: [presetWind4({ preflights: { reset: false } })] })
  expect((await uno.generate(tokens)).css).toBe(result.css)
})
