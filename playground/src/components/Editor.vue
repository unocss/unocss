<script setup lang="ts">
// @ts-expect-error missing types
import { Splitpanes } from 'splitpanes'

const loading = ref(true)

function handleResize(event: ({ size: number })[]) {
  panelSizes.value = event.map(({ size }) => size)
}

onMounted(() => {
  // prevent init transition
  setTimeout(() => {
    loading.value = false
  }, 200)
})
</script>

<template>
  <Splitpanes ref="panelEl" :class="{ loading }" horizontal @resize="handleResize">
    <PanelHtml />
    <PanelConfig />
    <PanelOutputCss />
  </Splitpanes>
</template>
