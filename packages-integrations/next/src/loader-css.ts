import type { LoaderContext } from './types'
import fs from 'node:fs/promises'
import { toArray } from '@unocss/core'
import { parse, walk } from 'css-tree'
import MagicString from 'magic-string'
import { dirname, resolve } from 'pathe'
import { glob } from 'tinyglobby'
import { IGNORE_COMMENT, SKIP_COMMENT_RE } from '#integration/constants'
import { defaultFilesystemGlobs } from '#integration/defaults'
import { getDirectiveLayers } from '#integration/layers'
import { getContext, transformAll } from './context'

// cached generated tokens per file, invalid if edited (mtime) or config changes (revision)
const extracted = new Map<string, { mtime: number, revision: number, tokens: Set<string> }>()

export default function unocssCssLoader(this: LoaderContext, source: string): void {
  const callback = this.async()
  const id = this.resourcePath
  const root = this.rootContext

  ;(async () => {
    const { ctx, revision } = await getContext(root)

    // rerun on config edit
    for (const file of ctx.getConfigFileList())
      this.addDependency(file)

    const transformed = await transformAll(ctx, source, id)
    const code = transformed?.code ?? source

    const directives = findDirectives(code, id)
    if (!directives.length)
      return callback(null, code, transformed?.map)

    const resolvedConfig = ctx.uno.config

    // Extraction is based on content.filesystem, same as `@unocss/postcss`
    const globs = toArray(resolvedConfig.content?.filesystem ?? defaultFilesystemGlobs)
    const includesNodeModules = globs.some(i => i.includes('node_modules'))

    // context dependency tracks nested changes, so only need to watch roots
    for (const dir of watchRoots(root, globs))
      this.addContextDependency(dir)

    // dot directories like `.next` are excluded by default
    // If user changes `distDir` without leading dot, needs to be excluded by hand
    // `content: { filesystem: ['**/*.{html,tsx}', '!out/**'] }`.
    const files = await glob(globs, {
      cwd: root,
      absolute: true,
      ignore: includesNodeModules ? undefined : ['**/node_modules/**'],
      expandDirectories: false,
    })

    // remove old entries from cache
    const present = new Set(files)
    for (const file of extracted.keys()) {
      if (!present.has(file))
        extracted.delete(file)
    }

    const tokens = new Set<string>()

    const BATCH_SIZE = 50
    await boundedAsyncMap(BATCH_SIZE, files, async (file) => {
      if (file === id)
        return

      let mtime: number
      try {
        mtime = (await fs.stat(file)).mtimeMs
      }
      catch (e: any) {
        if (e?.code === 'ENOENT')
          return // removed file
        throw e
      }

      const cached = extracted.get(file)
      if (cached?.mtime === mtime && cached.revision === revision) {
        for (const token of cached.tokens)
          tokens.add(token)
        return
      }

      let raw: string
      try {
        raw = await fs.readFile(file, 'utf-8')
      }
      catch (e: any) {
        if (e?.code === 'ENOENT')
          return // removed file
        throw e
      }

      const fileTokens = new Set<string>()
      if (!raw.includes(IGNORE_COMMENT)) {
        const result = await transformAll(ctx, raw, file)
        await ctx.uno.applyExtractors((result?.code ?? raw).replace(SKIP_COMMENT_RE, ''), file, fileTokens)
      }

      extracted.set(file, { mtime, revision, tokens: fileTokens })
      for (const token of fileTokens)
        tokens.add(token)
    })

    await Promise.all((resolvedConfig.content?.inline ?? []).map(async (c, idx) => {
      if (typeof c === 'function')
        c = await c()
      if (typeof c === 'string')
        c = { code: c }
      await ctx.uno.applyExtractors(c.code.replace(SKIP_COMMENT_RE, ''), c.id ?? `__plain_content_${idx}__`, tokens)
    }))

    // files are scanned in parallel, so sort for theme vars emitted in first-seen order
    const result = await ctx.uno.generate([...tokens].sort(), { minify: resolvedConfig.envMode === 'build' })

    const s = new MagicString(code)
    const emitted: string[] = []
    for (const { start, end, params } of directives)
      s.overwrite(start, end, getDirectiveLayers(result, params, emitted))

    callback(null, s.toString())
  })().catch(callback)
}

interface Directive {
  start: number
  end: number
  params?: string
}

function findDirectives(code: string, filename: string): Directive[] {
  if (!code.includes('@unocss'))
    return []

  const directives: Directive[] = []
  const ast = parse(code, {
    filename,
    positions: true,
    parseAtrulePrelude: false,
    parseRulePrelude: false,
    parseValue: false,
    parseCustomProperty: false,
  })

  walk(ast, {
    visit: 'Atrule',
    enter(node) {
      if (node.name !== 'unocss' || !node.loc)
        return
      directives.push({
        start: node.loc.start.offset,
        end: node.loc.end.offset,
        params: node.prelude?.type === 'Raw' ? node.prelude.value.trim() : undefined,
      })
      return walk.skip
    },
  })

  return directives
}

async function boundedAsyncMap<T>(limit: number, items: T[], fn: (item: T) => Promise<void>) {
  let next = 0
  const worker = async () => {
    while (next < items.length)
      await fn(items[next++])
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
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
