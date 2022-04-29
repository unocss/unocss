<script setup lang="ts">
import { isDark } from '#imports'

function toggleDark() {
  isDark.value = !isDark.value
}
</script>

<template>
  <button
    class="!outline-none"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggleDark"
  >
    <span class="dark:i-carbon-moon i-carbon-sun block" aria-hidden="true" />
  </button>
</template>
