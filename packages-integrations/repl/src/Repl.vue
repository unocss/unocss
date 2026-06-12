<script setup lang="ts">
import type { UserConfig } from '@unocss/core'
import type { ModuleCache, ModuleMap } from './evaluate-config'
import type { ReplOptions, ReplStore } from './store'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import { Pane, Splitpanes } from 'splitpanes'
import { computed, provide, ref } from 'vue'
import ReplEditor from './components/ReplEditor.vue'
import ReplHeader from './components/ReplHeader.vue'
import ReplPreview from './components/ReplPreview.vue'
import { useStore } from './store'

export interface ReplProps {
  /** Editor backend: 'monaco' or 'codemirror'. @default 'monaco' */
  editor?: 'monaco' | 'codemirror'
  /** Theme. @default 'dark' */
  theme?: 'dark' | 'light'
  /** Pre-created store instance. If provided, default* props are ignored. */
  store?: ReplStore
  /** Initial HTML content */
  defaultHTML?: string
  /** Initial config content */
  defaultConfigRaw?: string
  /** Initial custom CSS content */
  defaultCSS?: string
  /** CSS layer name for custom CSS @default 'playground' */
  customCSSLayerName?: string
  /** Default REPL options (transform toggles, responsive mode) */
  defaultOptions?: ReplOptions
  /** URL for the preview iframe HTML page */
  previewSrc?: string
  /** Module map for config evaluation */
  moduleMap?: ModuleMap
  /** Cache for resolved modules */
  modulesCache?: ModuleCache
  /** Function to evaluate user config. Overrides default + moduleMap. */
  evaluateConfig?: (configStr: string) => Promise<UserConfig | undefined>
  /** Whether to show the header bar. @default true */
  showHeader?: boolean
  /** Whether to show the preview pane. @default true */
  showPreview?: boolean
  /** UnoCSS reset CSS string to inject as base preflight */
  resetCSS?: string
}

const props = withDefaults(defineProps<ReplProps>(), {
  editor: 'monaco',
  theme: 'dark',
  showHeader: true,
  showPreview: true,
  customCSSLayerName: 'playground',
})

// Use provided store or create a new one
const store = props.store || useStore({
  defaultHTML: props.defaultHTML,
  defaultConfigRaw: props.defaultConfigRaw,
  defaultCSS: props.defaultCSS,
  defaultOptions: props.defaultOptions,
  customCSSLayerName: props.customCSSLayerName,
  moduleMap: props.moduleMap,
  modulesCache: props.modulesCache,
  evaluateConfig: props.evaluateConfig,
  resetCSS: props.resetCSS,
})

// Provide store, editor choice, and theme
provide('repl-editor-type', computed(() => props.editor))
provide('repl-theme', computed(() => props.theme))

// Mobile detection for splitpanes orientation
const bp = useBreakpoints(breakpointsTailwind)
const isMobile = bp.smaller('sm')
const isResizing = ref(false)

defineExpose({
  store,
})
</script>

<template>
  <div class="unocss-repl" :class="{ dark: theme === 'dark' }">
    <slot name="header">
      <ReplHeader v-if="showHeader" />
    </slot>
    <div class="unocss-repl-content" flex-1 of-hidden>
      <Splitpanes
        class="h-full w-full"
        :horizontal="isMobile"
        @resized="isResizing = false"
        @resize="isResizing = true"
      >
        <Pane v-if="showPreview">
          <ReplPreview :preview-src="previewSrc" :resizing="isResizing" />
        </Pane>
        <Pane>
          <ReplEditor />
        </Pane>
      </Splitpanes>
    </div>
    <slot name="footer" />
  </div>
</template>

<style>
.unocss-repl {
  --cm-background: #ffffff;
  --cm-foreground: #393a34;
  --cm-border: #f0f0f0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.unocss-repl.dark {
  --cm-background: #121212;
  --cm-foreground: #dbd7caee;
  --cm-border: #191919;
  color-scheme: dark;
}

.unocss-matched {
  border-bottom: 1px dashed currentColor;
}
</style>
