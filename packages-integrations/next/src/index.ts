import type { FilterPattern } from '@unocss/core'
import type { NextConfigLike } from './types'
import { createRequire } from 'node:module'
import process from 'node:process'
import { loadConfig } from '@unocss/config'
import { cssIdRE, resolveConfig } from '@unocss/core'
import { isAbsolute, relative } from 'pathe'
import { defaultPipelineExclude, defaultPipelineInclude } from '#integration/defaults'

const require = /* @__PURE__ */ createRequire(import.meta.url)

export function withUnoCSS<T extends object>(nextConfig: T = {} as T) {
  return async (): Promise<T> => {
    const config = nextConfig as NextConfigLike
    const root = process.cwd()
    const { config: uno } = await loadConfig(root)

    const { transformers } = await resolveConfig(uno)

    const cssLoader = require.resolve('@unocss/next/loader-css')
    const sourceLoader = require.resolve('@unocss/next/loader-source')

    // loader for cscs type files for @unocss entry and directives transformer if exists
    const rules: unknown[] = [{
      condition: { all: [{ not: 'foreign' }, { path: cssIdRE }] },
      loaders: [cssLoader],
    }]

    // add source code loader only if any transformers exist
    const pipeline = uno.content?.pipeline
    if (pipeline !== false && transformers?.length) {
      const include = toConditions(pipeline?.include ?? defaultPipelineInclude, root)
      const exclude = toConditions(pipeline?.exclude ?? defaultPipelineExclude, root)

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
          + '  so no UnoCSS will be generated. Use Turbopack, or switch to @unocss/postcss.\n',
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

function toConditions(pattern: FilterPattern, root: string) {
  const list = Array.isArray(pattern) ? pattern : [pattern]
  return list.filter(Boolean).map(path => ({
    path: typeof path === 'string' ? toRelativeGlob(path, root) : path,
  }))
}

// turbopack expects relative path in globs
function toRelativeGlob(pattern: string, root: string) {
  if (pattern.startsWith('./') || pattern.startsWith('**'))
    return pattern
  return `./${isAbsolute(pattern) ? relative(root, pattern) : pattern}`
}

export default withUnoCSS
