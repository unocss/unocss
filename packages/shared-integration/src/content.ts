import type { UnocssPluginContext } from '@unocss/core'
import fs from 'node:fs/promises'
import { isAbsolute, resolve } from 'node:path'
import { glob } from 'tinyglobby'
import { applyTransformers } from './transformers'

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
    const files = await glob(content.filesystem, { cwd: root, expandDirectories: false })

    async function extractFile(file: string) {
      file = isAbsolute(file) ? file : resolve(root, file)
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
      const ignored = ['**/{.git,node_modules}/**']

      const watcher = watch(files, {
        ignorePermissionErrors: true,
        ignored,
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

    await Promise.all(files.map(extractFile))
  }
}
