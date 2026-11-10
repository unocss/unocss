import type { Preset } from '@unocss/core'
import { createGenerator, resolvePreset } from '@unocss/core'
import { expect, it } from 'vitest'

it('prepares opted-in metadata per config before extenders and hooks, preserving other preset identity', async () => {
  const events: string[] = []
  const original = { used: new Set<string>() }
  Object.defineProperty(original, 'extra', { value: 7, enumerable: false })
  const input: Preset = {
    name: 'owned',
    meta: original,
    resolveMeta(meta) {
      events.push('meta')
      return Object.create(Object.getPrototypeOf(meta), {
        ...Object.getOwnPropertyDescriptors(meta),
        used: { value: new Set<string>(), enumerable: true },
      })
    },
    configResolved() { events.push('owned') },
  }
  const ordinary = await resolvePreset({ name: 'ordinary', meta: { value: new Set() } })
  let early: Set<string> | undefined
  const config = { presets: [
    { name: 'observer', enforce: 'pre' as const, configResolved(c) {
      early = c.presets.find(p => p.name === 'owned')!.meta!.used
      events.push('early')
    } } satisfies Preset,
    input,
    ordinary,
  ], extendTheme() { events.push('theme') } }
  const a = await createGenerator(config)
  const ownedA = a.config.presets.find(p => p.name === 'owned')!
  expect(early).toBe(ownedA.meta!.used)
  expect(events).toEqual(['meta', 'theme', 'early', 'owned'])
  expect(a.config.presets.find(p => p.name === 'ordinary')).toBe(ordinary)
  expect(ordinary.meta!.value).toBe(a.config.presets.find(p => p.name === 'ordinary')!.meta!.value)
  Object.defineProperty(ownedA, 'extraRecord', { value: 8, enumerable: false })
  const beforeB = ownedA.meta!.used
  const b = await createGenerator({ ...config, presets: [config.presets[0], ownedA, ordinary] })
  const ownedB = b.config.presets.find(p => p.name === 'owned')!
  expect(early).toBe(ownedB.meta!.used)
  early!.add('B')
  expect(beforeB.has('B')).toBe(false)
  expect(ownedB).not.toBe(ownedA)
  expect(ownedB.meta).not.toBe(ownedA.meta)
  expect(input.meta).toBe(original)
  expect(original.used.size).toBe(0)
  for (const key of ['_uno_resolved', 'extraRecord'])
    expect(Object.getOwnPropertyDescriptor(ownedB, key)).toEqual(Object.getOwnPropertyDescriptor(ownedA, key))
  expect(Object.getOwnPropertyDescriptor(ownedB.meta, 'extra')).toEqual(Object.getOwnPropertyDescriptor(original, 'extra'))
  expect(await resolvePreset(ownedA)).toBe(ownedA)
})
