<script setup lang="ts">
import { Pane } from 'splitpanes'
import { inject } from 'vue'
import { UnoCodeMirror } from '../codemirror'
import { usePanelLayoutContext } from '../composables/usePanelLayout'
import { useJSPrettify } from '../composables/usePrettify'
import { UnoMonaco } from '../monaco'
import { useStoreContext } from '../store'
import TitleBar from './TitleBar.vue'

defineProps<{ index: number }>()

const store = useStoreContext()
const panel = usePanelLayoutContext()
const theme = inject<import('vue').Ref<'dark' | 'light'>>('repl-theme')!
const editorType = inject<import('vue').Ref<'monaco' | 'codemirror'>>('repl-editor-type')!

function formatConfig() {
  store.customConfigRaw.value = useJSPrettify(store.customConfigRaw).value || ''
}
</script>

<template>
  <Pane :min-size="panel.titleHeightPercent.value" :size="panel.panelSizes.value[index]" flex flex-col relative>
    <TitleBar
      title="Config"
      @title-click="panel.togglePanel(index)"
    >
      <template #before>
        <div
          class="flex-shrink-0 i-ri-arrow-right-s-line transition-transform transform"
          :class="panel.isCollapsed(index) ? '' : 'rotate-90'"
        />
      </template>
      <div
        flex flex-1 justify-end items-center w-full h-full gap2
        transition duration-400
        :class="panel.isCollapsed(index) ? 'op0' : ''"
        un-children="inline-flex items-center cursor-pointer gap1"
      >
        <div w-1px h-full bg-gray:20 />
        <button
          i-ri-mist-line icon-btn
          title="Format"
          @click="formatConfig()"
        />
      </div>
    </TitleBar>
    <UnoMonaco
      v-if="editorType === 'monaco'"
      v-model="store.customConfigRaw.value"
      :theme="theme"
      language="js"
      :register-providers="false"
      flex-auto
      border="l main"
    />
    <UnoCodeMirror
      v-else
      v-model="store.customConfigRaw.value"
      :theme="theme"
      language="js"
      flex-auto
      border="l main"
    />
    <div
      v-if="!panel.isCollapsed(index) && store.customConfigError.value"
      absolute
      left-0
      right-0
      bottom-0
      p="x-2 y-1"
      bg="red-400/20"
      text="red-400 sm"
    >
      {{ store.customConfigError.value.toString() }}
    </div>
  </Pane>
</template>
