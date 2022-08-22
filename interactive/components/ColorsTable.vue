<script setup lang="ts">
import { uno } from '~/composables/state'

const colors = (uno.config.theme as any).colors || {}
</script>

<template>
  <div ma>
    <p>
      The default color palette of <code>@unocss/preset-mini</code> is extended from
      <a href="https://tailwindcss.com/docs/customizing-colors" target="_blank">Tailwind's</a>.
      The following table is dynamically generated from the theme of the current configuration.
    </p>
    <div justify-center ma>
      <ColorsItem :item="colors" />
    </div>
  </div>
</template>
