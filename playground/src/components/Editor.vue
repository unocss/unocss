<script setup lang="ts">
import { Splitpanes } from 'splitpanes'

const loading = ref(true)

function handleResize({ panes }: { panes: { size: number }[] }) {
  panelSizes.value = panes.map(panel => panel.size)
}

onMounted(() => {
  // prevent init transition
  setTimeout(() => {
    loading.value = false
  }, 200)
})

const _panelEl = ref(panelEl)
</script>

<template>
  <div flex="~ col" h-full>
    <HeaderBar />
    <div flex-1 of-hidden>
      <Splitpanes ref="_panelEl" :class="{ loading }" horizontal @resized="handleResize">
        <PanelHtml :index="0" />
        <PanelConfig :index="1" />
        <PanelCustomCss :index="2" />
        <PanelOutputCss :index="3" />
      </Splitpanes>
    </div>
  </div>
</template>
