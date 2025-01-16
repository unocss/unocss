<script lang="ts" setup>
import { useLocalStorage, useMediaQuery } from '@vueuse/core'
import { inBrowser } from 'vitepress'
import { computed, watch } from 'vue'

defineProps<{ text?: string, screenMenu?: boolean }>()

const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)').value

const animated = useLocalStorage('animate-rainbow', inBrowser ? !reduceMotion : true)

function toggleRainbow() {
  animated.value = !animated.value
}

watch(animated, (anim) => {
  document.documentElement.classList.remove('rainbow')
  if (anim) {
    document.documentElement.classList.add('rainbow')
  }
}, { immediate: inBrowser, flush: 'post' })

const switchTitle = computed(() => {
  return animated.value
    ? 'Disable rainbow animation'
    : 'Enable rainbow animation'
})
</script>

<template>
  <ClientOnly>
    <div class="group" :class="{ mobile: screenMenu }">
      <div class="NavScreenRainbowAnimation">
        <p class="text">
          {{ text ?? 'Rainbow Animation' }}
        </p>
        <RainbowSwitcher
          :title="switchTitle"
          class="RainbowAnimationSwitcher"
          :aria-checked="animated ? 'true' : 'false'"
          @click="toggleRainbow"
        >
          <span class="i-tabler:rainbow animated" />
          <span class="i-tabler:rainbow-off non-animated" />
        </RainbowSwitcher>
      </div>
    </div>
  </ClientOnly>
</template>

<style scoped>
.group {
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 10px;
  margin-top: 1rem !important;
}

.group.mobile {
  border: none !important;
  margin-top: 24px;
}

.group.mobile .NavScreenRainbowAnimation {
  background-color: var(--vp-c-bg-soft);
}

.group.mobile .NavScreenRainbowAnimation::before {
  margin-top: 16px;
  background-color: var(--vp-c-bg);
}

@media (min-width: 960px) {
  .group:not(.mobile) {
    margin-top: 10px !important;
    margin-bottom: -10px;
    padding-top: 0;
    width: 220px;
  }
}

.NavScreenRainbowAnimation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px;
  padding: 12px 12px 12px 12px;
  background-color: var(--vp-c-bg-elv);
  max-width: 220px;
}
.group.mobile .NavScreenRainbowAnimation {
  max-width: unset;
}

.text {
  line-height: 24px;
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.animated {
  opacity: 1;
}

.non-animated {
  opacity: 0;
}

.RainbowAnimationSwitcher[aria-checked='false'] .non-animated {
  opacity: 1;
}

.RainbowAnimationSwitcher[aria-checked='true'] .animated {
  opacity: 1;
}

.RainbowAnimationSwitcher[aria-checked='false'] :deep(.check) {
  /*rtl:ignore*/
  transform: translateX(18px);
}
</style>
