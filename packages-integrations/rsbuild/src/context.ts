import type { GenerateResult, UnocssPluginContext, UserConfig } from '@unocss/core'
import type { UnoCSSRspackPluginOptions } from './types'
import fs from 'node:fs/promises'
import { isAbsolute, resolve } from 'node:path'
import { glob } from 'tinyglobby'
import { IGNORE_COMMENT, INCLUDE_COMMENT } from '#integration/constants'
import { createContext } from '#integration/context'
import { resolveId, resolveLayer } from '#integration/layers'
import { createNativeFilter } from './filter'
import { transformSource } from './transformers'

export class NativeContext {
  readonly filter

  private readonly base: UnocssPluginContext

  private readonly externalTokens = new Map<string, Set<string>>()

  private readonly moduleSources = new Map<string, string>()

  private readonly moduleTokens = new Map<string, Set<string>>()

  private externalFiles = new Set<string>()

  private generateKey = ''

  private generateResult: GenerateResult | undefined

  private virtualHash = ''

  /**
   * 创建一次 Rspack 编译器生命周期内共享的 UnoCSS 上下文。
   *
   * @param root 项目根目录。
   * @param options Rspack integration 配置。
   */
  constructor(
    readonly root: string,
    readonly options: UnoCSSRspackPluginOptions,
  ) {
    this.base = createContext(options.configOrPath, options.defaults)
    this.filter = createNativeFilter(root, options.include, options.exclude)
  }

  /** 获取当前 UnoCSS 配置依赖的文件列表。 */
  get configFiles(): string[] {
    return this.base.getConfigFileList()
  }

  /** 获取通过 `content.filesystem` 扫描到的外部文件。 */
  get filesystemFiles(): ReadonlySet<string> {
    return this.externalFiles
  }

  /** 获取虚拟 CSS 模块当前使用的内容 hash。 */
  getVirtualHash(): string {
    return this.virtualHash
  }

  /**
   * 更新虚拟 CSS 模块的内容 hash。
   *
   * @param hash 最新生成 CSS 的稳定 hash。
   */
  setVirtualHash(hash: string): void {
    this.virtualHash = hash
  }

  /** 初始化 UnoCSS 配置并提取外部 content。 */
  async initialize(): Promise<void> {
    await this.base.updateRoot(this.root)
    await this.extractExternalContent()
  }

  /**
   * 转换模块源码并更新该模块对应的 token 集合。
   *
   * @param source 模块源码。
   * @param id 带查询参数的模块标识。
   * @returns transformer 处理后的源码和可选 sourcemap。
   */
  async transformModule(source: string, id: string) {
    await this.base.ready
    return this.transformModuleInner(source, id)
  }

  /**
   * 删除模块及其 token，防止 HMR 后残留无效 utility。
   *
   * @param id 模块标识。
   */
  removeModule(id: string): void {
    this.moduleSources.delete(id)
    this.moduleTokens.delete(id)
    this.invalidateGenerateCache()
  }

  /**
   * 淘汰本轮 compilation 已不存在的模块。
   *
   * @param moduleIds 当前 compilation 的模块标识集合。
   */
  evictModulesNotIn(moduleIds: ReadonlySet<string>): void {
    for (const id of this.moduleSources.keys()) {
      if (!moduleIds.has(id))
        this.removeModule(id)
    }
  }

  /** 重新加载配置，并使用新配置重建所有已知模块和外部 token。 */
  async reloadConfig(): Promise<void> {
    await this.base.reloadConfig()
    this.moduleTokens.clear()
    this.externalTokens.clear()
    this.invalidateGenerateCache()

    for (const [id, source] of this.moduleSources)
      await this.transformModuleInner(source, id)

    await this.extractExternalContent()
  }

