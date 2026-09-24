<script setup lang="ts">
import type { InlineClampSplit } from 'vue-clamp'
import { InlineClamp } from 'vue-clamp'

defineProps<{
  text: string
  split?: InlineClampSplit
}>()

const fileExtensions = ['.ts', '.js', '.vue', '.svelte', '.jsx', '.tsx', '.mjs', '.cjs']
function splitFileText(text: string) {
  const extension = fileExtensions.find(candidate => text.toLowerCase().endsWith(candidate))

  return extension
    ? {
        body: text.slice(0, -extension.length),
        end: text.slice(-extension.length),
      }
    : { body: text }
}
</script>

<template>
  <InlineClamp
    :text="text"
    :split="split || splitFileText"
    :location="0.85"
    boundary="grapheme"
  />
</template>
