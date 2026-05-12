import type { UserConfig, UserConfigDefaults } from '@unocss/core'
import type { LoadConfigResult, LoadConfigSource } from 'unconfig'
import { createHash } from 'node:crypto'
import fs, { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { cyan } from 'colorette'
import { consola } from 'consola'
import { createConfigLoader as createLoader } from 'unconfig'

export type { LoadConfigResult, LoadConfigSource }

const HTTP_IMPORT_RE = /from\s+['"]https?:\/\/[^'"]+['"]/g
const HTTP_IMPORT_URL_RE = /['"](?<url>https?:\/\/[^'"]+)['"]/

/**
 * Fetch a remote module and cache it locally.
 * Returns the local file path of the cached module.
 */
async function cacheRemoteModule(url: string): Promise<string> {
  const cacheDir = join(tmpdir(), '.unocss-remote-modules')
  if (!existsSync(cacheDir))
    mkdirSync(cacheDir, { recursive: true })
  const hash = createHash('sha256').update(url).digest('hex').slice(0, 16)
  const ext = url.includes('.ts') ? '.mts' : '.mjs'
  const cachedPath = join(cacheDir, `${hash}${ext}`)

  if (!existsSync(cachedPath)) {
    const response = await fetch(url)
    if (!response.ok)
      throw new Error(`Failed to fetch remote module: ${url} (${response.status})`)
    const content = await response.text()
    writeFileSync(cachedPath, content, 'utf-8')
  }
  return cachedPath
}
/**
 * Pre-process a config file: rewrite HTTP imports to locally cached modules.
 * Returns a temp file path if rewriting was needed, or undefined if no changes.
 */
async function preprocessHttpImports(
  configPath: string,
): Promise<string | undefined> {
  const { readFileSync } = await import('node:fs')
  const content = readFileSync(configPath, 'utf-8')
  const matches = content.match(HTTP_IMPORT_RE)
  if (!matches)
    return undefined

  let processed = content
  for (const match of matches) {
    const urlMatch = match.match(HTTP_IMPORT_URL_RE)
    if (urlMatch?.groups?.url) {
      const url = urlMatch.groups.url
      const localPath = await cacheRemoteModule(url)
      processed = processed.replace(url, localPath)
    }
  }

  const cacheDir = join(tmpdir(), '.unocss-remote-modules')
  const hash = createHash('sha256').update(configPath).digest('hex').slice(0, 16)
  const ext = configPath.endsWith('.ts') ? '.ts' : '.mjs'
  const tempConfigPath = join(cacheDir, `config-${hash}${ext}`)
  writeFileSync(tempConfigPath, processed, 'utf-8')
  return tempConfigPath
}

export async function loadConfig<U extends UserConfig>(
  cwd = process.cwd(),
  configOrPath: string | U = cwd,
  extraConfigSources: LoadConfigSource[] = [],
  defaults: UserConfigDefaults = {},
): Promise<LoadConfigResult<U>> {
  let inlineConfig = {} as U
  let hasUserCustomConfig = false

  if (typeof configOrPath !== 'string') {
    hasUserCustomConfig = true
    inlineConfig = configOrPath
    if (inlineConfig.configFile === false) {
      return {
        config: inlineConfig as U,
        sources: [],
      }
    }
    else {
      configOrPath = inlineConfig.configFile || process.cwd()
    }
  }

  const resolved = resolve(configOrPath)

  let isFile = false
  if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
    isFile = true
    cwd = dirname(resolved)
  }
  let effectivePath = resolved
  if (isFile) {
    try {
      const preprocessed = await preprocessHttpImports(resolved)
      if (preprocessed)
        effectivePath = preprocessed
    }
    catch (e) {
      consola.warn(`[@unocss/config] Failed to pre-process HTTP imports:`, e)
    }
  }

  const loader = createLoader<U>({
    sources: isFile
      ? [
          {
            files: effectivePath,
            extensions: [],
          },
        ]
      : [
          {
            files: [
              'unocss.config',
              'uno.config',
            ],
          },
          ...extraConfigSources,
        ],
    cwd,
  })

  const result = await loader.load()

  if (!hasUserCustomConfig && !isFile && !result.config) {
    consola.error(`[@unocss/config] Config file not found in ${cyan(configOrPath)} - loading default config.`)
  }

  result.config = Object.assign(defaults, inlineConfig, result.config ?? {})

  if (result.config.configDeps) {
    result.sources = [
      ...result.sources,
      ...result.config.configDeps.map(i => resolve(cwd, i)),
    ]
  }

  // Restore original config path in sources if we used a preprocessed temp file
  if (effectivePath !== resolved) {
    result.sources = result.sources.map(s => s === effectivePath ? resolved : s)
  }
  return result
}

/**
 * Create a factory function that returns a config loader that recovers from errors.
 *
 * When it fails to load the config, it will return the last successfully loaded config.
 *
 * Mainly used for dev-time where users might have a broken config in between changes.
 */
export function createRecoveryConfigLoader<U extends UserConfig>() {
  let lastResolved: LoadConfigResult<U> | undefined
  return async (
    cwd = process.cwd(),
    configOrPath: string | U = cwd,
    extraConfigSources: LoadConfigSource[] = [],
    defaults: UserConfigDefaults = {},
  ) => {
    try {
      const config = await loadConfig(cwd, configOrPath, extraConfigSources, defaults)
      lastResolved = config
      return config
    }
    catch (e) {
      if (lastResolved) {
        consola.error(`[@unocss/config] Error loading config:`, e)
        return lastResolved
      }
      throw e
    }
  }
}
