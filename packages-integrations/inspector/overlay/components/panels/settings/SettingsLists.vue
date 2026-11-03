<script setup lang="ts">
import { useInspectorSearch } from '../../../composables/search'
import SettingsSection from './SettingsSection.vue'

defineProps<{
  uno: any
}>()

const { searchUtility } = useInspectorSearch()
</script>

<template>
  <SettingsSection v-if="uno.config.safelist?.length" title="Safelist" :count="uno.config.safelist?.length" default-collapsed>
    <div class="flex flex-wrap gap-1">
      <button
        v-for="(item, idx) in uno.config.safelist"
        :key="idx"
        type="button"
        class="max-w-full truncate border-none px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded font-mono text-xs transition hover:bg-green-500/18 hover:text-green-300 hover:underline hover:decoration-green-300/70"
        :title="item"
        @click="searchUtility(item)"
      >
        {{ item }}
      </button>
    </div>
  </SettingsSection>

  <SettingsSection v-if="uno.config.blocklist?.length" title="Blocklist" :count="uno.config.blocklist?.length" default-collapsed>
    <div class="flex flex-col gap-1 font-mono">
      <div v-for="(item, idx) in uno.config.blocklist" :key="idx" class="opacity-75">
        {{ String(item) }}
      </div>
    </div>
  </SettingsSection>
</template>
