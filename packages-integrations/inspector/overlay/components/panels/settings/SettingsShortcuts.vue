<script setup lang="ts">
import type { SerializedUnoCSSSettings } from '../../../types'
import SettingsSection from './SettingsSection.vue'

defineProps<{
  uno: SerializedUnoCSSSettings
}>()

function interactiveHref(token: string) {
  return `https://unocss.dev/interactive/?s=${encodeURIComponent(token)}`
}

function isInteractiveToken(token: string) {
  return Boolean(token && !token.startsWith('/') && !token.startsWith('[Function'))
}

function bodyTokens(body: string) {
  return body.split(/\s+/).filter(Boolean)
}
</script>

<template>
  <SettingsSection title="Shortcuts" :count="uno.config.shortcuts?.length" default-collapsed>
    <div class="flex flex-col gap-2">
      <div v-for="(shortcut, idx) in uno.config.shortcuts" :key="idx" class="font-mono text-xs">
        <div class="flex items-center gap-2 flex-wrap">
          <a
            v-if="isInteractiveToken(shortcut.matcher)"
            :href="interactiveHref(shortcut.matcher)"
            target="_blank"
            rel="noreferrer"
            class="text-green-400 whitespace-nowrap underline-transparent transition hover:text-green-300 hover:underline hover:decoration-green-300/70"
          >
            {{ shortcut.matcher }}
          </a>
          <span v-else class="text-green-400 whitespace-nowrap">{{ shortcut.matcher }}</span>
          <span class="opacity-50">-></span>
          <span v-if="shortcut.body" class="flex min-w-0 flex-wrap gap-x-2 gap-y-1 opacity-75">
            <template v-for="(token, tokenIdx) in bodyTokens(shortcut.body)" :key="`${idx}-${tokenIdx}-${token}`">
              <a
                v-if="isInteractiveToken(token)"
                :href="interactiveHref(token)"
                target="_blank"
                rel="noreferrer"
                class="break-all underline-transparent transition hover:text-green-300 hover:opacity-100 hover:underline hover:decoration-green-300/70"
              >
                {{ token }}
              </a>
              <span v-else class="break-all">{{ token }}</span>
            </template>
          </span>
          <span v-else class="opacity-75">-</span>
        </div>
      </div>
    </div>
  </SettingsSection>
</template>
