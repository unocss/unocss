<script lang="ts" setup>
import RainbowAnimationSwitcher from './RainbowAnimationSwitcher.vue'

defineProps<{ home?: boolean }>()
</script>

<template>
  <div class="group" :class="{ home }">
    <div class="NavScreenRainbowAnimation">
      <p class="text">
        Rainbow animation
      </p>
      <RainbowAnimationSwitcher />
    </div>
  </div>
</template>

<style scoped>
.group {
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 10px;
}

.group.home {
  border: none !important;
  margin-top: 24px;
}

.group.home .NavScreenRainbowAnimation {
  background-color: var(--vp-c-bg-soft);
}

.group.home .NavScreenRainbowAnimation::before {
  margin-top: 16px;
  max-width: 200px;
  background-color: var(--vp-c-bg);
}

@media (min-width: 960px) {
  .group {
    padding-top: 10px;
    width: calc(var(--vp-sidebar-width) - 64px);
  }
}

.NavScreenRainbowAnimation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px;
  padding: 12px 14px 12px 16px;
  background-color: var(--vp-c-bg);
  max-width: 200px;
}

.text {
  line-height: 24px;
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}
</style>
