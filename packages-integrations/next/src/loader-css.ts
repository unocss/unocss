import type { LoaderContext } from './types'
import fs from 'node:fs/promises'
import { toArray } from '@unocss/core'
import { dirname, resolve } from 'pathe'
import { glob } from 'tinyglobby'
import { IGNORE_COMMENT, SKIP_COMMENT_RE } from '#integration/constants'
import { defaultFilesystemGlobs } from '#integration/defaults'
import { getContext, reloadIfConfigChanged, transformAll } from './context'

const mtimes = new Map<string, number>()

// Can't anchor to top of file: `transformerDirectives` hoists `@property` rules
const DIRECTIVE_RE = /@unocss(?:[ \t]([^;]*))?;/g

// Mirrors @unocss/postcss layers logic
// However, deduplication only works within a file, not work globally b/c no shared state
function selectLayers(
  result: { getLayer: (l: string) => string | undefined, getLayers: (i?: string[], e?: string[]) => string },
  arg: string | undefined,
  emitted: string[],
) {
  if (!arg)
    return result.getLayers(undefined, emitted) || ''

  const include: string[] = []
  const exclude: string[] = []
  for (const raw of arg.split(',')) {
    const name = raw.trim()
    if (!name)
      continue

    if (name.startsWith('!')) {
      if (name.length > 1)
        exclude.push(name.slice(1))
    }
    else {
      include.push(name)
    }
  }

  if (include.length && exclude.length)
    console.warn(`[unocss] Mixing normal and negated layer names in "@unocss ${arg}" is not recommended.`)

  if (include.length) {
    emitted.push(...include)
    return include
      .map(l => (l === 'all' ? result.getLayers() : result.getLayer(l)) || '')
      .filter(Boolean)
      .join('\n')
  }
  if (exclude.length) {
    emitted.push(...exclude)
    return result.getLayers(undefined, exclude) || ''
  }
  return result.getLayers(undefined, emitted) || ''
}

/**
 * Runs the transformers over a stylesheet, then splices the generated CSS in at
 * `@unocss`. Turbopack has no virtual modules, so the directive stands in for the
 * `import 'uno.css'` entry the other bundler integrations use.
 */
export default function unocssCssLoader(this: LoaderContext, source: string): void {
  const callback = this.async()
  const id = this.resourcePath
  const root = this.rootContext
  const options = this.getOptions?.() ?? {}
  const addDependency = (f: string) => this.addDependency?.(f)
  const addContextDependency = (d: string) => this.addContextDependency?.(d)

  ;(async () => {
    const ctx = getContext(options, root)
    await ctx.ready
    await reloadIfConfigChanged(ctx, mtimes)

    // A config edit invalidates every module transformed under the old config.
    for (const file of ctx.getConfigFileList())
      addDependency(file)

    const transformed = await transformAll(ctx, source, id)
    const code = transformed?.code ?? source

    if (code.search(DIRECTIVE_RE) === -1)
      return callback(null, code, transformed?.map)

    const config = await ctx.getConfig()

    // Extraction is based on content.filesystem, same as `@unocss/postcss`
    // no shared memory so must generate all tokens here
    const globs = toArray(config.content?.filesystem ?? defaultFilesystemGlobs)
    const includesNodeModules = globs.some(i => i.includes('node_modules'))

    // `addDependency` covers files that exist; watch the directories to catch new files
    for (const dir of watchRoots(root, globs))
      addContextDependency(dir)

    // dot directories like `.next` are excluded by default
    // If user changes `distDir` without leading dot, needs to be excluded by hand
    // `content: { filesystem: ['**/*.{html,tsx}', '!out/**'] }`.
    const files = await glob(globs, {
      cwd: root,
      absolute: true,
      ignore: includesNodeModules ? undefined : ['**/node_modules/**'],
      expandDirectories: false,
    })

    const tokens = new Set<string>()

    await Promise.all(files.map(async (file) => {
      if (file === id)
        return
      addDependency(file)

      let raw: string
      try {
        raw = await fs.readFile(file, 'utf-8')
      }
      catch {
        return // removed between glob and read
      }

      if (raw.includes(IGNORE_COMMENT))
        return

      const result = await transformAll(ctx, raw, file)
      await ctx.uno.applyExtractors((result?.code ?? raw).replace(SKIP_COMMENT_RE, ''), file, tokens)
    }))

    await Promise.all((config.content?.inline ?? []).map(async (c, idx) => {
      if (typeof c === 'function')
        c = await c()
      if (typeof c === 'string')
        c = { code: c }
      await ctx.uno.applyExtractors(c.code.replace(SKIP_COMMENT_RE, ''), c.id ?? `__plain_content_${idx}__`, tokens)
    }))

    const result = await ctx.uno.generate(tokens, { minify: config.envMode === 'build' })

    const emitted: string[] = []
    callback(null, code.replace(DIRECTIVE_RE, (_: string, arg?: string) => selectLayers(result, arg?.trim(), emitted)))
  })().catch(callback)
}

function watchRoots(root: string, globs: string[]) {
  const roots = new Set<string>()
  for (const pattern of globs) {
    if (pattern.startsWith('!'))
      continue
    const literal = pattern.split(/[*?[{]/)[0]
    roots.add(resolve(root, literal.endsWith('/') ? literal : dirname(literal)))
  }
  const list = [...roots].sort((a, b) => a.length - b.length)
  return list.filter((d, i) => !list.slice(0, i).some(p => d === p || d.startsWith(`${p}/`)))
}
