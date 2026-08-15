import type { FilterPattern } from '@unocss/core'
import type { NextConfigLike, NextPluginOptions } from './types'
import { createRequire } from 'node:module'
import process from 'node:process'
import { loadConfig } from '@unocss/config'
import { cssIdRE } from '@unocss/core'
import { defaultPipelineExclude, defaultPipelineInclude } from '#integration/defaults'

export type { NextPluginOptions } from './types'

const require = /* @__PURE__ */ createRequire(import.meta.url)

export function withUnoCSS<T extends object>(
  nextConfig: T = {} as T,
  options: NextPluginOptions = {},
) {
  return async (): Promise<T> => {
    const config = nextConfig as NextConfigLike
    const root = process.cwd()
    const { config: uno } = await loadConfig(root, options.config ?? root)

    const cssLoader = { loader: require.resolve('@unocss/next/loader-css'), options }
    const sourceLoader = { loader: require.resolve('@unocss/next/loader-source'), options }

    // loader for cscs type files for @unocss entry and directives transformer if exists
    const rules: unknown[] = [{
      condition: { all: [{ not: 'foreign' }, { path: cssIdRE }] },
      loaders: [cssLoader],
    }]

    const pipeline = uno.content?.pipeline
    if (pipeline !== false) {
      const include = toConditions(pipeline?.include ?? defaultPipelineInclude)
      const exclude = toConditions(pipeline?.exclude ?? defaultPipelineExclude)

      // An empty include matches everything, as it does in `createFilter`.
      const all: unknown[] = [{ not: 'foreign' }]
      if (include.length)
        all.push({ any: include })
      if (exclude.length)
        all.push({ not: { any: exclude } })

      rules.push({ condition: { all }, loaders: [sourceLoader] })
    }

    const ours: Record<string, unknown> = {
      '**': rules,
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
}

function mergeRules(ours: Record<string, unknown>, theirs: Record<string, unknown> = {}) {
  const merged: Record<string, unknown> = { ...theirs }
  for (const [key, rule] of Object.entries(ours)) {
    const existing = merged[key]
    if (existing === undefined) {
      merged[key] = rule
      continue
    }

    merged[key] = [
      ...(Array.isArray(rule) ? rule : [rule]),
      ...(Array.isArray(existing) ? existing : [existing]),
    ]
  }
  return merged
}

function toConditions(pattern: FilterPattern) {
  const list = Array.isArray(pattern) ? pattern : [pattern]
  return list.filter(Boolean).map(path => ({ path }))
}

export default withUnoCSS
