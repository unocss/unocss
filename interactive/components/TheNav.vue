<script setup lang="ts">
import { isCompact, toggleCompact, uno } from '~/composables/state'
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
      v{{ uno.version }}
    </div>
    <div flex-auto />
    <div row gap4 text="lg gray4" items-center>
      <button
        :class="isCompact ? 'i-carbon-list': 'i-carbon-list-boxes'"
        :aria-label="isCompact ? 'Show results entries dense' : 'Show results entries normal'"
        @click="toggleCompact()"
      />
      <a i-carbon-logo-github href="https://github.com/unocss/unocss" target="_blank" aria-label="GitHub" />
      <DarkToggle />
    </div>
  </div>
</template>
