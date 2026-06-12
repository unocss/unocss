<script setup lang="ts">
import type { ReplStore } from '@unocss/repl'
import { Repl, useStore } from '@unocss/repl'
import reset from '@unocss/reset/tailwind.css?raw'
import { evaluateUserConfig } from '#docs'
import { bundlePackages } from '#docs/packages'
import { unocssBundle } from '#docs/unocss-bundle'
import { isDark, toggleDark } from './composables/dark'
import { setupMonaco } from './composables/monaco'
import { initialConfigRaw, initialCSS, initialHTML, initialOptions, selectedVersion, setupUrlSync } from './composables/url'

// Resolve bundle based on selected UnoCSS version
const bundle = (selectedVersion.value === 'latest' || !selectedVersion.value)
  ? unocssBundle
  : new Map(
      bundlePackages.map(p => [p, () => import(/* @vite-ignore */ `https://esm.sh/${p}@${selectedVersion.value}`)]),
    )

// Create store with initial values from URL
const store = useStore({
  defaultHTML: initialHTML,
  defaultConfigRaw: initialConfigRaw,
  defaultCSS: initialCSS,
  defaultOptions: { ...initialOptions },
  customCSSLayerName: 'playground',
  moduleMap: bundle,
  evaluateConfig: (configStr: string) => evaluateUserConfig(configStr, bundle),
  resetCSS: reset,
})

// Setup Monaco workers + UnoCSS providers
setupMonaco(store)

// Wire URL serialization to store refs
setupUrlSync(store)
</script>

<template>
  <div class=":uno: font-sans leading-1em">
    <Repl
      :store="store"
      :theme="isDark ? 'dark' : 'light'"
      preview-src="/play/__play.html"
    >
      <template #header>
        <PlaygroundHeader
          :store="store"
          @toggle-dark="toggleDark"
        />
      </template>
    </Repl>
  </div>
</template>
