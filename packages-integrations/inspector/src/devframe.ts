import type { UnocssPluginContext, UserConfig, UserConfigDefaults } from '@unocss/core'
import type { DevframeDefinition, DevframeNodeContext } from 'devframe'
import type { ModuleUpdate } from '../types'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { defineDevframe } from 'devframe'
import { glob } from 'tinyglobby'
import { createContext } from '#integration/context'
import { version } from '../package.json'
import { createRpcFunctions, INSPECTOR_RPC_SCOPE } from './rpc'

export * from './rpc'

const _dirname = typeof __dirname !== 'undefined'
  ? __dirname
  : dirname(fileURLToPath(import.meta.url))

/**
 * Locate the built inspector SPA. Prefers the path relative to this module,
 * with a fallback through the consuming project's `node_modules` for
 * bundlers that rewrite `import.meta.url` (e.g. Next.js/Turbopack).
 */
function resolveClientDist(): string {
  const local = resolve(_dirname, '../dist/client')
  if (existsSync(local))
    return local
  try {
    const require = createRequire(join(process.cwd(), '_resolve.js'))
    return join(dirname(require.resolve('@unocss/inspector/package.json')), 'dist/client')
  }
  catch {
    return local
  }
}

export interface UnocssInspectorDevframe {
  /**
   * The devframe definition — mountable by any devframe host
   * (Vite, Vite DevTools, Next.js, standalone, static build).
   */
  definition: DevframeDefinition
  /**
   * Notify every connected inspector client that a module changed.
   */
  notifyModuleUpdated: (update: ModuleUpdate) => void
  /**
   * Notify every connected inspector client that the UnoCSS config reloaded.
   */
  notifyConfigChanged: () => void
  /**
   * Notify every connected inspector client that generated CSS was
   * invalidated (new tokens were extracted).
   */
  notifyInvalidated: () => void
}

/**
 * Create the UnoCSS inspector as a devframe, bound to an existing UnoCSS
 * plugin context. The same definition can be mounted by multiple hosts at
 * once (e.g. a standalone mount and a Vite DevTools dock); change
 * notifications are broadcast to every host.
 */
export function createInspectorDevframe(ctx: UnocssPluginContext): UnocssInspectorDevframe {
  const hosts = new Set<DevframeNodeContext>()

  const definition = defineDevframe({
    id: 'unocss',
    name: 'UnoCSS',
    version,
    packageName: '@unocss/inspector',
    importMetaUrl: import.meta.url,
    homepage: 'https://unocss.dev',
    description: 'Inspect the generated CSS, matched utilities and modules of UnoCSS',
    icon: 'https://unocss.dev/logo.svg',
    basePath: '/__unocss/',
    clientAssets: resolveClientDist(),
    setup(host) {
      hosts.add(host)
      const scoped = host.scope(INSPECTOR_RPC_SCOPE)
      for (const fn of createRpcFunctions(ctx))
        scoped.rpc.register(fn as any)
    },
  })

  function broadcast(method: 'on-module-updated' | 'on-config-changed' | 'on-invalidated', args: any[]) {
    for (const host of hosts) {
      host.scope(INSPECTOR_RPC_SCOPE).rpc.broadcast({ method, args, event: true, optional: true } as any).catch(() => {})
    }
  }

  return {
    definition,
    notifyModuleUpdated: update => broadcast('on-module-updated', [update]),
    notifyConfigChanged: () => broadcast('on-config-changed', []),
    notifyInvalidated: () => broadcast('on-invalidated', []),
  }
}

export interface StandaloneInspectorOptions {
  /**
   * Project root to scan.
   *
   * @default process.cwd()
   */
  root?: string
  /**
   * UnoCSS config or path to the config file. When omitted, the config is
   * auto-loaded from the root.
   */
  config?: UserConfig | string
  /**
   * Config defaults passed to the context.
   */
  defaults?: UserConfigDefaults
  /**
   * Glob patterns of files to extract utilities from, relative to the root.
   * Defaults to common source files, excluding `node_modules` and build
   * output.
   */
  patterns?: string[]
}

const DEFAULT_PATTERNS = [
  '**/*.{html,vue,svelte,astro,jsx,tsx,js,ts,mdx,md,marko,pug,elm,php,phtml}',
  '!**/node_modules/**',
  '!**/dist/**',
  '!**/.next/**',
  '!**/.nuxt/**',
  '!**/.output/**',
]

/**
 * Create the inspector devframe for hosts without a bundler-integrated
 * UnoCSS context (e.g. a Next.js app using `@unocss/postcss`): builds a
 * standalone context and populates it by scanning the project files once
 * at startup.
 */
export async function createStandaloneInspectorDevframe(options: StandaloneInspectorOptions = {}): Promise<UnocssInspectorDevframe> {
  const {
    root = process.cwd(),
    config,
    defaults = {},
    patterns = DEFAULT_PATTERNS,
  } = options

  const ctx = createContext(config, defaults)
  await ctx.updateRoot(root)
  await ctx.ready

  const files = await glob(patterns, { cwd: root, absolute: true })
  await Promise.all(files.map(async (file) => {
    try {
      const code = readFileSync(file, 'utf-8')
      await ctx.extract(code, file)
    }
    catch {}
  }))
  await ctx.flushTasks()

  return createInspectorDevframe(ctx)
}
