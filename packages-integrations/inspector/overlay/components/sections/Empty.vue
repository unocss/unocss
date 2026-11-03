<script lang='ts' setup>
defineProps<{
  title?: string
  description?: string
  icon?: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-8 text-center">
    <div class="text-5xl mb-4 text-orange-400/60" :class="icon ?? 'i-hugeicons:cheese-cake-01'" />

    <h3 class="text-sm font-medium mb-1 text-white/72">
      {{ title || 'Empty' }}
    </h3>

    <p class="text-sm text-white/32 max-w-xs leading-relaxed m0">
      {{ description || 'No data to display at the moment.' }}
    </p>
  </div>
</template>
