import { readFile } from 'node:fs/promises'
import { createGenerator } from '@unocss/core'
import presetWind4 from '@unocss/preset-wind4'
import { transformDirectives } from '@unocss/transformer-directives'
import MagicString from 'magic-string'
import { parse } from 'postcss'
import { compile } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'
import { describe, expect, it } from 'vitest'
import { declarationPaths, declarations, tailwindTheme } from './utils/wind4-tailwind4'

const directiveContracts: [name: string, input: string, candidates: string[], selector: string, property: string, value: string][] = [
  ['@import', '@import "fixture.css";', [], '.imported', 'display', 'grid'],
  ['@reference', '@reference "fixture.css"; .proof { @apply brand-tab; }', [], '.proof', 'tab-size', '7'],
  ['@theme', '@theme { --spacing-brand: 13px; } @tailwind utilities;', ['p-brand'], '.p-brand', 'padding', 'var(--spacing-brand)'],
  ['@theme inline', '@theme inline { --spacing-brand: var(--custom); } @tailwind utilities;', ['p-brand'], '.p-brand', 'padding', 'var(--custom)'],
  ['@theme static', '@theme static { --spacing-unused: 13px; } @tailwind utilities;', [], ':root, :host', '--spacing-unused', '13px'],
  ['@utility', '@utility brand-tab { tab-size: 7; } @tailwind utilities;', ['brand-tab'], '.brand-tab', 'tab-size', '7'],
  ['functional @utility / --value()', '@utility brand-tab-* { tab-size: --value(integer); } @tailwind utilities;', ['brand-tab-7'], '.brand-tab-7', 'tab-size', '7'],
  ['--modifier()', '@utility brand-tab-* { tab-size: --value(integer); line-height: --modifier(integer); } @tailwind utilities;', ['brand-tab-1/7'], '.brand-tab-1\\/7', 'line-height', '7'],
  ['@apply', '.proof { @apply flex; }', [], '.proof', 'display', 'flex'],
  ['@variant', '.proof { @variant focus { display: grid; } }', [], '.proof:focus', 'display', 'grid'],
  ['@custom-variant', '@custom-variant busy (&[data-busy]); @tailwind utilities;', ['busy:flex'], '.busy\\:flex', 'display', 'flex'],
  ['@source inline', '@source inline("flex"); @tailwind utilities;', [], '.flex', 'display', 'flex'],
  ['--spacing()', '.proof { padding: --spacing(7); }', [], '.proof', 'padding', 'calc(var(--spacing) * 7)'],
  ['--alpha()', '.proof { color: --alpha(var(--color-red-500) / 50%); }', [], '.proof', 'color', 'color-mix(in srgb, oklch(63.7% 0.237 25.331) 50%, transparent)'],
  ['theme()', '.proof { color: theme("colors.red.500"); }', [], '.proof', 'color', 'oklch(63.7% 0.237 25.331)'],
  ['@config', '@config "fixture.js"; @tailwind utilities;', ['p-brand'], '.p-brand', 'padding', '13px'],
  ['@plugin', '@plugin "fixture.js"; @tailwind utilities;', ['brand-tab'], '.brand-tab', 'tab-size', '7'],
  ['matchVariant sorts deterministically', '@plugin "fixture.js"; @tailwind utilities;', ['state-closed:flex', 'state-open:flex'], '.state-open\\:flex', 'display', 'flex'],
]

