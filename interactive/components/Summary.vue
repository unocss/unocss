<script setup lang="ts">
import { searcher } from '~/composables/state'

const isDefault = $computed(() => (userConfigRaw.value || defaultConfigRaw) === defaultConfigRaw)
</script>

<template>
  <div h-full items-center justify-center gap6>
    <div grid="~ cols-[max-content_1fr]" w-auto text-left gap2 op80>
      <div font-bold text-right>
        {{ searcher.uno.config.presets.length }}
      </div>
      <div op50>
        Presets
      </div>
      <div font-bold text-right>
        {{ searcher.uno.config.rulesSize }}
      </div>
      <div op50>
        Rules
      </div>
      <div font-bold text-right>
        {{ searcher.uno.config.shortcuts.length }}
      </div>
      <div op50>
        Shortcuts
      </div>
      <div font-bold text-right>
        {{ searcher.uno.config.variants.length }}
      </div>
      <div op50>
        Variants
      </div>
      <div font-bold text-right>
        {{ searcher.getSearchCount() }}
      </div>
      <div op50>
        Search entries
      </div>
    </div>
    <div v-if="!isDefault" op30 italic>
      using custom config
    </div>
  </div>
</template>
