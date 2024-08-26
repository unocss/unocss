<script setup lang="ts">
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { nextTick, provide } from 'vue'
import HomePage from './components/HomePage.vue'

const { isDark } = useData()

function enableTransitions() {
  return 'startViewTransition' in document
    && window.matchMedia('(prefers-reduced-motion: no-preference)').matches
}

provide('toggle-appearance', async ({ clientX: x, clientY: y }: MouseEvent) => {
  if (!enableTransitions()) {
    isDark.value = !isDark.value
    return
  }

  const clipPath = [
    `circle(0px at ${x}px ${y}px)`,
    `circle(${Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
    )}px at ${x}px ${y}px)`,
  ]

  await document.startViewTransition(async () => {
    isDark.value = !isDark.value
    await nextTick()
  }).ready

  document.documentElement.animate(
    { clipPath: isDark.value ? clipPath.reverse() : clipPath },
    {
      duration: 300,
      easing: 'ease-in',
      pseudoElement: `::view-transition-${isDark.value ? 'old' : 'new'}(root)`,
    },
  )
})
</script>

<template>
  <!-- eslint-disable-next-line vue/component-name-in-template-casing -->
  <DefaultTheme.Layout>
    <template #home-features-after>
      <HomePage />
    </template>
  </DefaultTheme.Layout>
</template>
