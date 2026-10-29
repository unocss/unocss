<script lang='ts' setup>
import type { SerializedUnoCSSSettings } from '../../types'
import { ref, watch } from 'vue'
import { changeRevision } from '../../client-rpc'
import { useUnoCSS } from '../../composables/unocss'
import PanelTitle from '../sections/PanelTitle.vue'
import SettingsLayers from './settings/SettingsLayers.vue'
import SettingsLists from './settings/SettingsLists.vue'
import SettingsOverview from './settings/SettingsOverview.vue'
import SettingsRules from './settings/SettingsRules.vue'
import SettingsShortcuts from './settings/SettingsShortcuts.vue'
import SettingsTheme from './settings/SettingsTheme.vue'
import SettingsVariants from './settings/SettingsVariants.vue'

const { getSettings } = useUnoCSS()
const settings = ref<SerializedUnoCSSSettings>()
const loading = ref(false)
const error = ref<string>()

watch(changeRevision, async () => {
  loading.value = true
  error.value = undefined

  try {
    settings.value = await getSettings()
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  }
  finally {
    loading.value = false
  }
}, { immediate: true })
</script>

<template>
  <div class="p-3 no-scrollbar h-full overflow-auto">
    <PanelTitle icon="i-hugeicons:dashboard-circle-settings" title="Settings" />

    <div v-if="loading" class="mt-4 text-xs opacity-60">
      Loading UnoCSS settings...
    </div>

    <div v-else-if="error" class="mt-4 rounded border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
      {{ error }}
    </div>

    <div v-else-if="settings" class="space-y-4 pb-4">
      <SettingsOverview :uno="settings" />
      <SettingsTheme :uno="settings" />
      <SettingsRules :uno="settings" />
      <SettingsShortcuts :uno="settings" />
      <SettingsVariants :uno="settings" />
      <SettingsLists :uno="settings" />
      <SettingsLayers :uno="settings" />
    </div>

    <div v-else class="mt-4 text-xs opacity-60">
      UnoCSS settings are unavailable.
    </div>
  </div>
</template>
