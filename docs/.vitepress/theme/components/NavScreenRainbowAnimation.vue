<script lang="ts" setup>
import RainbowAnimationSwitcher from './RainbowAnimationSwitcher.vue'
</script>

<template>
  <div class="NavScreenRainbowAnimtation">
    <p class="text">
      Rainbow animation
    </p>
    <RainbowAnimationSwitcher />
  </div>
</template>

<style scoped>
.NavScreenRainbowAnimtation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px;
  padding: 12px 14px 12px 16px;
  background-color: var(--vp-c-bg-soft);
}

.text {
  line-height: 24px;
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}
</style>
