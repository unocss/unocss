<script setup lang="ts">
import { currentTab, isCompact, toggleCompact } from '~/composables/state'

const tab = currentTab
const info = await searcher.getInfo()
</script>

<template>
  <div row text-left py4 pr1 items-center>
    <RouterLink to="/">
      <h1>
        <span op50 font-200 leading-1em block>
          UnoCSS
        </span>
        <span font-400 text-lg leading-1em block>
          Interactive
        </span>
      </h1>
    </RouterLink>
    <div text-xs op-30 ml-2 self-end leading-12px>
      v{{ info.version }}
    </div>
    <div flex-auto />
    <div row gap4 text="lg gray4" items-center>
      <template v-if="currentTab === 'search'">
        <button
          :class="isCompact ? 'i-carbon-list' : 'i-carbon-list-boxes'"
          :aria-label="isCompact ? 'Show results entries dense' : 'Show results entries normal'"
          :title="isCompact ? 'Show results entries dense' : 'Show results entries normal'"
          @click="toggleCompact()"
        />
        <button
          class="i-carbon-settings"
          title="Config"
          @click="tab = 'config'"
        />
      </template>
      <template v-else>
        <button
          class="i-carbon-close"
          title="Cancel config changes"
          @click="tab = 'search'"
        />
      </template>

      <a i-carbon-document-multiple-01 href="https://unocss.dev/" rel="noopener noreferrer" title="Documentations" target="_blank" aria-label="Documentations" />

      <a i-carbon-template href="https://unocss.dev/play/" rel="noopener noreferrer" title="Playground" target="_blank" aria-label="Playground" />

      <a i-carbon-logo-github href="https://github.com/unocss/unocss" rel="noopener noreferrer" title="GitHub" target="_blank" aria-label="GitHub" />

      <DarkToggle />
    </div>
  </div>
</template>
