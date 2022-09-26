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
      <button
        :class="copied ? 'i-carbon-checkmark-outline text-green op100' : 'i-carbon-copy op50'"
        w-4 h-4 hover:op100 cursor-pointer ma
        title="Copy"
        @click="copy(title)"
      />
    </h2>
    <slot />
  </div>
</template>
