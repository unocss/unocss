import { isAbsolute, relative } from 'node:path'
import { cssIdRE } from '@unocss/core'
import { createFilter } from 'unplugin-utils'
import { defaultPipelineExclude, defaultPipelineInclude } from '#integration/defaults'

export interface NativeFilter {
  shouldExtract: (id: string) => boolean
  shouldTransform: (id: string) => boolean
}

/**
 * 创建同时服务源码提取与 transformer pipeline 的模块过滤器。
 *
 * @param root 项目根目录。
 * @param include 用户自定义包含规则。
 * @param exclude 用户自定义排除规则。
 * @returns 归一化 Rspack resource 后的过滤器。
 */
export function createNativeFilter(
  root: string,
  include?: Array<string | RegExp>,
  exclude?: Array<string | RegExp>,
): NativeFilter {
  const sourceFilter = createFilter(
    include ?? defaultPipelineInclude,
    exclude ?? defaultPipelineExclude,
    { resolve: root },
  )

  return {
    /** 判断模块是否应参与 utility token 提取。 */
    shouldExtract(id) {
      return !cssIdRE.test(id) && sourceFilter(normalizeId(root, id))
    },
    /** 判断模块是否应进入 UnoCSS transformer pipeline。 */
    shouldTransform(id) {
      return cssIdRE.test(id) || sourceFilter(normalizeId(root, id))
    },
  }
}

/** 将绝对 resource 和查询参数归一化为 filter 可匹配的项目相对路径。 */
function normalizeId(root: string, id: string): string {
  const cleanId = id.replace(/\?.*$/, '')
  return isAbsolute(cleanId) ? relative(root, cleanId) : cleanId
}
