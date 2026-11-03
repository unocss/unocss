<script setup lang="ts">
import type { SerializedUnoCSSSettings } from '../../../types'
import { useInspectorSearch } from '../../../composables/search'
import SettingsSection from './SettingsSection.vue'

defineProps<{
  uno: SerializedUnoCSSSettings
}>()

const { searchUtility } = useInspectorSearch()
</script>

<template>
  <SettingsSection title="Rules" :count="(uno.config.rulesStatic?.length || 0) + (uno.config.rulesDynamic?.length || 0)" default-collapsed>
    <div class="flex flex-col gap-4">
      <div v-if="uno.config.rulesStatic?.length" class="flex flex-col gap-1 font-mono">
        <div class="text-xs opacity-50 mb-1">
          Static Rules
        </div>
        <button
          v-for="(rule, idx) in uno.config.rulesStatic"
          :key="idx"
          type="button"
          class="min-w-0 border-none bg-transparent p-0 text-left font-mono text-xs text-white/75 truncate underline-transparent transition hover:text-green-300 hover:opacity-100 hover:underline hover:decoration-green-300/70"
          :title="rule"
          @click="searchUtility(rule)"
        >
          {{ rule }}
        </button>
      </div>

      <div v-if="uno.config.rulesDynamic?.length" class="flex flex-col gap-1 font-mono">
        <div class="text-xs opacity-50 mb-1">
          Dynamic Rules
        </div>
        <div v-for="(rule, idx) in uno.config.rulesDynamic" :key="idx" class="truncate opacity-75 hover:opacity-100" :title="rule">
          {{ rule }}
        </div>
      </div>
    </div>
  </SettingsSection>
</template>
