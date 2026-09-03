<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ id: string }>()

// ext/path → catppuccin icon, first match wins (so `.d.ts` beats `.ts`).
// The `icon-catppuccin` class keeps the dark-tuned glyphs legible on a light
// surface and cancels back to native color under `.dark`.
// Modeled on @antfu/design's DisplayFileIcon.
const rules: { match: RegExp, icon: string }[] = [
  { match: /\.vue$/, icon: 'i-catppuccin-vue' },
  { match: /\.svelte$/, icon: 'i-catppuccin-svelte' },
  { match: /\.astro$/, icon: 'i-catppuccin-astro' },
  { match: /\.tsx$/, icon: 'i-catppuccin-typescript-react' },
  { match: /\.jsx$/, icon: 'i-catppuccin-javascript-react' },
  { match: /\.d\.[cm]?ts$/, icon: 'i-catppuccin-typescript-def' },
  { match: /\.[cm]?ts$/, icon: 'i-catppuccin-typescript' },
  { match: /\.[cm]?js$/, icon: 'i-catppuccin-javascript' },
  { match: /package\.json$/, icon: 'i-catppuccin-npm' },
  { match: /\.json5?$/, icon: 'i-catppuccin-json' },
  { match: /\.ya?ml$/, icon: 'i-catppuccin-yaml' },
  { match: /\.toml$/, icon: 'i-catppuccin-toml' },
  { match: /\.(?:md|markdown)$/, icon: 'i-catppuccin-markdown' },
  { match: /\.mdx$/, icon: 'i-catppuccin-markdown-mdx' },
  { match: /\.html?$/, icon: 'i-catppuccin-html' },
  { match: /\.(?:css|postcss)$/, icon: 'i-catppuccin-css' },
  { match: /\.s[ac]ss$/, icon: 'i-catppuccin-sass' },
  { match: /\.less$/, icon: 'i-catppuccin-less' },
  { match: /\.svg$/, icon: 'i-catppuccin-svg' },
  { match: /\.(?:png|jpe?g|gif|webp|avif|ico)$/, icon: 'i-catppuccin-image' },
  { match: /\.(?:woff2?|ttf|otf|eot)$/, icon: 'i-catppuccin-font' },
  { match: /\.wasm$/, icon: 'i-catppuccin-web-assembly' },
  { match: /\.pug$/, icon: 'i-catppuccin-pug' },
]

const icon = computed(() => {
  const clean = props.id.toLowerCase().replace(/[?#].*$/, '')
  return rules.find(r => r.match.test(clean))?.icon ?? 'i-catppuccin-file'
})
</script>

<template>
  <span class="icon-catppuccin" :class="icon" aria-hidden="true" />
</template>
