import type { FilterPattern } from '@unocss/core'
import { isAbsolute, relative } from 'node:path'
import { cssIdRE } from '@unocss/core'
import { createFilter } from 'unplugin-utils'
import { defaultPipelineExclude, defaultPipelineInclude } from '#integration/defaults'

export interface NativeFilter {
  shouldExtract: (id: string) => boolean
  shouldTransform: (id: string) => boolean
}

export function createNativeFilter(
  root: string,
  include?: FilterPattern,
  exclude?: FilterPattern,
  disabled = false,
): NativeFilter {
  const sourceFilter = disabled
    ? () => false
    : createFilter(
        include ?? defaultPipelineInclude,
        exclude ?? defaultPipelineExclude,
        { resolve: root },
      )

  return {
    shouldExtract(id) {
      return !cssIdRE.test(id) && sourceFilter(normalizeId(root, id))
    },
    shouldTransform(id) {
      return cssIdRE.test(id) || sourceFilter(normalizeId(root, id))
    },
  }
}

function normalizeId(root: string, id: string): string {
  const cleanId = id.replace(/\?.*$/, '')
  return isAbsolute(cleanId) ? relative(root, cleanId) : cleanId
}
