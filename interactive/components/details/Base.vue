<script setup lang="ts">
defineProps<{
  title: string
}>()

const { copy, copied } = useClipboard()
</script>

<template>
  <div>
    <h2 text-3xl font-light>
      {{ title }}
      <button :class="copied ? 'i-carbon-checkmark-outline' : 'i-carbon-copy'" w-4 h-4 op50 hover:op100 cursor-pointer title="Copy" @click="copy(title)" />
    </h2>
    <slot />
  </div>
</template>