describe('css-first directives: architecture differences, not missing CSS properties', () => {
  describe.each(directiveContracts)('%s', (_name, input, candidates, selector, property, value) => {
    for (const engine of ['tailwind', 'wind'] as const) {
      const gap = engine === 'wind' && !['@apply', 'theme()'].includes(_name)
      it.skipIf(gap)(`${engine}: ${gap ? 'Tailwind CSS-first syntax is not implemented by Uno transformer-directives' : 'directive contract'}`, async () => {
        async function build(orderedCandidates: string[]) {
          if (engine === 'tailwind') {
            const tw = await compile(`${await tailwindTheme}\n${input}`, {
              loadStylesheet: async () => ({ path: 'fixture.css', base: '', content: '.imported { display: grid; } @utility brand-tab { tab-size: 7; }' }),
              loadModule: async (_id, _base, hint) => ({
                path: 'fixture.js',
                base: '',
                module: hint === 'config'
                  ? { theme: { extend: { spacing: { brand: '13px' } } } }
                  : plugin(({ addUtilities, matchVariant }) => {
                      addUtilities({ '.brand-tab': { 'tab-size': '7' } })
                      matchVariant('state', value => `&[data-state="${value}"]`, { values: { open: 'open', closed: 'closed' }, sort: (a, b) => a.value.localeCompare(b.value) })
                    }),
              }),
            })
            return tw.build(orderedCandidates)
          }
          const uno = await createGenerator({ presets: [presetWind4()] })
          const source = new MagicString(input)
          await transformDirectives(source, uno, {})
          return `${source}\n${(await uno.generate(orderedCandidates)).css}`
        }
        const css = await build(candidates)
        const root = parse(css)
        const paths = declarationPaths(root, property, value)
        expect(paths.some(path => path.includes(selector))).toBe(true)
        if (_name === '@custom-variant')
          expect(paths[0]).toContain('[data-busy]')
        if (_name === '@reference')
          expect(css).not.toContain('.imported')
        if (_name === 'matchVariant sorts deterministically') {
          expect(css.indexOf('.state-closed')).toBeGreaterThanOrEqual(0)
          expect(css.indexOf('.state-open')).toBeGreaterThan(css.indexOf('.state-closed'))
          expect(await build([...candidates].reverse())).toBe(css)
          expect(await build([])).not.toContain('.state-')
        }
      })
    }
  })

  it('source file discovery is compiler metadata, not a preset feature', async () => {
    const tw = await compile('@source "./components"; @tailwind utilities;', { base: '/fixture' })
    expect(tw.sources).toEqual([{ base: '/fixture', pattern: './components', negated: false }])
  })

  it('uno @screen integration retains responsive conditions', async () => {
    const uno = await createGenerator({ presets: [presetWind4()] })
    const source = new MagicString('@screen md { .proof { @apply flex; } }')
    await transformDirectives(source, uno, {})
    expect(declarationPaths(parse(source.toString()), 'display', 'flex')[0]).toMatch(/@media.*min-width:\s*48rem/)
  })

  it('uno rules, shortcuts, variants and safelist provide configuration equivalents', async () => {
    const uno = await createGenerator({
      presets: [presetWind4()],
      rules: [['brand-tab', { 'tab-size': '7' }]],
      shortcuts: { card: 'flex p-[13px]' },
      safelist: ['brand-tab'],
      variants: [(matcher) => {
        if (matcher.startsWith('busy:'))
          return { matcher: matcher.slice(5), selector: selector => `${selector}[data-busy]` }
      }],
    })
    const root = parse((await uno.generate(['card', 'busy:flex'])).css)
    expect(declarations(root, 'brand-tab')['tab-size']).toBe('7')
    expect(declarations(root, 'card')).toMatchObject({ display: 'flex', padding: '13px' })
    expect(declarationPaths(root, 'display', 'flex').some(path => path.includes('[data-busy]'))).toBe(true)
  })

  it('preflight resets box sizing, heading size and form typography', async () => {
    const preflight = await readFile(new URL(import.meta.resolve('tailwindcss/preflight.css')), 'utf8')
    const uno = await createGenerator({ presets: [presetWind4()] })
    for (const root of [parse(preflight), parse((await uno.generate([])).css)]) {
      expect(declarationPaths(root, 'box-sizing', 'border-box')[0]).toContain('*')
      expect(declarationPaths(root, 'font-size', 'inherit').some(path => path.includes('h1'))).toBe(true)
      expect(declarationPaths(root, 'font', 'inherit').some(path => path.includes('button'))).toBe(true)
    }
  })
})