  /** 重新提取 `content.inline` 与 `content.filesystem` 指定的内容。 */
  async extractExternalContent(): Promise<void> {
    await this.base.ready
    const config = await this.base.getConfig() as UserConfig
    const pendingTokens = new Map<string, Set<string>>()
    const pendingFiles = new Set<string>()

    for (const [index, item] of (config.content?.inline ?? []).entries()) {
      const resolved = typeof item === 'function' ? await item() : item
      const content = typeof resolved === 'string' ? { code: resolved } : resolved
      const id = content.id ?? `__uno_inline_${index}__`
      pendingTokens.set(id, await this.extractSource(content.code, id))
    }

    const patterns = config.content?.filesystem ?? []
    if (patterns.length) {
      const files = await glob(patterns, {
        cwd: this.root,
        absolute: true,
        expandDirectories: false,
        ignore: ['**/{.git,node_modules}/**'],
      })
      for (const file of files) {
        const absoluteFile = isAbsolute(file) ? file : resolve(this.root, file)
        pendingFiles.add(absoluteFile)
        pendingTokens.set(absoluteFile, await this.extractSource(await fs.readFile(absoluteFile, 'utf8'), absoluteFile))
      }
    }

    this.externalTokens.clear()
    for (const [id, tokens] of pendingTokens)
      this.externalTokens.set(id, tokens)
    this.externalFiles = pendingFiles
    this.invalidateGenerateCache()
  }

  /**
   * 合并当前 token 并生成 CSS，相同 token 集合会复用缓存。
   *
   * @param minify 是否压缩生成结果。
   * @returns UnoCSS 分层生成结果。
   */
  async generate(minify = false): Promise<GenerateResult> {
    await this.base.ready
    const tokens = this.collectTokens()
    const key = [...tokens].sort().join('\0')
    if (this.generateResult && this.generateKey === key)
      return this.generateResult

    this.generateKey = key
    this.generateResult = await this.base.uno.generate(tokens, { minify })
    return this.generateResult
  }

  /**
   * 创建绑定当前模块 token 集合的 UnoCSS 插件上下文。
   *
   * @param tokens 当前模块独立维护的 token 集合。
   * @returns 可供官方 transformer 使用的上下文。
   */
  getPluginContext(tokens: Set<string>): UnocssPluginContext {
    const base = this.base
    return {
      ...base,
      tokens,
      filter: (code, id) => {
        if (code.includes(IGNORE_COMMENT))
          return false
        return code.includes(INCLUDE_COMMENT)
          || (this.filter.shouldExtract(id) && base.filter(code, id))
      },
    }
  }

  /**
   * 将 `uno.css` 等公开入口解析为 UnoCSS 虚拟模块标识。
   *
   * @param id 待解析的导入标识。
   * @param importer 导入方模块标识。
   * @returns 解析后的虚拟标识，非 UnoCSS 入口返回 undefined。
   */
  async resolveVirtualId(id: string, importer?: string): Promise<string | undefined> {
    return resolveId(this.base, id, importer)
  }

  /**
   * 解析虚拟模块对应的 CSS layer。
   *
   * @param id 已解析的 UnoCSS 虚拟标识。
   * @returns layer 名称，无法解析时返回 undefined。
   */
  async resolveLayer(id: string): Promise<string | undefined> {
    return resolveLayer(this.base, id)
  }

  /** 转换单个模块，并原子更新其源码和 token 缓存。 */
  private async transformModuleInner(source: string, id: string) {
    const tokens = new Set<string>()
    const result = await transformSource(this.getPluginContext(tokens), source, id)
    if (this.filter.shouldExtract(id))
      await this.base.uno.applyExtractors(result.code, id, tokens)

    this.moduleSources.set(id, source)
    this.moduleTokens.set(id, tokens)
    this.invalidateGenerateCache()
    return result
  }

  /** 从外部内容中运行 transformer 和 extractor，返回独立 token 集合。 */
  private async extractSource(source: string, id: string): Promise<Set<string>> {
    const tokens = new Set<string>()
    const result = await transformSource(this.getPluginContext(tokens), source, id)
    await this.base.uno.applyExtractors(result.code, id, tokens)
    return tokens
  }

  /** 合并模块与外部内容的 token，并自动去重。 */
  private collectTokens(): Set<string> {
    const tokens = new Set<string>()
    for (const tokenSet of [...this.moduleTokens.values(), ...this.externalTokens.values()]) {
      for (const token of tokenSet)
        tokens.add(token)
    }
    return tokens
  }

  /** 使 CSS 生成缓存失效。 */
  private invalidateGenerateCache(): void {
    this.generateKey = ''
    this.generateResult = undefined
  }
}
