<script setup lang="ts">
import SettingsSection from './SettingsSection.vue'

defineProps<{
  uno: any
}>()
</script>

<template>
  <SettingsSection title="Presets" :count="uno.config.presets?.length">
    <div class="flex flex-col gap-2">
      <div v-for="(preset, idx) in uno.config.presets" :key="idx" class="flex items-center gap-2">
        <div class="i-hugeicons:package opacity-50" />
        <span class="font-mono">{{ preset.name || 'Unnamed Preset' }}</span>
      </div>
    </div>
  </SettingsSection>
</template>
