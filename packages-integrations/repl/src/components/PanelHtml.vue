<script setup lang="ts">
import { Pane } from 'splitpanes'
import { computed, inject, unref } from 'vue'
import { UnoCodeMirror } from '../codemirror'
import { usePanelLayoutContext } from '../composables/usePanelLayout'
import { useHTMLPrettify } from '../composables/usePrettify'
import { getMatchedPositions } from '../match-positions'
import { UnoMonaco } from '../monaco'
import { useStoreContext } from '../store'
import TitleBar from './TitleBar.vue'

defineProps<{ index: number }>()

const store = useStoreContext()
const panel = usePanelLayoutContext()
const theme = inject<import('vue').Ref<'dark' | 'light'>>('repl-theme')!
const editorType = inject<import('vue').Ref<'monaco' | 'codemirror'>>('repl-editor-type')!

const computedInputHTML = computed({
  get: () => unref(store.options.value.transformHtml ? store.transformedHTML : store.inputHTML),
  set: (value) => {
    store.inputHTML.value = value
  },
})

// Character offset ranges of matched UnoCSS utilities, underlined by the editor.
const markedRanges = computed<[number, number][]>(() =>
  getMatchedPositions(
    computedInputHTML.value,
    Array.from(store.output.value?.matched || []),
    store.annotations.value || [],
  ).map(([start, end]) => [start, end]),
)

function formatHTML() {
  store.inputHTML.value = useHTMLPrettify(
    store.options.value.transformHtml ? store.transformedHTML : store.inputHTML,
  ).value || ''
}
</script>

<template>
  <Pane :min-size="panel.titleHeightPercent.value" :size="panel.panelSizes.value[index]" flex flex-col>
    <div class="flex flex-wrap bg-$cm-background">
      <TitleBar
        title="HTML" w-full relative
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
            <input v-model="store.options.value.transformHtml" type="checkbox">
            <span text-sm>Transform</span>
          </label>
          <div w-1px h-full bg-gray:20 />
          <button
            i-ri-mist-line icon-btn
            title="Format"
            @click="formatHTML()"
          />
        </div>
      </TitleBar>
    </div>
    <UnoMonaco
      v-if="editorType === 'monaco'"
      v-model="computedInputHTML"
      :theme="theme"
      language="html"
      :marked-ranges="markedRanges"
      :register-providers="false"
      flex-auto
      class="border-l border-main"
      :read-only="store.options.value.transformHtml"
    />
    <UnoCodeMirror
      v-else
      v-model="computedInputHTML"
      :theme="theme"
      language="html"
      flex-auto
      class="border-l border-main"
      :read-only="store.options.value.transformHtml"
    />
  </Pane>
</template>
