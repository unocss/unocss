import type { UnocssPluginContext } from '@unocss/core'
import fs from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { glob } from 'tinyglobby'
import { groupFilesystemGlobs, nodeModulesGlobIgnore, normalizeFilesystemGlob } from './glob'
import { applyTransformers } from './transformers'

/**
 * Resolve `content.filesystem` globs against every base and return absolute,
 * de-duplicated paths. Globs are normalized first (separators), and matches are
 * de-duplicated across bases and equivalent spellings.
 */
export async function resolveFilesystemGlobs(globs: string[], bases: string[]): Promise<string[]> {
  const patterns = [...new Set(globs.map(normalizeFilesystemGlob))]
  const groups = groupFilesystemGlobs(patterns)

  async function match(base: string, patterns: string[], ignore?: string) {
    if (!patterns.length)
      return []
    return (await glob(patterns, { cwd: base, expandDirectories: false, ignore }))
      .map(file => resolve(base, file))
  }

  const matched = await Promise.all(
    [...new Set(bases)].flatMap(base => [
      match(base, groups.regular, nodeModulesGlobIgnore),
      match(base, groups.nodeModules),
    ]),
  )
  return [...new Set(matched.flat())]
}

export async function setupContentExtractor(
  ctx: UnocssPluginContext,
  shouldWatch = false,
) {
  const { content } = await ctx.getConfig()
  const { extract, tasks, root, filter } = ctx

  // inline text
  if (content?.inline) {
    await Promise.all(
      content.inline.map(async (c, idx) => {
        if (typeof c === 'function')
          c = await c()
        if (typeof c === 'string')
          c = { code: c }
        return extract(c.code, c.id ?? `__plain_content_${idx}__`)
      }),
    )
  }

  // filesystem
  if (content?.filesystem) {
    const files = await resolveFilesystemGlobs(content.filesystem, [resolve(root), resolve(process.cwd())])

    async function extractFile(file: string) {
      const code = await fs.readFile(file, 'utf-8')
      if (!filter(code, file))
        return

      const preTransform = await applyTransformers(ctx, code, file, 'pre')
      const defaultTransform = await applyTransformers(ctx, preTransform?.code || code, file)
      await applyTransformers(ctx, defaultTransform?.code || preTransform?.code || code, file, 'post')
      return await extract(preTransform?.code || code, file)
    }

    if (shouldWatch) {
      const { watch } = await import('chokidar')

      const watcher = watch(files, {
        ignorePermissionErrors: true,
        ignored: path => path.split(/[\\/]/).includes('.git'),
        cwd: root,
        ignoreInitial: true,
      })

      watcher.on('all', (type, file) => {
        if (type === 'add' || type === 'change') {
          const absolutePath = resolve(root, file)
          tasks.push(extractFile(absolutePath))
        }
      })
    }

    const BATCH_SIZE = 50
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      await Promise.all(files.slice(i, i + BATCH_SIZE).map(extractFile))
    }
  }
}
