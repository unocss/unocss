import type { Compiler, Module, RspackPluginInstance } from '@rspack/core'
import type { UnoCSSRspackPluginOptions } from './types'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Compilation, rspack, sources } from '@rspack/core'
import { LAYER_MARK_ALL } from '#integration/constants'
import {
  getCssEscaperForJsContent,
  getHashPlaceholder,
  getLayerPlaceholder,
  HASH_PLACEHOLDER_RE,
  LAYER_PLACEHOLDER_RE,
} from '#integration/layers'
import { restoreCachedModules } from './cache'
import { ExternalContentWatcher } from './content-watcher'
import { NativeContext } from './context'
import { registerContext, unregisterContext } from './registry'

const pluginName = 'unocss:rspack-native'
const loaderPath = fileURLToPath(new URL('./loader.mjs', import.meta.url))

export class UnoCSSRspackPlugin<Theme extends object = object> implements RspackPluginInstance {
  constructor(private readonly userOptions: UnoCSSRspackPluginOptions<Theme> = {}) {}

  apply(compiler: Compiler): void {
    const options = {
      ...this.userOptions,
      root: this.userOptions.root ?? compiler.context,
      watch: this.userOptions.watch ?? true,
      autoCssRule: this.userOptions.autoCssRule ?? true,
      defaults: {
        envMode: compiler.options.mode === 'development' ? 'dev' as const : 'build' as const,
        ...this.userOptions.defaults,
      },
    }
    const context = new NativeContext(options.root, options)
    const contextId = registerContext(context)
    const virtualAllPath = join(context.root, 'node_modules', '.unocss-rsbuild', 'uno.css')
    const virtualLayerPath = join(context.root, 'node_modules', '.unocss-rsbuild', 'uno-layer.css')
    const virtualModules = new rspack.experiments.VirtualModulesPlugin({
      [virtualAllPath]: getLayerPlaceholder(LAYER_MARK_ALL),
      [virtualLayerPath]: getLayerPlaceholder(LAYER_MARK_ALL),
    })
    const virtualLayers = new Map<string, string>()
    virtualLayers.set(virtualAllPath, LAYER_MARK_ALL)
    let virtualHash = ''
    let shouldInvalidate = false
    const contentWatcher = new ExternalContentWatcher(compiler, context, options.watch)

    virtualModules.apply(compiler)
    this.injectLoader(compiler, context, contextId)
    this.resolveVirtualModules(compiler, context, virtualAllPath, virtualLayerPath, virtualLayers)
    if (options.autoCssRule)
      this.injectCssRule(compiler)

    compiler.hooks.beforeCompile.tapPromise(pluginName, () => context.initialize())

    compiler.hooks.watchRun.tapPromise(pluginName, async (watchCompiler) => {
      await context.initialize()
      const modified = watchCompiler.modifiedFiles ?? new Set<string>()
      const removed = watchCompiler.removedFiles ?? new Set<string>()
      if (context.configFiles.some(file => modified.has(file) || removed.has(file))) {
        await context.reloadConfig()
        await contentWatcher.sync()
        return
      }
      if (options.watch && this.hasExternalContentChange(context, modified, removed)) {
        await context.extractExternalContent()
      }
      for (const file of removed)
        context.removeModule(file)
      await contentWatcher.ensure()
    })

    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.finishModules.tapPromise(pluginName, async (modules) => {
        const currentModules = new Set<string>()
        for (const module of modules) {
          const resource = (module as Module & { resource?: string }).resource
          if (resource)
            currentModules.add(resource)
        }
        context.evictModulesNotIn(currentModules)
        // Cached modules may skip loaders, so restore their tokens from source.
        await restoreCachedModules(compiler, context, modules)
        for (const file of context.configFiles)
          compilation.fileDependencies.add(file)
        if (options.watch) {
          for (const file of context.filesystemFiles)
            compilation.fileDependencies.add(file)
        }
      })

      compilation.hooks.processAssets.tapPromise(
        {
          name: pluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
        },
        async () => {
          const assets = compilation.getAssets()
            .map(asset => ({ asset, source: asset.source.source() }))
            .filter(({ source }) => source.includes('#--unocss'))
          if (!assets.length && !compiler.watchMode)
            return

          const result = await context.generate(compiler.options.mode === 'production')
          const importedLayers = this.getImportedLayers(compilation.modules, virtualLayers)

          for (const { asset, source } of assets) {
            const original = source.toString()
            const replacement = new sources.ReplaceSource(asset.source, asset.name)
            let replaced = false
            let escapeCss: ReturnType<typeof getCssEscaperForJsContent> | undefined

            for (const match of original.matchAll(HASH_PLACEHOLDER_RE)) {
              replaced = true
              replacement.replace(match.index, match.index + match[0].length - 1, '')
            }
            for (const match of original.matchAll(LAYER_PLACEHOLDER_RE)) {
              replaced = true
              const layer = match[1].trim()
              escapeCss ??= getCssEscaperForJsContent(match[2]?.trim() ?? '')
              const css = layer === LAYER_MARK_ALL
                ? result.getLayers(undefined, importedLayers)
                : (result.getLayer(layer) ?? '')
              replacement.replace(match.index, match.index + match[0].length - 1, escapeCss(css))
            }

            if (replaced)
              compilation.updateAsset(asset.name, replacement)
          }

          if (!compiler.watchMode)
            return

          const allCss = result.getLayers(undefined, importedLayers)
          const hash = createHash('sha256').update(allCss).digest('hex').slice(0, 12)
          if (virtualHash === hash)
            return
          virtualHash = hash
          context.setVirtualHash(hash)
          const content = `${getHashPlaceholder(hash)}${getLayerPlaceholder(LAYER_MARK_ALL)}`
          virtualModules.writeModule(virtualAllPath, content)
          virtualModules.writeModule(virtualLayerPath, content)
          shouldInvalidate = true
        },
      )
    })

    compiler.hooks.done.tap(pluginName, () => {
      if (!shouldInvalidate || !compiler.watching)
        return
      shouldInvalidate = false
      setTimeout(() => {
        compiler.watching?.invalidateWithChangesAndRemovals(
          new Set([virtualAllPath, virtualLayerPath]),
          new Set(),
        )
      }, 0)
    })

    compiler.hooks.watchClose.tap(pluginName, () => {
      void contentWatcher.close()
    })
    compiler.hooks.shutdown.tapPromise(pluginName, async () => {
      await contentWatcher.close()
      unregisterContext(contextId)
    })
  }

  private injectLoader(compiler: Compiler, context: NativeContext, contextId: string): void {
    const loader = {
      loader: loaderPath,
      options: { contextId },
      parallel: false,
    }

    compiler.options.module.rules.unshift({
      enforce: 'pre',
      test: resource => typeof resource === 'string' && context.filter.shouldTransform(resource),
      use: [loader],
    })
  }

  private resolveVirtualModules(
    compiler: Compiler,
    context: NativeContext,
    virtualAllPath: string,
    virtualLayerPath: string,
    virtualLayers: Map<string, string>,
  ): void {
    compiler.hooks.normalModuleFactory.tap(pluginName, (factory) => {
      factory.hooks.beforeResolve.tapPromise(pluginName, async (data) => {
        const resolvedId = await context.resolveVirtualId(data.request, data.contextInfo.issuer)
        if (!resolvedId)
          return
        const layer = await context.resolveLayer(resolvedId)
        if (!layer)
          return
        const queryIndex = resolvedId.indexOf('?')
        const query = queryIndex >= 0 ? resolvedId.slice(queryIndex) : ''
        if (layer === LAYER_MARK_ALL) {
          const request = `${virtualAllPath}${query}`
          virtualLayers.set(request, LAYER_MARK_ALL)
          data.request = request
          return
        }
        const request = `${virtualLayerPath}${query}${query ? '&' : '?'}uno-layer=${encodeURIComponent(layer)}`
        virtualLayers.set(request, layer)
        data.request = request
      })
    })
  }

  private injectCssRule(compiler: Compiler): void {
    compiler.options.module.rules.push({
      test: /[\\/]\.unocss-rsbuild[\\/].+\.css$/,
      type: 'css/auto',
    })
  }

  private getImportedLayers(modules: Iterable<Module>, virtualLayers: Map<string, string>): string[] {
    const layers = new Set<string>()
    for (const module of modules) {
      const resource = (module as Module & { resource?: string }).resource
      const layer = resource ? virtualLayers.get(resource) : undefined
      if (layer && layer !== LAYER_MARK_ALL)
        layers.add(layer)
    }
    return [...layers]
  }

  private hasExternalContentChange(
    context: NativeContext,
    modified: ReadonlySet<string>,
    removed: ReadonlySet<string>,
  ): boolean {
    for (const file of [...modified, ...removed]) {
      if (context.filesystemFiles.has(file) || context.matchesFilesystemFile(file))
        return true
    }
    return false
  }
}

export function unoCSSRspackPlugin<Theme extends object = object>(
  options: UnoCSSRspackPluginOptions<Theme> = {},
): UnoCSSRspackPlugin<Theme> {
  return new UnoCSSRspackPlugin(options)
}
