import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import presetUno from '@unocss/preset-uno'
import transformerDirectives from '@unocss/transformer-directives'
import transformerVariantGroup from '@unocss/transformer-variant-group'
import { afterEach, describe, expect, it } from 'vitest'
import { NativeContext } from './context'

const temporaryDirectories: string[] = []

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map(directory => rm(directory, { force: true, recursive: true })))
})

async function createTestContext() {
  const root = await mkdtemp(join(tmpdir(), 'unocss-rsbuild-context-'))
  temporaryDirectories.push(root)
  const context = new NativeContext(root, {
    configOrPath: {
      presets: [presetUno()],
      transformers: [
        transformerDirectives(),
        transformerVariantGroup(),
      ],
    },
  })
  await context.initialize()
  return context
}

describe('native context', () => {
  it('runs all source transformers and directives', async () => {
    const context = await createTestContext()
    const vueResult = await context.transformModule(
      '<template><div class="group-hover:(text-red bg-blue)" /></template>',
      '/fixture/App.vue',
    )
    const cssResult = await context.transformModule(
      '.content { @apply text-red; --at-apply: bg-yellow; }',
      '/fixture/App.vue?vue&type=style.css',
    )

    expect(vueResult.code).toContain('group-hover:text-red group-hover:bg-blue')
    expect(cssResult.code).toContain('color:')
    expect(cssResult.code).toContain('background-color:')
    expect(cssResult.code).not.toContain('@apply')
  })

  it('replaces tokens when a module changes or is removed', async () => {
    const context = await createTestContext()
    const id = '/fixture/view.tsx'

    await context.transformModule('export const view = `<div class="text-red" />`', id)
    expect((await context.generate()).css).toContain('.text-red')

    await context.transformModule('export const view = `<div class="text-blue" />`', id)
    const changedCss = (await context.generate()).css
    expect(changedCss).toContain('.text-blue')
    expect(changedCss).not.toContain('.text-red')

    context.removeModule(id)
    const removedCss = (await context.generate()).css
    expect(removedCss).not.toContain('.text-blue')
  })

  it('resolves full and named layer virtual modules', async () => {
    const context = await createTestContext()
    expect(await context.resolveLayer(await context.resolveVirtualId('uno.css') || '')).toBe('__ALL__')
    expect(await context.resolveLayer(await context.resolveVirtualId('uno:utilities.css') || '')).toBe('utilities')
  })
})
