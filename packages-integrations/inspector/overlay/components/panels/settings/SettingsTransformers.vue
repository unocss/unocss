<script setup lang="ts">
import SettingsSection from './SettingsSection.vue'

defineProps<{
  uno: any
}>()
</script>

<template>
  <SettingsSection title="Transformers" :count="uno.config.transformers?.length">
    <div class="flex flex-col gap-1">
      <div v-for="(t, idx) in uno.config.transformers" :key="idx" class="font-mono opacity-75">
        {{ t.name || 'Unnamed Transformer' }}
      </div>
    </div>
  </SettingsSection>
</template>
