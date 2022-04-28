<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <div>
    <h2 text-3xl font-light>
      {{ title }}
    </h2>
    <slot />
  </div>
</template>
