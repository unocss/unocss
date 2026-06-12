import type { UnoGenerator, UserConfig } from '@unocss/core'
import type { Ref } from 'vue'
import { createGenerator } from '@unocss/core'
import { ref } from 'vue'

// --- Evaluate config ---
export { clearGlobalModuleCache, evaluateUserConfig } from './evaluate-config'
export type { ModuleCache, ModuleMap } from './evaluate-config'

// --- Match positions ---
export { getMatchedPositions, getMatchedPositionsFromCode } from './match-positions'
export type { GetMatchedPositionsOptions } from './match-positions'

// --- Repl component ---
export { default as Repl } from './Repl.vue'
export type { ReplProps } from './Repl.vue'

// --- Header components ---
export { default as ReplHeader } from './components/ReplHeader.vue'
export { default as SelectVersion } from './components/SelectVersion.vue'

// --- Store ---
export { useStore, useStoreContext } from './store'
export type { ReplOptions, ReplStore, ReplStoreOptions } from './store'

// --- Composables ---
export { usePanelLayout, usePanelLayoutContext } from './composables/usePanelLayout'
export type { PanelLayoutContext } from './composables/usePanelLayout'
export { useCssOutput, useCssOutputContext } from './composables/useCssOutput'
export type { CssOutputContext } from './composables/useCssOutput'

// --- Editor types (backward compatible) ---
export interface UnoEditorProps {
  /**
   * The code content
   */
  modelValue: string
  /**
   * Language mode for syntax highlighting
   * @default 'html'
   */
  language?: string
  /**
   * Whether the editor is read-only
   * @default false
   */
  readOnly?: boolean
  /**
   * Theme variant
   * @default 'dark'
   */
  theme?: 'dark' | 'light'
  /**
   * UnoCSS configuration
   */
  unocss?: UserConfig
}

export interface UnoEditorEmits {
  'update:modelValue': [value: string]
}

export type { UnoGenerator, UserConfig }

/**
 * Language mode to Monaco/CodeMirror language ID mapping
 */
export const languageMap: Record<string, string> = {
  html: 'html',
  css: 'css',
  js: 'javascript',
  ts: 'typescript',
  vue: 'html',
  svelte: 'html',
  marko: 'html',
  mjs: 'javascript',
  cjs: 'javascript',
  mts: 'typescript',
  cts: 'typescript',
  jsx: 'javascript',
  tsx: 'typescript',
  xml: 'xml',
}

/**
 * Resolve language ID from mode string
 */
export function resolveLanguage(mode: string): string {
  return languageMap[mode] || mode
}

/**
 * Create a UnoCSS generator instance from config
 */
export async function createUnoGenerator(config?: UserConfig): Promise<UnoGenerator> {
  return createGenerator(config)
}

/**
 * Create a reactive UnoCSS generator
 */
export function useUnoGenerator(config?: UserConfig): Ref<UnoGenerator | undefined> {
  const generator = ref<UnoGenerator>()

  createUnoGenerator(config).then((g) => {
    generator.value = g
  })

  return generator
}
