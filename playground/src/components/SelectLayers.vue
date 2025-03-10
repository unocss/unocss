<script setup lang="ts">
import { selectedLayers } from '../composables/prettier'

const outputLayers = computed(() => output.value?.layers || [])

function onChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.checked) {
    selectedLayers.value.push(target.value)
  }
  else {
    selectedLayers.value = selectedLayers.value.filter(layer => layer !== target.value)
  }
}
</script>

<template>
  <label v-for="layer in outputLayers" :key="layer">
    <input :checked="selectedLayers.includes(layer)" type="checkbox" :value="layer" @change="onChange">
    <span text-sm>{{ layer }}</span>
  </label>
</template>
