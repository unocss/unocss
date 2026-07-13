import type { LoaderContext } from '@rspack/core'
import { getHashPlaceholder, getLayerPlaceholder } from '#integration/layers'
import { getContext } from './registry'

interface LoaderOptions {
  contextId: string
}

/**
 * 在 Rspack loader pipeline 中运行 UnoCSS transformer 或生成虚拟 CSS 占位符。
 *
 * @param source 当前模块源码。
 * @param inputMap 上游 loader 传入的 sourcemap。
 */
export default function unoCSSLoader(
  this: LoaderContext<LoaderOptions>,
  source: string,
  inputMap?: object,
): void {
  const callback = this.async()
  const { contextId } = this.getOptions()
  const context = getContext(contextId)

  if (!context) {
    callback(new Error(`[unocss] Missing native context "${contextId}".`))
    return
  }

  if (this.resourcePath.includes('.unocss-rsbuild')) {
    const layer = new URLSearchParams(this.resourceQuery.slice(1)).get('uno-layer') ?? '__ALL__'
    const hash = context.getVirtualHash()
    const hashPlaceholder = hash ? getHashPlaceholder(hash) : ''
    callback(null, `${hashPlaceholder}${getLayerPlaceholder(layer)}`, inputMap)
    return
  }

  const id = this.resourceQuery.includes('type=style') && !/\.(?:css|less|sass|scss|styl|stylus)(?:$|\?)/.test(this.resource)
    ? `${this.resource}.css`
    : this.resource
  if (!context.filter.shouldTransform(id)) {
    callback(null, source, inputMap)
    return
  }

  context.transformModule(source, id)
    .then(result => callback(null, result.code, result.map ?? inputMap))
    .catch(error => callback(error as Error))
}
