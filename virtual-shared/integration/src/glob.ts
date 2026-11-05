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
