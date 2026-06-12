<script setup lang="ts">
import { Splitpanes } from 'splitpanes'
import { onMounted, ref, watch } from 'vue'
import { usePanelLayout } from '../composables/usePanelLayout'
import PanelConfig from './PanelConfig.vue'
import PanelCustomCss from './PanelCustomCss.vue'
import PanelHtml from './PanelHtml.vue'
import PanelOutputCss from './PanelOutputCss.vue'

const panel = usePanelLayout()

const splitpanesRef = ref()
watch(splitpanesRef, (el) => {
  panel.panelEl.value = el?.$el || el
})

const loading = ref(true)

function handleResize({ panes }: { panes: { size: number }[] }) {
  panel.normalizePanels(panes.map(p => p.size))
}

onMounted(() => {
  // prevent init transition
  setTimeout(() => {
    loading.value = false
  }, 200)
})
</script>

<template>
  <div flex="~ col" h-full>
    <div flex-1 of-hidden>
      <Splitpanes ref="splitpanesRef" :class="{ loading }" horizontal @resized="handleResize">
        <PanelHtml :index="0" />
        <PanelConfig :index="1" />
        <PanelCustomCss :index="2" />
        <PanelOutputCss :index="3" />
      </Splitpanes>
    </div>
  </div>
</template>
