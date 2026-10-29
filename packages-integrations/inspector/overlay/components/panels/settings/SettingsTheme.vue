<script setup lang="ts">
import SettingsSection from './SettingsSection.vue'

defineProps<{
  uno: any
}>()
</script>

<template>
  <SettingsSection title="Theme" default-collapsed>
    <pre class="font-mono text-xs opacity-75 overflow-auto max-h-60">{{ JSON.stringify(uno.config.theme, null, 2) }}</pre>
  </SettingsSection>
</template>
