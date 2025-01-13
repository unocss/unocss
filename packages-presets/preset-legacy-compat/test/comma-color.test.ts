import { expect, it } from 'vitest'
import { toCommaStyleColorFunction as r } from '../src/comma-color'

it('toCommaStyleColorFunction', () => {
  expect(r('rgb(255 255 255)'))
    .toBe('rgb(255, 255, 255)')

  expect(r('rgb(255 255 255 / 0.5)'))
    .toBe('rgba(255, 255, 255, 0.5)')

  expect(r('hsl(0 0% 100%)'))
    .toBe('hsl(0, 0%, 100%)')

  expect(r('hsl(0 0% 100% / 0.5)'))
    .toBe('hsla(0, 0%, 100%, 0.5)')

  expect(r('rgb(248 113 113 / var(--un-bg-opacity))'))
    .toBe('rgba(248, 113, 113, var(--un-bg-opacity))')
})
