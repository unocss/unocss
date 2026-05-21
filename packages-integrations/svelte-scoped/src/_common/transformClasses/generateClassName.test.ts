import { describe, expect, it } from 'vitest'
import { generateClassName } from './generateClassName'

describe('generateClassName', () => {
  const filename = 'Foo.svelte'
  it('prod: combined', () => {
    expect(generateClassName('mb-1', {}, filename)).toMatchInlineSnapshot('"uno-2se4c1"')
    expect(generateClassName('mb-1 mr-2 sm:px-3', {}, filename)).toMatchInlineSnapshot('"uno-kqmru7"')
  })

  it('dev: uncombined', () => {
    expect(generateClassName('mb-1', { combine: false }, filename)).toMatchInlineSnapshot('"_mb-1_7dkb0w"')
  })

  it('outputs different hashes for same class in different files', () => {
    const className = 'mb-1'
    const filename1 = 'Button.svelte'
    const filename2 = 'Input.svelte'

    const firstResult = generateClassName(className, { combine: false }, filename1)
    const secondResult = generateClassName(className, { combine: false }, filename2)

    expect(firstResult).not.toEqual(secondResult)
  })
})
