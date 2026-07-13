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
import { NativeContext } from './context'
import { registerContext, unregisterContext } from './registry'

const pluginName = 'unocss:rspack-native'
const loaderPath = fileURLToPath(new URL('./loader.mjs', import.meta.url))

export class UnoCSSRspackPlugin<Theme extends object = object> implements RspackPluginInstance {
  /**
   * 创建原生 UnoCSS Rspack 插件。
   *
   * @param userOptions UnoCSS 与 Rspack integration 配置。
   */
  constructor(private readonly userOptions: UnoCSSRspackPluginOptions<Theme> = {}) {}

  /**
   * 注册 loader、虚拟模块、CSS 生成和 watch invalidation hooks。
   *
   * @param compiler Rspack compiler 实例。
   */
  apply(compiler: Compiler): void {
    const options = {
      ...this.userOptions,
      root: this.userOptions.root ?? compiler.context,
      watch: this.userOptions.watch ?? true,
      autoCssRule: this.userOptions.autoCssRule ?? true,
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

    virtualModules.apply(compiler)
    this.injectLoader(compiler, context, contextId)
    this.resolveVirtualModules(compiler, context, virtualAllPath, virtualLayerPath, virtualLayers)
    if (options.autoCssRule)
      this.injectCssRule(compiler)

    compiler.hooks.beforeCompile.tapPromise(pluginName, () => context.initialize())

    compiler.hooks.watchRun.tapPromise(pluginName, async (watchCompiler) => {
      const modified = watchCompiler.modifiedFiles ?? new Set<string>()
      const removed = watchCompiler.removedFiles ?? new Set<string>()
      if (context.configFiles.some(file => modified.has(file))) {
        await context.reloadConfig()
        return
      }
      if ([...context.filesystemFiles].some(file => modified.has(file) || removed.has(file)))
        await context.extractExternalContent()
      for (const file of removed)
        context.removeModule(file)
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
        for (const file of context.configFiles)
          compilation.fileDependencies.add(file)
        for (const file of context.filesystemFiles)
          compilation.fileDependencies.add(file)
      })

      compilation.hooks.processAssets.tapPromise(
        {
          name: pluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
        },
        async () => {
          const result = await context.generate(compiler.options.mode === 'production')
          const importedLayers = this.getImportedLayers(compilation.modules, virtualLayers)

          for (const asset of compilation.getAssets()) {
            const original = asset.source.source().toString()
            let replaced = false
            let escapeCss: ReturnType<typeof getCssEscaperForJsContent> | undefined
            const code = original
              .replace(HASH_PLACEHOLDER_RE, '')
              .replace(LAYER_PLACEHOLDER_RE, (_match, layer, escapeView) => {
                replaced = true
                escapeCss ??= getCssEscaperForJsContent(escapeView.trim())
                const css = layer.trim() === LAYER_MARK_ALL
                  ? result.getLayers(undefined, importedLayers)
                  : (result.getLayer(layer.trim()) ?? '')
                return escapeCss(css)
              })

            if (replaced) {
              compilation.updateAsset(
                asset.name,
                new sources.SourceMapSource(code, asset.name, asset.source.map() as never),
              )
            }
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
      setTimeout(() => compiler.watching?.invalidate(), 0)
    })

    compiler.hooks.shutdown?.tap(pluginName, () => unregisterContext(contextId))
  }

  /** 为普通源码和 Vue SFC 的实际 loader chain 注入 UnoCSS loader。 */
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

    for (const item of compiler.options.module.rules) {
      if (!item || typeof item !== 'object')
        continue
      const rule = item as {
        test?: RegExp
        use?: Array<string | { loader?: string, options?: unknown }>
      }
      if (!(rule.test instanceof RegExp) || !new RegExp(rule.test.source, rule.test.flags.replace('g', '')).test('component.vue'))
        continue
      if (Array.isArray(rule.use))
        rule.use.push(loader)
    }
  }

  /** 将公开 UnoCSS CSS 入口解析到预注册的 Rspack 虚拟模块。 */
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
        if (layer === LAYER_MARK_ALL) {
          data.request = virtualAllPath
          return
        }
        const request = `${virtualLayerPath}?uno-layer=${encodeURIComponent(layer)}`
        virtualLayers.set(request, layer)
        data.request = request
      })
    })
  }

  /** 为直接使用 Rspack 的场景注入虚拟 CSS module rule。 */
  private injectCssRule(compiler: Compiler): void {
    compiler.options.module.rules.push({
      test: /[\\/|]\.unocss-rsbuild[\\/|].+\.css$/,
      type: 'css/auto',
    })
  }

  /** 收集本轮 compilation 实际导入的命名 layer。 */
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
}

/**
 * 创建原生 UnoCSS Rspack 插件实例。
 *
 * @param options UnoCSS 与 Rspack integration 配置。
 * @returns 可加入 Rspack `plugins` 的插件实例。
 */
export function unoCSSRspackPlugin<Theme extends object = object>(
  options: UnoCSSRspackPluginOptions<Theme> = {},
): UnoCSSRspackPlugin<Theme> {
  return new UnoCSSRspackPlugin(options)
}
