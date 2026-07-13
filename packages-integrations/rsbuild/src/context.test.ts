import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
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
    expect(await context.resolveLayer(await context.resolveVirtualId('uno.css?inline') || '')).toBe('__ALL__')
    expect(await context.resolveLayer(await context.resolveVirtualId('uno:utilities.css?url') || '')).toBe('utilities')
  })

  it('honors custom pipeline filters for extraction and transformers', async () => {
    const root = await mkdtemp(join(tmpdir(), 'unocss-rsbuild-pipeline-'))
    temporaryDirectories.push(root)
    const context = new NativeContext(root, {
      configOrPath: {
        content: {
          pipeline: {
            include: [/\.custom$/],
          },
        },
        presets: [presetUno()],
        transformers: [transformerVariantGroup()],
      },
    })
    await context.initialize()

    expect(context.filter.shouldTransform('/fixture/view.custom')).toBe(true)
    const result = await context.transformModule('<div class="hover:(text-red bg-blue)" />', '/fixture/view.custom')
    expect(result.code).toContain('hover:text-red hover:bg-blue')
    const css = (await context.generate()).css
    expect(css).toContain('.hover\\:text-red')
    expect(css).toContain('.hover\\:bg-blue')
  })

  it('does not extract utilities from skipped source ranges', async () => {
    const context = await createTestContext()
    await context.transformModule(
      '<!-- @unocss-skip-start --><div class="text-red" /><!-- @unocss-skip-end --><div class="text-blue" />',
      '/fixture/App.vue',
    )

    const css = (await context.generate()).css
    expect(css).toContain('.text-blue')
    expect(css).not.toContain('.text-red')
  })

  it('initializes external content once and exposes glob watch roots', async () => {
    const root = await mkdtemp(join(tmpdir(), 'unocss-rsbuild-initialize-'))
    temporaryDirectories.push(root)
    await mkdir(join(root, 'content'), { recursive: true })
    let inlineCalls = 0
    const context = new NativeContext(root, {
      configOrPath: {
        content: {
          filesystem: ['content/**/*.html'],
          inline: [() => {
            inlineCalls += 1
            return '<div class="text-green" />'
          }],
        },
        presets: [presetUno()],
      },
    })

    await Promise.all([context.initialize(), context.initialize(), context.initialize()])
    expect(inlineCalls).toBe(1)
    expect(context.filesystemWatchRoots).toContain(join(root, 'content'))
    expect(context.matchesFilesystemFile(join(root, 'content', 'new.html'))).toBe(true)
    expect(context.matchesFilesystemFile(join(root, 'content', 'new.ts'))).toBe(false)
    expect((await context.generate()).css).toContain('.text-green')

    await writeFile(join(root, 'content', 'new.html'), '<div class="text-blue" />', 'utf8')
    await context.extractExternalContent()
    expect((await context.generate()).css).toContain('.text-blue')
  })

  it('updates only changed external content and removes stale tokens', async () => {
    const root = await mkdtemp(join(tmpdir(), 'unocss-rsbuild-incremental-content-'))
    temporaryDirectories.push(root)
    const contentDirectory = join(root, 'content')
    const changedFile = join(contentDirectory, 'changed.html')
    const unchangedFile = join(contentDirectory, 'unchanged.html')
    await mkdir(contentDirectory, { recursive: true })
    await Promise.all([
      writeFile(changedFile, '<div class="text-red" />', 'utf8'),
      writeFile(unchangedFile, '<div class="text-green" />', 'utf8'),
    ])

    let transformCalls = 0
    const context = new NativeContext(root, {
      configOrPath: {
        content: { filesystem: ['content/**/*.html'] },
        presets: [presetUno()],
        transformers: [{
          name: 'count-external-transforms',
          transform() {
            transformCalls += 1
          },
        }],
      },
    })
    await context.initialize()
    transformCalls = 0

    await writeFile(changedFile, '<div class="text-blue" />', 'utf8')
    await context.updateExternalContent(new Set([changedFile]), new Set())

    const changedCss = (await context.generate()).css
    expect(transformCalls).toBe(1)
    expect(changedCss).toContain('.text-blue')
    expect(changedCss).toContain('.text-green')
    expect(changedCss).not.toContain('.text-red')

    await rm(changedFile)
    await context.updateExternalContent(new Set(), new Set([changedFile]))

    const removedCss = (await context.generate()).css
    expect(removedCss).toContain('.text-green')
    expect(removedCss).not.toContain('.text-blue')
  })
})
