import { existsSync } from 'node:fs'
import path from 'node:path'
import { toArray } from '@unocss/core'

export interface WorkspaceRootResolutionOptions {
  workspaceRootPath?: string
  workspaceFileDir?: string
  workspaceFolderPaths?: string[]
}

export function resolveWorkspaceRoots(
  root: string | string[] | undefined,
  options: WorkspaceRootResolutionOptions,
): string[] {
  const workspaceFolderPaths = normalizePaths(options.workspaceFolderPaths || [])
  const fallbackRoots = workspaceFolderPaths.length
    ? workspaceFolderPaths
    : normalizePaths([options.workspaceRootPath])

  const configuredRoots = toArray(root).filter(Boolean)

  if (!configuredRoots.length)
    return fallbackRoots

  const basePaths = normalizePaths([
    options.workspaceFileDir,
    ...workspaceFolderPaths,
    options.workspaceRootPath,
  ])

  return normalizePaths(configuredRoots.flatMap(value => resolveConfiguredRoot(value, basePaths)))
}

function resolveConfiguredRoot(value: string, basePaths: string[]): string[] {
  if (!value)
    return []

  if (isAbsolutePath(value))
    return [path.normalize(value)]

  const normalizedValue = path.normalize(value)
  const matchingWorkspaceRoots = basePaths.filter((base) => {
    const normalizedBase = path.normalize(base)
    return normalizedBase === normalizedValue || normalizedBase.endsWith(`${path.sep}${normalizedValue}`)
  })

  if (matchingWorkspaceRoots.length)
    return matchingWorkspaceRoots

  const resolvedCandidates = basePaths.map(base => path.resolve(base, value))
  const existingCandidates = resolvedCandidates.filter(candidate => existsSync(candidate))

  return existingCandidates.length
    ? existingCandidates
    : resolvedCandidates.slice(0, 1)
}

function normalizePaths(paths: Array<string | undefined>): string[] {
  return Array.from(new Set(paths.filter(Boolean).map(value => path.normalize(value!))))
}

function isAbsolutePath(value: string): boolean {
  return path.isAbsolute(value)
    || path.win32.isAbsolute(value)
}
