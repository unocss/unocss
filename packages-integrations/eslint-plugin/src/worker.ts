import type { BlocklistMeta, UnoGenerator } from '@unocss/core'
import { dirname } from 'node:path'
import process from 'node:process'
import { sortRules } from '#integration/sort-rules'
import { loadConfig } from '@unocss/config'
import { createGenerator } from '@unocss/core'
import { runAsWorker } from 'synckit'

const promises = new Map<string, Promise<UnoGenerator<any>> | undefined>()

// bypass icon rules in ESLint
process.env.ESLINT ||= 'true'

function getSearchCwd(id: string): string {
  // Check if it's a virtual file path from ESLint processors
  // Virtual paths have the pattern: /path/to/source.ext/virtual_file.ext
  // This happens with markdown, MDX, and other files with embedded code blocks
  const virtualMatch = id.match(/\.\w+\/[^/]+$/)

  if (virtualMatch) {
    const realPath = id.slice(0, id.lastIndexOf('/'))
    return dirname(realPath)
  }

  return dirname(id)
}

async function _getGenerator(configPath?: string, id?: string) {
  // Determine the search directory:
  // 1. If configPath is provided, use process.cwd() (existing behavior for explicit config)
  // 2. If filename is provided and no configPath, search from the file's directory (monorepo support)
  // 3. Otherwise, use process.cwd() as fallback
  const searchFrom = configPath
    ? process.cwd()
    : id
      ? getSearchCwd(id)
      : process.cwd()

  const { config, sources } = await loadConfig(
    searchFrom,
    configPath,
  )
  if (!sources.length)
    throw new Error('[@unocss/eslint-plugin] No config file found, create a `uno.config.ts` file in your project root and try again.')
  return createGenerator({
    ...config,
    warn: false,
  })
}

function getCacheKey(configPath?: string, id?: string): string {
  // Create a cache key based on configPath or the directory of the filename
  if (configPath)
    return `config:${configPath}`
  if (id)
    return `dir:${getSearchCwd(id)}`
  return `cwd:${process.cwd()}`
}

export async function getGenerator(configPath?: string, id?: string) {
  const cacheKey = getCacheKey(configPath, id)
  let promise = promises.get(cacheKey)
  if (!promise) {
    promise = _getGenerator(configPath, id)
    promises.set(cacheKey, promise)
  }
  return await promise
}

export function setGenerator(generator: Awaited<UnoGenerator<any>>, configPath?: string | undefined) {
  const cacheKey = configPath ? `config:${configPath}` : `cwd:${process.cwd()}`
  promises.set(cacheKey, Promise.resolve(generator))
}

async function actionSort(configPath: string | undefined, classes: string, id?: string) {
  return await sortRules(classes, await getGenerator(configPath, id))
}

async function actionBlocklist(configPath: string | undefined, classes: string, id?: string): Promise<[string, BlocklistMeta | undefined][]> {
  const uno = await getGenerator(configPath, id)
  const blocked = new Map<string, BlocklistMeta | undefined>()

  const extracted = await uno.applyExtractors(classes, id)
  const values = [...extracted.values()]

  const getMeta = (raw: string, meta?: BlocklistMeta) => {
    return meta?.message
      ? {
          ...meta,
          message: typeof meta.message === 'function' ? meta.message(raw) : meta.message,
        }
      : meta
  }

  const matchBlocked = async (raw: string) => {
    if (blocked.has(raw))
      return
    const rule = uno.getBlocked(raw)
    if (rule) {
      blocked.set(raw, getMeta(raw, rule[1]))
      return
    }
    let current = raw
    for (const p of uno.config.preprocess)
      current = p(raw)!
    const results = await uno.matchVariants(raw, current)
    const rules = results.map(r => r && uno.getBlocked(r[1]))

    for (const rule of rules) {
      if (rule)
        blocked.set(raw, getMeta(raw, rule[1]))
    }
  }

  await Promise.all(values.map(matchBlocked))

  return [...blocked]
}

export function runAsync(configPath: string | undefined, action: 'sort', classes: string, id?: string): Promise<string>
export function runAsync(configPath: string | undefined, action: 'blocklist', classes: string, id?: string): Promise<[string, BlocklistMeta | undefined][]>
export async function runAsync(configPath: string | undefined, action: string, ...args: any[]): Promise<any> {
  switch (action) {
    case 'sort':
      // @ts-expect-error cast
      return actionSort(configPath, ...args)
    case 'blocklist':
      // @ts-expect-error cast
      return actionBlocklist(configPath, ...args)
  }
}

export function run(configPath: string | undefined, action: 'sort', classes: string, id?: string): string
export function run(configPath: string | undefined, action: 'blocklist', classes: string, id?: string): [string, BlocklistMeta | undefined][]
export function run(configPath: string | undefined, action: string, ...args: any[]): any {
  // @ts-expect-error cast
  return runAsync(configPath, action, ...args)
}

runAsWorker(run as any)
