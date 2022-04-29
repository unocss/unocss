<script setup lang="ts">
function toggleDark() {
  isDark.value = !isDark.value
}
</script>

<template>
  <button class="!outline-none" :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'" @click="toggleDark">
    <span class="dark:i-carbon-moon i-carbon-sun block" aria-hidden="true" />
  </button>
</template>
