<script setup lang="ts">
import { shikiHighlight } from '../composables/rpc'

const props = withDefaults(defineProps<{
  modelValue?: string
  /** Shiki language id (e.g. `css`, `html`, `ts`) */
  mode?: string
}>(), {
  modelValue: '',
  mode: 'text',
})

const html = ref<string | null>(null)
const failed = ref(false)

watch(
  () => [props.modelValue, props.mode] as const,
  async ([code, lang]) => {
    if (!code) {
      html.value = ''
      failed.value = false
      return
    }
    try {
      const result = await shikiHighlight(code, lang)
      if (result == null) {
        // Service unavailable — fall back to plain text
        failed.value = true
        html.value = null
      }
      else {
        failed.value = false
        html.value = result
      }
    }
    catch {
      failed.value = true
      html.value = null
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="shiki-code" of-auto text-sm>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-if="html && !failed" v-html="html" />
    <pre v-else class="shiki-fallback"><code>{{ modelValue }}</code></pre>
  </div>
</template>

<style>
.shiki-code {
  font-family: var(--cm-font-family, monospace);
}
.shiki-code .shiki,
.shiki-code .shiki-fallback {
  margin: 0;
  padding: 8px 12px;
  background: transparent !important;
  white-space: pre;
  tab-size: 2;
}
.shiki-code code {
  font-family: inherit;
}
/* Dual-theme: swap to Shiki's dark values under the inspector's `.dark` */
.dark .shiki-code .shiki,
.dark .shiki-code .shiki span {
  color: var(--shiki-dark, inherit) !important;
  font-style: var(--shiki-dark-font-style, inherit) !important;
  font-weight: var(--shiki-dark-font-weight, inherit) !important;
  text-decoration: var(--shiki-dark-text-decoration, inherit) !important;
}
</style>
