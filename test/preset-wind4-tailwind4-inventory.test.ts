import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import coverage from './assets/wind4-tailwind4-coverage.json'
import inventory from './assets/wind4-tailwind4-inventory.json'
import { utilityContracts } from './assets/wind4-tailwind4-utilities'
import { variantContracts } from './assets/wind4-tailwind4-variants'

type Reference = { utility: string } | { variant: string } | { variants: string[] } | { file: string, anchor: string }

async function checkReferences(references: Record<string, Reference>) {
  for (const [family, reference] of Object.entries(references)) {
    if ('utility' in reference) {
      expect(utilityContracts.some(([, candidate]) => candidate === reference.utility), family).toBe(true)
    }
    else if ('variant' in reference) {
      expect(variantContracts.some(([candidate]) => candidate === reference.variant), family).toBe(true)
    }
    else if ('variants' in reference) {
      for (const candidate of reference.variants)
        expect(variantContracts.some(([token]) => token === candidate), `${family}: ${candidate}`).toBe(true)
    }
    else {
      const source = await readFile(new URL(reference.file, import.meta.url), 'utf8')
      expect(source, family).toContain(reference.anchor)
    }
  }
}

describe('pinned Tailwind 4.3.3 feature inventory', () => {
  it('maps all 290 upstream utility groups to concrete assertion cases', async () => {
    expect(inventory.utilities).toHaveLength(290)
    expect(new Set(inventory.utilities).size).toBe(290)
    expect(Object.keys(coverage.utilities).sort()).toEqual([...inventory.utilities].sort())
    await checkReferences(coverage.utilities)
  })

  it('maps all 91 upstream variant groups to concrete assertion cases', async () => {
    expect(inventory.variants).toHaveLength(91)
    expect(new Set(inventory.variants).size).toBe(91)
    expect(Object.keys(coverage.variants).sort()).toEqual([...inventory.variants].sort())
    await checkReferences(coverage.variants)
  })
})
