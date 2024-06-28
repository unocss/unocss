<script setup lang="ts">
import RainbowAnimationSwitcher from './RainbowAnimationSwitcher.vue'
</script>

<template>
  <div class="NavBarRainbowAnimation">
    <RainbowAnimationSwitcher />
  </div>
</template>

<style scoped>
.NavBarRainbowAnimation {
  display: none;
}

@media (min-width: 1280px) {
  .NavBarRainbowAnimation {
    display: flex;
    align-items: center;
  }
}
</style>
