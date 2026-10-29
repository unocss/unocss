<script setup lang="ts">
import type { SerializedUnoCSSSettings } from '../../../types'
import SettingsSection from './SettingsSection.vue'

defineProps<{
  uno: SerializedUnoCSSSettings
}>()
</script>

<template>
  <SettingsSection title="Context" :count="uno.context.sources.length">
    <div class="flex flex-col gap-3 font-mono">
      <div v-if="uno.context.root" class="flex flex-col gap-1">
        <span class="text-xs opacity-50 uppercase">Root</span>
        <span class="break-all opacity-75">{{ uno.context.root }}</span>
      </div>

      <div v-if="uno.context.configFile" class="flex flex-col gap-1">
        <span class="text-xs opacity-50 uppercase">Config File</span>
        <span class="break-all opacity-75">{{ uno.context.configFile }}</span>
      </div>

      <div v-if="uno.context.sources.length" class="flex flex-col gap-1">
        <span class="text-xs opacity-50 uppercase">Sources</span>
        <span v-for="source in uno.context.sources" :key="source" class="break-all opacity-75">
          {{ source }}
        </span>
      </div>
    </div>
  </SettingsSection>
</template>
