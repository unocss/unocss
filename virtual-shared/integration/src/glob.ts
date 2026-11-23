import { sep } from 'node:path'

/**
 * Normalize a filesystem glob for the glob engine: separators have to be `/`.
 * `.`/`..` segments, duplicated separators and trailing slashes are handled by
 * tinyglobby itself, and on POSIX a backslash is an escape character, so it is
 * kept as is.
 *
 * Node-only: browser-facing packages must not import this module.
 */
export function normalizeFilesystemGlob(glob: string): string {
  return sep === '\\' ? glob.replaceAll('\\', '/') : glob
}

export const nodeModulesGlobIgnore = '**/node_modules/**'

/**
 * Split patterns so broad globs can ignore `node_modules` while explicitly
 * configured `node_modules` globs still scan it. Negated patterns apply to both.
 */
export function groupFilesystemGlobs(globs: string[]) {
  const regular: string[] = []
  const nodeModules: string[] = []
  const negated: string[] = []

  for (const glob of globs) {
    if (glob.startsWith('!'))
      negated.push(glob)
    else if (glob.includes('node_modules'))
      nodeModules.push(glob)
    else
      regular.push(glob)
  }

  return {
    regular: regular.length ? [...regular, ...negated] : [],
    nodeModules: nodeModules.length ? [...nodeModules, ...negated] : [],
  }
}
