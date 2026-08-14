import type { NextConfigLike, NextPluginOptions } from './types'
import { createRequire } from 'node:module'

export type { NextPluginOptions } from './types'

const require = /* @__PURE__ */ createRequire(import.meta.url)

/**
 * Extensions Turbopack compiles as modules. A loader only reaches a file the
 * bundler loads, and this covers Next.js' own `resolveExtensions` default.
 *
 * Which of these are actually transformed is decided at runtime by
 * `content.pipeline`, shared with every other UnoCSS integration.
 */
const MODULE_EXTS = ['tsx', 'jsx', 'ts', 'js', 'mts', 'mjs', 'cts', 'cjs', 'mdx']

/**
 * Turbopack rule values may be a single object or an array, and every matching
 * rule runs in order. Object spread would drop whichever side loses the key, so
 * append instead and keep both.
 */
function mergeRules(ours: Record<string, unknown>, theirs: Record<string, unknown> = {}) {
  const merged: Record<string, unknown> = { ...theirs }
  for (const [key, rule] of Object.entries(ours)) {
    const existing = merged[key]
    if (existing === undefined) {
      merged[key] = rule
      continue
    }
    // Ours first, so transformers run while the source is still in the shape
    // the extractors expect.
    merged[key] = [
      ...(Array.isArray(rule) ? rule : [rule]),
      ...(Array.isArray(existing) ? existing : [existing]),
    ]
  }
  return merged
}

export function withUnoCSS<T extends object>(
  nextConfig: T = {} as T,
  options: NextPluginOptions = {},
): T {
  const config = nextConfig as NextConfigLike

  const sourceLoader = { loader: require.resolve('@unocss/next/loader-source'), options }
  const cssLoader = { loader: require.resolve('@unocss/next/loader-css'), options }

  const ours: Record<string, unknown> = {
    // Every stylesheet holding an `@unocss` directive, matched by content so
    // the location stays up to the user.
    '*.css': {
      condition: { all: [{ not: 'foreign' }, { content: /@unocss\b/ }] },
      loaders: [cssLoader],
      type: 'css',
    },
  }

  for (const ext of MODULE_EXTS) {
    ours[`*.${ext}`] = {
      condition: { not: 'foreign' },
      loaders: [sourceLoader],
    }
  }

  const turbopack = config.turbopack ?? {}
  const userWebpack = config.webpack

  return {
    ...nextConfig,
    turbopack: {
      ...turbopack,
      rules: mergeRules(ours, turbopack.rules),
    },
    // Only webpack reaches this, and webpack ignores `turbopack.rules` — so a
    // build here would ship a stylesheet with no utilities.
    webpack(config: any, context: any) {
      console.warn(
        '\n[unocss] This build is using webpack, where `turbopack.rules` are ignored,\n'
        + '  so no UnoCSS will be generated. Use Turbopack, or switch to @unocss/webpack.\n',
      )
      return typeof userWebpack === 'function' ? userWebpack(config, context) : config
    },
  }
}

export default withUnoCSS
