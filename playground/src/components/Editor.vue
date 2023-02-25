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

const _panelEl = ref(panelEl)
</script>

<template>
  <div flex="~ col" h-full>
    <HeaderBar flex="[0_0_36px]" />
    <div flex-1 of-hidden>
      <Splitpanes ref="_panelEl" :class="{ loading }" horizontal @resize="handleResize">
        <PanelHtml :index="0" />
        <PanelConfig :index="1" />
        <PanelCustomCss :index="2" />
        <PanelOutputCss :index="3" />
      </Splitpanes>
    </div>
  </div>
</template>
