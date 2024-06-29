<script lang="ts" setup>
import { computed, watch } from 'vue'
import { useLocalStorage, useMediaQuery } from '@vueuse/core'
import UnoCSSSwitcher from './UnoCSSSwitcher.vue'

const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)').value

const animated = useLocalStorage('animate-rainbow', !reduceMotion)

function toggleRainbow() {
  animated.value = !animated.value
}

watch(animated, (a) => {
  document.documentElement.classList.toggle('rainbow', a)
})

const switchTitle = computed(() => {
  return animated.value
    ? 'Disable rainbow animation'
    : 'Enable rainbow animation'
})
</script>

<template>
  <UnoCSSSwitcher
    :title="switchTitle"
    class="RainbowAnimationSwitcher"
    :aria-checked="animated"
    @click="toggleRainbow"
  >
    <span class="i-tabler:rainbow animated" />
    <span class="i-tabler:rainbow-off non-animated" />
  </UnoCSSSwitcher>
</template>

<style scoped>
.animated {
  opacity: 1;
}

.non-animated {
  opacity: 0;
}

.RainbowAnimationSwitcher[aria-checked="false"] .non-animated {
  opacity: 1;
}

.RainbowAnimationSwitcher[aria-checked="true"] .animated {
  opacity: 1;
}

.RainbowAnimationSwitcher[aria-checked="false"] :deep(.check) {
  /*rtl:ignore*/
  transform: translateX(18px);
}
</style>
