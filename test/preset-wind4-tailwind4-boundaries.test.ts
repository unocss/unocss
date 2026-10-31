import { createGenerator, escapeSelector } from '@unocss/core'
import presetWind4 from '@unocss/preset-wind4'
import { parse } from 'postcss'
import { compile } from 'tailwindcss'
import { describe, expect, it } from 'vitest'
import { declarationPaths, declarations, generate, tailwindTheme } from './utils/wind4-tailwind4'

function assertResponsiveFocus(root: ReturnType<typeof parse>) {
  const paths = declarationPaths(root, 'display', 'flex')
  expect(paths).toHaveLength(1)
  const selector = `.${escapeSelector('md:focus:flex')}`
  expect(paths[0]).toContain(selector)
  expect(paths[0].replaceAll(selector, '&')).toMatch(/^@media \((?:width >= 48rem|min-width: 48rem)\) &:focus$/)
}

function assertPseudoTargets(root: ReturnType<typeof parse>, candidate: string, pseudo: string) {
  const selectors: string[] = []
  root.walkRules((rule) => {
    if (rule.nodes.some(node => node.type === 'decl' && node.prop === 'display' && node.value === 'flex'))
      selectors.push(...rule.selectors)
  })
  const own = `.${escapeSelector(candidate)}::${pseudo}`
  const descendant = `.${escapeSelector(candidate)} ::${pseudo}`
  const universalDescendant = `.${escapeSelector(candidate)} *::${pseudo}`
  expect(selectors).toContain(own)
  expect(selectors.some(selector => selector === descendant || selector === universalDescendant)).toBe(true)
}

