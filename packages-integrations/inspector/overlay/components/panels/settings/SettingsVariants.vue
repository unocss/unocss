<script setup lang="ts">
import SettingsSection from './SettingsSection.vue'

defineProps<{
  uno: any
}>()
</script>

<template>
  <SettingsSection title="Variants" :count="uno.config.variants?.length" default-collapsed>
    <div class="flex flex-col gap-1">
      <div v-for="(variant, idx) in uno.config.variants" :key="idx" class="font-mono opacity-75">
        {{ variant.name || 'Unnamed Variant' }}
      </div>
    </div>
  </SettingsSection>
</template>
