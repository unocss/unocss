import { escapeSelector } from '@unocss/core'
import { describe, expect, it } from 'vitest'
import { utilityContracts } from './assets/wind4-tailwind4-utilities'
import { utilityGaps, variantContracts, variantGaps } from './assets/wind4-tailwind4-variants'

import { declarationPaths, declarations, generate } from './utils/wind4-tailwind4'

function assertVariantCondition(root: Awaited<ReturnType<typeof generate>>['wind'], candidate: string, condition: RegExp) {
  const paths = declarationPaths(root, 'display', 'flex')
  expect(paths).toHaveLength(1)
  const selector = `.${escapeSelector(candidate)}`
  expect(paths[0]).toContain(selector)
  expect(paths[0].replaceAll(selector, '&')).toMatch(condition)
}

describe('wind4 / Tailwind 4.3.3 capability contracts', () => {
  it.each(['tailwind', 'wind'] as const)('%s arbitrary group assertion rejects omitted conditions', async (engine) => {
    const candidate = 'group-[.ready]:flex'
    const contract = variantContracts.find(([token]) => token === candidate)
    if (!contract)
      throw new Error('Missing arbitrary group contract')
    const output = await generate(candidate)
    assertVariantCondition(output[engine], candidate, contract[1])
    const selector = `.${escapeSelector(candidate)}`
    for (const replacement of [selector, `.ready ${selector}`, `.group.ready${selector}`]) {
      const mutated = output[engine].clone()
      mutated.walkRules((rule) => {
        if (rule.selector.includes(selector))
          rule.selector = replacement
      })
      expect(() => assertVariantCondition(mutated, candidate, contract[1])).toThrow()
    }
  })
  describe.each([
    ...utilityContracts,
    ['layout', 'block', 'display', 'block'],
    ['layout', 'isolate', 'isolation', 'isolate'],
    ['layout', 'overflow-clip', 'overflow', 'clip'],
    ['layout', 'object-cover', 'object-fit', 'cover'],
    ['layout', 'break-inside-avoid', 'break-inside', 'avoid'],
    ['position', 'sticky', 'position', 'sticky'],
    ['position', 'z-[17]', 'z-index', '17'],
    ['position', 'top-[13px]', 'top', '13px'],
    ['flex', 'flex-col', 'flex-direction', 'column'],
    ['flex', 'flex-wrap', 'flex-wrap', 'wrap'],
    ['flex', 'grow', 'flex-grow', '1'],
    ['flex', 'items-center', 'align-items', 'center'],
    ['flex', 'justify-between', 'justify-content', 'space-between'],
    ['grid', 'grid', 'display', 'grid'],
    ['grid', 'grid-flow-col', 'grid-auto-flow', 'column'],
    ['grid', 'grid-cols-[200px_1fr]', 'grid-template-columns', '200px 1fr'],
    ['grid', 'col-span-2', 'grid-column', /^span 2\s*\/\s*span 2$/],
    ['spacing', 'p-[13px]', 'padding', '13px'],
    ['spacing', 'ms-[13px]', 'margin-inline-start', '13px'],
    ['spacing', 'gap-[13px]', 'gap', '13px'],
    ['size', 'w-[37px]', 'width', '37px'],
    ['size', 'min-h-dvh', 'min-height', '100dvh'],
    ['size', 'max-w-none', 'max-width', 'none'],
    ['typography', 'text-center', 'text-align', 'center'],
    ['typography', 'italic', 'font-style', 'italic'],
    ['typography', 'uppercase', 'text-transform', 'uppercase'],
    ['typography', 'underline', 'text-decoration-line', 'underline'],
    ['typography', 'whitespace-pre-wrap', 'white-space', 'pre-wrap'],
    ['typography', 'text-[length:19px]', 'font-size', '19px'],
    ['background', 'bg-fixed', 'background-attachment', 'fixed'],
    ['background', 'bg-cover', 'background-size', 'cover'],
    ['background', 'bg-clip-text', 'background-clip', 'text'],
    ['border', 'rounded-[7px]', 'border-radius', '7px'],
    ['border', 'border-collapse', 'border-collapse', 'collapse'],
    ['table', 'table-fixed', 'table-layout', 'fixed'],
    ['effects', 'opacity-[0.37]', 'opacity', '0.37'],
    ['effects', 'mix-blend-multiply', 'mix-blend-mode', 'multiply'],
    ['effects', 'bg-blend-screen', 'background-blend-mode', 'screen'],
    ['transform', 'backface-hidden', 'backface-visibility', 'hidden'],
    ['transform', 'transform-3d', 'transform-style', 'preserve-3d'],
    ['transition', 'duration-[250ms]', 'transition-duration', '250ms'],
    ['animation', 'animate-none', 'animation', 'none'],
    ['interaction', 'cursor-pointer', 'cursor', 'pointer'],
    ['interaction', 'pointer-events-none', 'pointer-events', 'none'],
    ['interaction', 'resize-x', 'resize', 'horizontal'],
    ['scroll', 'scroll-smooth', 'scroll-behavior', 'smooth'],
    ['scroll', 'scroll-m-[13px]', 'scroll-margin', '13px'],
    ['svg', 'fill-current', 'fill', /^currentcolor$/i],
    ['svg', 'stroke-[3]', 'stroke-width', '3'],
    ['arbitrary property', '[--custom:13px]', '--custom', '13px'],
    ['variable shorthand', 'w-(--custom)', 'width', 'var(--custom)'],
  ])('%s: %s', (_family, candidate, property, value) => {
    for (const engine of ['tailwind', 'wind'] as const) {
      const reason = engine === 'wind' ? utilityGaps[candidate] : undefined
      it.skipIf(Boolean(reason))(`${engine}: ${reason ?? 'declaration contract'}`, async () => {
        const output = await generate(candidate)
        const actual = declarations(output[engine], candidate)[property]
        if (typeof value === 'string')
          expect(actual).toBe(value)
        else
          expect(actual).toMatch(value)
      })
    }
  })

  describe.each([
    ...variantContracts,
    ['focus:flex', /:focus/],
    ['focus-visible:flex', /:focus-visible/],
    ['disabled:flex', /:disabled/],
    ['first:flex', /:first-child/],
    ['has-[input]:flex', /:has\((?:input|:is\(input\))\)/],
    ['aria-checked:flex', /\[aria-checked=["']?true["']?\]/],
    ['data-[state=open]:flex', /\[data-state=["']?open["']?\]/],
    ['group-hover:flex', /\.group.*:hover/],
    ['peer-checked:flex', /\.peer.*:checked.*~/],
    ['[&>span]:flex', />\s*span/],
    ['motion-reduce:flex', /@media.*prefers-reduced-motion:\s*reduce/],
    ['print:flex', /@media print/],
    ['supports-[display:grid]:flex', /@supports.*display:\s*grid/],
    ['starting:flex', /@starting-style/],
  ])('variant condition: %s', (candidate, condition) => {
    for (const engine of ['tailwind', 'wind'] as const) {
      const reason = engine === 'wind' ? variantGaps[candidate] : undefined
      it.skipIf(Boolean(reason))(`${engine}: ${reason ?? 'selector and condition contract'}`, async () => {
        const output = await generate(candidate)
        assertVariantCondition(output[engine], candidate, condition)
      })
    }
  })
})