describe('wind4 / Tailwind explicit capability boundaries', () => {
  describe.each(['translate', 'scale'])('%s-3d', (property) => {
    for (const [engine, prefix] of [['tailwind', 'tw'], ['wind', 'un']] as const) {
      it.skipIf(engine === 'wind')(`${engine}: missing 3d composition utility in Wind4`, async () => {
        const output = await generate(`${property}-3d`)
        expect(declarations(output[engine], `${property}-3d`)[property]).toBe(`var(--${prefix}-${property}-x) var(--${prefix}-${property}-y) var(--${prefix}-${property}-z)`)
      })
    }
  })

  describe.each(['before', 'after'])('%s auto-content', (pseudo) => {
    for (const [engine, prefix] of [['tailwind', 'tw'], ['wind', 'un']] as const) {
      it.skipIf(engine === 'wind')(`${engine}: Wind4 does not insert default pseudo-element content`, async () => {
        const output = await generate(`${pseudo}:flex`)
        expect(declarationPaths(output[engine], 'content', `var(--${prefix}-content)`)[0]).toContain(`::${pseudo}`)
        expect(declarationPaths(output[engine], 'initial-value', '""')).toContain(`@property --${prefix}-content`)
      })
    }
  })

  describe('hover media guard', () => {
    for (const engine of ['tailwind', 'wind'] as const) {
      it.skipIf(engine === 'wind')(`${engine}: default Wind4 hover is not guarded by hover capability`, async () => {
        const output = await generate('hover:flex')
        const paths = declarationPaths(output[engine], 'display', 'flex')
        expect(paths).toHaveLength(1)
        expect(paths[0]).toContain('@media (hover: hover)')
        expect(paths[0]).toContain(':hover')
      })
    }
  })

  describe('dark default', () => {
    for (const engine of ['tailwind', 'wind'] as const) {
      it.skipIf(engine === 'wind')(`${engine}: intentional default difference, Wind4 uses class dark mode`, async () => {
        const output = await generate('dark:flex')
        expect(declarationPaths(output[engine], 'display', 'flex')[0]).toContain('@media (prefers-color-scheme: dark)')
      })
    }
    it('wind4 media dark mode is available by configuration', async () => {
      const uno = await createGenerator({ presets: [presetWind4({ dark: 'media' })] })
      const root = parse((await uno.generate(['dark:flex'])).css)
      expect(declarationPaths(root, 'display', 'flex')[0]).toContain('@media (prefers-color-scheme: dark)')
    })
  })

  describe('arbitrary drop-shadow color replacement', () => {
    for (const [engine, prefix] of [['tailwind', 'tw'], ['wind', 'un']] as const) {
      it.skipIf(engine === 'wind')(`${engine}: Wind4 retains black outside the override variable`, async () => {
        const candidate = 'drop-shadow-[1px_2px_3px_black]'
        const output = await generate([candidate, 'drop-shadow-red-500'])
        const css = declarations(output[engine], candidate)
        const component = engine === 'tailwind' ? `--${prefix}-drop-shadow-size` : `--${prefix}-drop-shadow`
        expect(css[component]).toBe(`drop-shadow(1px 2px 3px var(--${prefix}-drop-shadow-color, black))`)
        expect(css.filter).toContain(`var(--${prefix}-drop-shadow,`)
      })
    }
  })

  describe.each(['border', 'divide-x', 'divide-y'])('%s custom default border width', (candidate) => {
    for (const engine of ['tailwind', 'wind'] as const) {
      it.skipIf(engine === 'wind')(`${engine}: Wind4 hard-codes the bare utility width to 1px`, async () => {
        const tw = await compile(`${await tailwindTheme}\n@theme { --default-border-width: 3px; }\n@tailwind utilities;`)
        const uno = await createGenerator({ presets: [presetWind4()], preflights: [{ getCSS: () => ':root { --default-border-width: 3px; }' }] })
        const root = engine === 'tailwind' ? parse(tw.build([candidate])) : parse((await uno.generate([candidate])).css)
        const values: string[] = []
        root.walkDecls((decl) => {
          if (decl.prop.startsWith('border-') && decl.prop.endsWith('width'))
            values.push(decl.value)
        })
        expect(values.length).toBeGreaterThan(0)
        expect(values.every(value => value.includes('3px'))).toBe(true)
      })
    }
  })

  it.each(['translate', 'scale', 'skew'])('%s without axis sets both x and y', async (family) => {
    const candidate = `${family}-${family === 'translate' ? '[13px]' : family === 'scale' ? '125' : '12'}`
    const { wind, tailwind } = await generate(candidate)
    for (const [root, prefix] of [[tailwind, 'tw'], [wind, 'un']] as const) {
      const css = declarations(root, candidate)
      for (const axis of ['x', 'y']) {
        const value = family === 'translate' ? '13px' : family === 'scale' ? '125%' : `skew${axis.toUpperCase()}(12deg)`
        expect(css[`--${prefix}-${family}-${axis}`]).toBe(value)
      }
    }
  })

  it.each(['linear', 'conic', 'radial'])('mask-%s gradient shape', async (gradient) => {
    const candidate = `mask-${gradient}-${gradient === 'radial' ? '[50%]' : '45'}`
    const { wind, tailwind } = await generate(candidate)
    for (const [root, prefix] of [[tailwind, 'tw'], [wind, 'un']] as const) {
      const css = declarations(root, candidate)
      const field = gradient === 'radial' ? 'size' : 'position'
      expect(css[`--${prefix}-mask-${gradient}-${field}`]).toBe(gradient === 'radial' ? '50%' : 'calc(1deg * 45)')
      expect(css[`--${prefix}-mask-${gradient}`]).toBe(`${gradient}-gradient(var(--${prefix}-mask-${gradient}-stops, var(--${prefix}-mask-${gradient}-${field})))`)
      expect(css['mask-image']).toContain(`var(--${prefix}-mask-${gradient})`)
      expect(css['mask-composite']).toBe('intersect')
    }
  })

  it('important applies to declarations, not just token matching', async () => {
    const { wind, tailwind } = await generate('p-4!')
    for (const root of [wind, tailwind]) {
      const important: boolean[] = []
      root.walkDecls('padding', (decl) => {
        if (decl.value === 'calc(var(--spacing) * 4)')
          important.push(Boolean(decl.important))
      })
      expect(important).toEqual([true])
    }
  })

  it.each(['before', 'after'])('%s explicit content', async (pseudo) => {
    const { wind, tailwind } = await generate(`${pseudo}:content-['hello']`)
    for (const [root, prefix] of [[tailwind, 'tw'], [wind, 'un']] as const) {
      expect(declarationPaths(root, `--${prefix}-content`, '\'hello\'')[0]).toContain(`::${pseudo}`)
      expect(declarationPaths(root, 'content', `var(--${prefix}-content)`)[0]).toContain(`::${pseudo}`)
    }
  })

  it.each(['marker', 'selection'])('%s covers the element and descendants', async (pseudo) => {
    const candidate = `${pseudo}:flex`
    const { wind, tailwind } = await generate(candidate)
    for (const root of [wind, tailwind]) {
      assertPseudoTargets(root, candidate, pseudo)
      const own = `.${escapeSelector(candidate)}::${pseudo}`
      for (const removeOwn of [true, false]) {
        const mutated = root.clone()
        mutated.walkRules((rule) => {
          const remaining = rule.selectors.filter(selector => !selector.endsWith(`::${pseudo}`) || (removeOwn ? selector !== own : selector === own))
          if (remaining.length)
            rule.selectors = remaining
          else
            rule.remove()
        })
        expect(() => assertPseudoTargets(mutated, candidate, pseudo)).toThrow()
      }
    }
  })

  it('placeholder utility sets the pseudo-element color', async () => {
    const { wind, tailwind } = await generate('placeholder-inherit')
    for (const root of [wind, tailwind])
      expect(declarationPaths(root, 'color', 'inherit').some(path => path.includes('::placeholder'))).toBe(true)
  })

  it('open and inert conditions include their alternate states', async () => {
    for (const candidate of ['open:flex', 'inert:flex']) {
      const { wind, tailwind } = await generate(candidate)
      for (const root of [wind, tailwind]) {
        const path = declarationPaths(root, 'display', 'flex')[0]
        if (candidate === 'open:flex') {
          expect(path).toContain('[open]')
          expect(path).toContain(':popover-open')
          expect(path).toContain(':open')
        }
        else {
          expect(path).toContain('[inert]')
          expect(path).toContain('[inert] *')
        }
      }
    }
  })

  it('named group compound variant keeps the group and checked descendant', async () => {
    const { wind, tailwind } = await generate('group-has-checked/menu:flex')
    for (const root of [wind, tailwind]) {
      const paths = declarationPaths(root, 'display', 'flex')
      expect(paths).toHaveLength(1)
      expect(paths[0]).toContain('.group\\/menu')
      expect(paths[0]).toMatch(/:has\((?::is\()?:checked\)/)
    }
  })

  it('wind4 only-child syntax provides the only-child capability', async () => {
    const { wind } = await generate('only-child:flex')
    expect(declarationPaths(wind, 'display', 'flex')).toEqual(['.only-child\\:flex:only-child'])
  })

  describe('responsive focus stacking retains both conditions', () => {
    it.each(['tailwind', 'wind'] as const)('%s rejects omitted focus or media conditions', async (engine) => {
      const candidate = 'md:focus:flex'
      const output = await generate(candidate)
      assertResponsiveFocus(output[engine])
      for (const condition of ['focus', 'media']) {
        const mutated = output[engine].clone()
        if (condition === 'focus') {
          mutated.walkRules((rule) => {
            if (rule.selector.includes(escapeSelector(candidate)))
              rule.selector = `.${escapeSelector(candidate)}`
          })
        }
        else {
          mutated.walkAtRules('media', (rule) => {
            rule.replaceWith(rule.nodes)
          })
        }
        expect(() => assertResponsiveFocus(mutated), condition).toThrow()
      }
    })
  })

  it('margin sort order is independent of input order', async () => {
    for (const candidates of [['mt-4', 'm-2'], ['m-2', 'mt-4']]) {
      const { wind, tailwind } = await generate(candidates)
      for (const root of [wind, tailwind]) {
        const rules: string[] = []
        root.walkRules((rule) => {
          rules.push(rule.selector)
        })
        expect(rules.indexOf('.m-2')).toBeLessThan(rules.indexOf('.mt-4'))
        expect(declarations(root, 'm-2').margin).toBe('calc(var(--spacing) * 2)')
        expect(declarations(root, 'mt-4')['margin-top']).toBe('calc(var(--spacing) * 4)')
      }
    }
  })
})
