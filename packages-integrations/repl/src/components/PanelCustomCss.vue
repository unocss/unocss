<script setup lang="ts">
import { Pane } from 'splitpanes'
import { computed, inject, unref } from 'vue'
import { UnoCodeMirror } from '../codemirror'
import { usePanelLayoutContext } from '../composables/usePanelLayout'
import { useCSSPrettify } from '../composables/usePrettify'
import { UnoMonaco } from '../monaco'
import { useStoreContext } from '../store'
import TitleBar from './TitleBar.vue'

defineProps<{ index: number }>()

const store = useStoreContext()
const panel = usePanelLayoutContext()
const theme = inject<import('vue').Ref<'dark' | 'light'>>('repl-theme')!
const editorType = inject<import('vue').Ref<'monaco' | 'codemirror'>>('repl-editor-type')!

const computedCustomCSS = computed<string>({
  get: () => unref(store.options.value.transformCustomCSS ? store.transformedCSS : store.customCSS) || '',
  set: (value: string) => {
    store.customCSS.value = value
  },
})

const WarnContent = computed(() => {
  if (store.customCSSWarn.value) {
    const msg = store.customCSSWarn.value.message
    const match = msg.match(/^([^']+)'(.+)'([^']+)$/)
    if (match)
      return `Warning: ${match[1]}<a inline-block b="b dashed yellow4" href="https://unocss.dev/transformers/directives" target='_blank'>${match[2]}</a>${match[3]}`
  }
  return ''
})

function formatCSS() {
  store.customCSS.value = useCSSPrettify(
    store.options.value.transformCustomCSS ? store.transformedCSS : store.customCSS,
  ).value || ''
}
</script>

<template>
  <Pane :min-size="panel.titleHeightPercent.value" :size="panel.panelSizes.value[index]" flex flex-col relative>
    <div class="flex flex-wrap bg-$cm-background">
      <TitleBar
        title="Custom CSS" w-full relative
        @title-click="panel.togglePanel(index)"
      >
        <template #before>
          <div
            class="flex-shrink-0 i-ri-arrow-right-s-line transition-transform transform"
            :class="panel.isCollapsed(index) ? '' : 'rotate-90'"
          />
        </template>
        <div
          flex justify-end items-center w-full h-full gap2
          transition duration-400
          :class="panel.isCollapsed(index) ? 'op0' : ''"
          un-children="inline-flex items-center cursor-pointer gap-1"
        >
          <label>
            <input v-model="store.options.value.transformCustomCSS" type="checkbox">
            <span text-sm>Transform</span>
          </label>
          <div w-1px h-full my--1 bg-gray:20 />
          <button
            i-ri-mist-line icon-btn
            title="Format"
            @click="formatCSS()"
          />
        </div>
      </TitleBar>
    </div>
    <UnoMonaco
      v-if="editorType === 'monaco'"
      v-model="computedCustomCSS"
      :theme="theme"
      language="css"
      :read-only="store.options.value.transformCustomCSS"
      :register-providers="false"
      flex-auto
      border="l gray-400/20"
    />
    <UnoCodeMirror
      v-else
      v-model="computedCustomCSS"
      :theme="theme"
      language="css"
      :read-only="store.options.value.transformCustomCSS"
      flex-auto
      border="l gray-400/20"
    />
    <div
      v-if="!panel.isCollapsed(index) && store.options.value.transformCustomCSS && store.customCSSWarn.value && WarnContent"
      absolute
      left-0
      right-0
      bottom-0
      p="x-2 y-1"
      bg="yellow-400/20"
      text="yellow-400 sm"
      v-html="WarnContent"
    />
  </Pane>
</template>
