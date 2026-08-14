import type { UserConfig } from '@unocss/core'

export interface NextPluginOptions {
  /**
   * Path to the UnoCSS config file, or an inline config object.
   * Resolved from the project root by default.
   */
  config?: UserConfig | string
  /**
   * Project root used to resolve the config and content globs.
   *
   * @default process.cwd()
   */
  root?: string
}

/** The subset of the webpack loader context Turbopack implements. */
export interface LoaderContext {
  resourcePath: string
  async: () => (err: Error | null, code?: string, map?: any) => void
  getOptions?: () => NextPluginOptions | null
  addDependency?: (file: string) => void
  addContextDependency?: (dir: string) => void
}

/**
 * The parts of a Next.js config this plugin reads, described structurally.
 *
 * Importing `NextConfig` instead would pull in `next/types/global.d.ts`, whose
 * `ImportMeta['glob']` is non-generic. It merges with the generic one from
 * `vite/client` and breaks every `import.meta.glob<T>()` call in the repo.
 *
 * `withUnoCSS` is generic over `object` and returns the type it was given, so a
 * caller annotating their config as `NextConfig` keeps it end to end.
 */
export interface NextConfigLike {
  turbopack?: {
    rules?: Record<string, unknown>
  }
  /** `NextConfig` types this as nullable. */
  webpack?: ((config: any, context: any) => any) | null
}
