<script setup lang="ts">
import SettingsSection from './SettingsSection.vue'

defineProps<{
  uno: any
}>()
</script>

<template>
  <SettingsSection title="Layers" default-collapsed>
    <div class="flex flex-col gap-1">
      <div v-for="(val, key) in uno.config.layers" :key="key" class="flex justify-between font-mono">
        <span class="text-blue-400">{{ key }}</span>
        <span class="opacity-50">{{ val }}</span>
      </div>
    </div>
  </SettingsSection>
</template>
