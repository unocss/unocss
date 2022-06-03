import type { VitePluginConfig } from '@unocss/vite'
import VitePlugin from '@unocss/vite'
import type { Plugin } from 'vite'
import { defaultUnocssConfig } from '../../shared-integration/src'

export * from '@unocss/vite'

export default function UnocssVitePlugin<Theme extends {}>(
  configOrPath?: VitePluginConfig<Theme> | string,
): Plugin[] {
  return VitePlugin(
    configOrPath,
    defaultUnocssConfig,
  )
}
