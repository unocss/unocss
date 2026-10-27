import { existsSync } from 'node:fs'
import { lstat, readdir, readFile, realpath, rm } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { globSync } from 'tinyglobby'

const root = fileURLToPath(new URL('..', import.meta.url))

/**
 * pnpm writes `node_modules/.bin` entries as shims that hardcode the path they
 * resolve to, and keeps them when a dependency is removed from a package
 * manifest, e.g. after a package starts relying on a workspace root dependency.
 *
 * A reused `node_modules` — the Netlify build cache, a long-lived local
 * checkout — then holds a shim pointing into a `.pnpm` directory that a newer
 * install already pruned. Because pnpm puts the package's own `.bin` first on
 * `PATH`, that dead shim shadows the working one from the root `node_modules`,
 * and the script fails with `Cannot find module .../dist/run.mjs`.
 *
 * Removing only the entries whose target no longer exists keeps a stale cache
 * harmless while leaving every working shim untouched.
 */
export async function cleanStaleBinShims() {
  // Any package manifest is a starting point; the bin directories that a
  // `pnpm run` script sees are the ones along its path up to the root.
  const manifests = globSync(['**/package.json'], {
    cwd: root,
    absolute: true,
    ignore: ['**/node_modules/**'],
  })

  const binDirs = new Set<string>()
  for (const manifest of manifests) {
    let dir = dirname(manifest)
    for (;;) {
      binDirs.add(join(dir, 'node_modules', '.bin'))
      const parent = dirname(dir)
      if (dir === root || parent === dir)
        break
      dir = parent
    }
  }

  const removed: string[] = []
  for (const binDir of binDirs) {
    for (const name of await readdir(binDir).catch(() => [])) {
      const shim = join(binDir, name)
      const target = await resolveShimTarget(shim)
      if (target !== undefined && !existsSync(target)) {
        await rm(shim, { force: true })
        removed.push(shim)
      }
    }
  }

  return removed
}

/**
 * Resolve the path a shim points to, or `undefined` when the entry is not a
 * shim this script understands. An empty string marks a dangling symlink.
 */
async function resolveShimTarget(shim: string) {
  const stats = await lstat(shim).catch(() => undefined)
  if (!stats)
    return undefined
  if (stats.isSymbolicLink())
    return realpath(shim).catch(() => '')
  if (!stats.isFile())
    return undefined

  const content = await readFile(shim, 'utf-8').catch(() => '')
  // The marker sits at the end of the shim, past the shell boilerplate, so the
  // whole file has to be read.
  const target = content.match(/^# cmd-shim-target=(.*)$/m)?.[1]?.trim()
  return target ? resolve(dirname(shim), target) : undefined
}

const removed = await cleanStaleBinShims()
if (removed.length > 0) {
  console.log(`[clean-stale-bins] removed ${removed.length} stale bin shim(s):`)
  for (const shim of removed)
    console.log(`  ${relative(root, shim)}`)
}
