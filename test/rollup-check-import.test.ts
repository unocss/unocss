import type { Plugin } from 'rollup'
import UnoCSS from '@unocss/rollup'
import { rolldown } from 'rolldown'
import { rollup } from 'rollup'
import { describe, expect, it } from 'vitest'

function entryPlugin(withUnoCssImport: boolean): Plugin {
  return {
    name: 'entry',
    resolveId(id) {
      if (id === 'entry')
        return '/entry.tsx'
    },
    load(id) {
      if (id === '/entry.tsx')
        return `${withUnoCssImport ? 'import \'uno.css\'' : ''}\nexport const className = 'text-red-500'`
    },
  }
}

interface Warning { message: string }
interface BuildOutput { generate: (options: { format: 'es' }) => Promise<{ output: Array<{ type: string, source?: unknown }> }> }
type BuildFn = (options: { onwarn: (warning: Warning) => void }) => Promise<BuildOutput>

function withRollup(withUnoCssImport: boolean, checkImport: boolean | undefined): BuildFn {
  return ({ onwarn }) => rollup({
    input: 'entry',
    onwarn,
    plugins: [
      entryPlugin(withUnoCssImport),
      UnoCSS({ checkImport, rules: [['text-red-500', { color: 'red' }]] }),
    ],
  })
}

function withRolldown(withUnoCssImport: boolean, checkImport: boolean | undefined): BuildFn {
  return ({ onwarn }) => rolldown({
    input: 'entry',
    onwarn,
    plugins: [
      entryPlugin(withUnoCssImport),
      UnoCSS({ checkImport, rules: [['text-red-500', { color: 'red' }]] }),
    ],
  })
}

async function getWarnings(build: BuildFn) {
  const warnings: string[] = []
  const bundle = await build({ onwarn: warning => warnings.push(warning.message) })
  await bundle.generate({ format: 'es' })
  return warnings
}

describe.each([
  ['rollup', withRollup],
  ['rolldown', withRolldown],
])('checkImport (%s)', (_, createBuild) => {
  it('warns when no UnoCSS virtual CSS entry is imported and checkImport is true', async () => {
    const warnings = await getWarnings(createBuild(false, true))
    expect(warnings.some(w => w.includes('import \'uno.css\''))).toBe(true)
  })

  it('does not warn when no UnoCSS virtual CSS entry is imported and checkImport is unset', async () => {
    const warnings = await getWarnings(createBuild(false, undefined))
    expect(warnings.some(w => w.includes('import \'uno.css\''))).toBe(false)
  })

  it('does not warn when the UnoCSS virtual CSS entry is imported and checkImport is true', async () => {
    const warnings = await getWarnings(createBuild(true, true))
    expect(warnings.some(w => w.includes('import \'uno.css\''))).toBe(false)
  })
})
