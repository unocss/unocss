import type { UnocssPluginContext } from '@unocss/core'
import type { LoaderContext } from './types'
import fs from 'node:fs/promises'
import { dirname, isAbsolute, relative, resolve } from 'pathe'
import { glob } from 'tinyglobby'
import { defaultFilesystemGlobs } from '#integration/defaults'
import { applyTransformers } from '#integration/transformers'
import { getContext, reloadIfConfigChanged } from './context'

// Replaces the `@unocss` directive with generated CSS.
//
// Turbopack gives a loader no view of the module graph, so this scans the
// filesystem itself — the same approach `@unocss/postcss` takes, with the
// transformers applied that `@unocss/postcss` skips.

// `@unocss;` / `@unocss all;` / `@unocss default, shortcuts;` / `@unocss !preflights;`
const DIRECTIVE_RE = /^[ \t]*@unocss(?:[ \t]([^;]*))?;[ \t]*$/m

/** File types Turbopack compiles as modules, and therefore can rewrite. */
const MODULE_RE = /\.(?:[cm]?[jt]sx?|mdx)$/

const mtimes = new Map<string, number>()

function selectLayers(result: { getLayer: (l: string) => string | undefined, getLayers: (i?: string[], e?: string[]) => string }, arg?: string) {
  if (!arg || arg === 'all')
    return result.getLayers()

  const include: string[] = []
  const exclude: string[] = []
  for (const raw of arg.split(',')) {
    const name = raw.trim()
    if (!name)
      continue
    if (name.startsWith('!'))
      exclude.push(name.slice(1))
    else
      include.push(name)
  }

  if (include.length) {
    return include
      .map(l => (l === 'all' ? result.getLayers() : result.getLayer(l)) || '')
      .filter(Boolean)
      .join('\n')
  }
  if (exclude.length)
    return result.getLayers(undefined, exclude) || ''
  return result.getLayers()
}

/** Run every enforce phase, in the order `@unocss/cli` uses. */
async function transformAll(ctx: UnocssPluginContext, code: string, id: string) {
  const pre = await applyTransformers(ctx, code, id, 'pre')
  const def = await applyTransformers(ctx, pre?.code ?? code, id, 'default')
  const post = await applyTransformers(ctx, def?.code ?? pre?.code ?? code, id, 'post')
  return post?.code ?? def?.code ?? pre?.code ?? code
}

export default function unocssCssLoader(this: LoaderContext, source: string): void {
  const callback = this.async()
  const selfPath = this.resourcePath
  const options = this.getOptions?.() ?? {}
  const addDependency = (f: string) => this.addDependency?.(f)
  const addContextDependency = (d: string) => this.addContextDependency?.(d)

  ;(async () => {
    const ctx = getContext(options)
    await ctx.ready
    await reloadIfConfigChanged(ctx, mtimes)

    for (const file of ctx.getConfigFileList())
      addDependency(file)

    const config = await ctx.getConfig()
    const root = ctx.root

    // Resolve directives (`@apply`, `theme()`, `@screen`) in the host file.
    const code = await transformAll(ctx, source, selfPath)

    const match = DIRECTIVE_RE.exec(code)
    if (!match)
      return callback(null, code)

    const globs = config.content?.filesystem ?? defaultFilesystemGlobs
    const includesNodeModules = globs.some(i => i.includes('node_modules'))

    // `addDependency` covers files that exist now; watching the directories is
    // what makes a newly created file trigger regeneration.
    for (const dir of watchRoots(root, globs))
      addContextDependency(dir)

    const files = await glob(globs, {
      cwd: root,
      absolute: true,
      ignore: includesNodeModules ? undefined : ['**/node_modules/**'],
      expandDirectories: false,
    })

    const unrewritable: string[] = []

    await Promise.all(files.map(async (file) => {
      if (file === selfPath)
        return
      addDependency(file)

      let raw: string
      try {
        raw = await fs.readFile(file, 'utf-8')
      }
      catch {
        return // removed between glob and read
      }

      if (!ctx.filter(raw, file))
        return

      const transformed = await transformAll(ctx, raw, file)

      // A transformer rewrote this file. Turbopack rewrites it too whenever it
      // compiles the file as a module; for data file types the markup keeps its
      // original text while this CSS uses the new names.
      if (transformed !== raw && !MODULE_RE.test(file))
        unrewritable.push(file)

      await ctx.extract(transformed, file)
    }))

    // `content.inline` from the config
    await Promise.all((config.content?.inline ?? []).map(async (c, idx) => {
      if (typeof c === 'function')
        c = await c()
      if (typeof c === 'string')
        c = { code: c }
      await ctx.extract(c.code, c.id ?? `__plain_content_${idx}__`)
    }))

    if (unrewritable.length)
      warnUnrewritable(root, unrewritable)

    await ctx.flushTasks()
    const result = await ctx.uno.generate(ctx.tokens, { minify: config.envMode === 'build' })
    const css = selectLayers(result, match[1]?.trim())

    callback(null, code.slice(0, match.index) + css + code.slice(match.index + match[0].length))
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

function warnUnrewritable(root: string, files: string[]) {
  const shown = files.slice(0, 5).map(f => `    ${isAbsolute(f) ? relative(root, f) : f}`)
  console.warn(
    `\n[unocss] ${files.length} file(s) use transformer syntax in a file type Next.js loads as data,\n`
    + `  so a loader only reaches them through this scan. Their CSS uses the transformed names\n`
    + `  while the source keeps its original text, so those styles will miss.\n`
    + `  Write the expanded classes directly, or exclude these from \`content.filesystem\`.\n`
    + `${shown.join('\n')}\n`
    + `${files.length > 5 ? `    …and ${files.length - 5} more\n` : ''}`,
  )
}
