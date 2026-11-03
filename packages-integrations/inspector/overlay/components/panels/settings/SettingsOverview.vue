<script setup lang="ts">
import type { SerializedUnoCSSSettings } from '../../../types'
import SettingsSection from './SettingsSection.vue'

defineProps<{
  uno: SerializedUnoCSSSettings
}>()

function docsHref(kind: 'presets' | 'transformers', name: string) {
  const prefix = kind === 'presets' ? 'preset' : 'transformer'
  const fallback = kind === 'presets' ? 'uno' : 'directives'
  const slug = (name || fallback)
    .replace(/^@unocss\//, '')
    .replace(/^unocss-/, '')
    .replace(new RegExp(`^${prefix}-`), '')
    .replace(new RegExp(`^${prefix}`), '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase()

  return `https://unocss.dev/${kind}/${encodeURIComponent(slug)}`
}
</script>

<template>
  <SettingsSection title="Overview">
    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-col gap-1">
        <span class="text-xs opacity-50 uppercase tracking-wider">Version</span>
        <span class="font-mono text-sm">{{ uno.version }}</span>
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-xs opacity-50 uppercase tracking-wider">Env Mode</span>
        <span class="font-mono text-sm">{{ uno.config.envMode || '-' }}</span>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-1 gap-4">
      <div class="flex flex-col gap-2">
        <span class="text-xs opacity-50 uppercase tracking-wider">Context</span>
        <div class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 font-mono text-xs">
          <template v-if="uno.context.root">
            <span class="opacity-50">root</span>
            <span class="break-all opacity-75">{{ uno.context.root }}</span>
          </template>
          <template v-if="uno.context.configFile">
            <span class="opacity-50">config</span>
            <span class="break-all opacity-75">{{ uno.context.configFile }}</span>
          </template>
          <template v-if="uno.context.sources.length">
            <span class="opacity-50">sources</span>
            <span class="flex flex-col gap-1">
              <span v-for="source in uno.context.sources" :key="source" class="break-all opacity-75">
                {{ source }}
              </span>
            </span>
          </template>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="flex flex-col gap-2">
          <span class="text-xs opacity-50 uppercase tracking-wider">Presets</span>
          <div class="flex flex-col gap-1 font-mono text-xs">
            <a
              v-for="(preset, idx) in uno.config.presets"
              :key="idx"
              :href="docsHref('presets', preset.name)"
              target="_blank"
              rel="noreferrer"
              class="inline-flex min-w-0 items-center gap-2 opacity-75 underline-transparent transition hover:text-green-300 hover:opacity-100 hover:underline hover:decoration-green-300/70"
            >
              <span class="i-hugeicons:package shrink-0 opacity-50" />
              <span class="truncate">{{ preset.name || 'Unnamed Preset' }}</span>
            </a>
            <span v-if="!uno.config.presets?.length" class="opacity-50">-</span>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <span class="text-xs opacity-50 uppercase tracking-wider">Transformers</span>
          <div class="flex flex-col gap-1 font-mono text-xs">
            <a
              v-for="(transformer, idx) in uno.config.transformers"
              :key="idx"
              :href="docsHref('transformers', transformer.name)"
              target="_blank"
              rel="noreferrer"
              class="truncate opacity-75 underline-transparent transition hover:text-green-300 hover:opacity-100 hover:underline hover:decoration-green-300/70"
            >
              {{ transformer.name || 'Unnamed Transformer' }}
            </a>
            <span v-if="!uno.config.transformers?.length" class="opacity-50">-</span>
          </div>
        </div>
      </div>
    </div>
  </SettingsSection>
</template>
