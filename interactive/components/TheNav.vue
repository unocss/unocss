<script setup lang="ts">
import { isCompact, toggleCompact, uno } from '~/composables/state'
</script>

<template>
  <div row text-left py4 pr1 items-center>
    <RouterLink to="/">
      <h1>
        <div op50 font-200 leading-1em>
          UnoCSS
        </div>
        <div font-400 text-lg leading-1em>
          Interactive
        </div>
      </h1>
    </RouterLink>
    <div text-xs op-30 ml-2 self-end leading-12px>
      v{{ uno.version }}
    </div>
    <div flex-auto />
    <div row gap4 text="lg gray4" items-center>
      <button :class="isCompact ? 'i-carbon-list': 'i-carbon-list-boxes'" @click="toggleCompact()" />
      <a i-carbon-logo-github href="https://github.com/unocss/unocss" target="_blank" />
      <DarkToggle />
    </div>
  </div>
</template>
