<script setup lang="ts">
const isDark = useDark()

// @ts-expect-error: Transition API
const isAppearanceTransition = document.startViewTransition
  && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
/**
 * Credit to [@hooray](https://github.com/hooray)
 * @see https://github.com/vuejs/vitepress/pull/2347
 */
function toggleDark(event?: MouseEvent) {
  if (!isAppearanceTransition || !event) {
    isDark.value = !isDark.value
    return
  }
  const x = event.clientX
  const y = event.clientY
  const endRadius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y),
  )
  // @ts-expect-error: Transition API
  const transition = document.startViewTransition(async () => {
    isDark.value = !isDark.value
    await nextTick()
  })
  transition.ready.then(() => {
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`,
    ]
    document.documentElement.animate(
      {
        clipPath: isDark.value
          ? [...clipPath].reverse()
          : clipPath,
      },
      {
        duration: 400,
        easing: 'ease-in',
        pseudoElement: isDark.value
          ? '::view-transition-old(root)'
          : '::view-transition-new(root)',
      },
    )
  })
}
</script>

<template>
  <nav
    p="x4 y3"
    border="b main"
    flex
    children:my-auto
  >
    <div flex flex-auto children:my-auto ws-nowrap>
      <img
        src="/favicon.svg"
        filter
        dark:invert
        inline-block
        h="1.3em"
        m="r-1.5"
      >
      <div of-hidden>
        Inspector
        <sup text-teal5 bg-teal5:10 p="x1.5 y0.5" rounded italic>beta</sup>
      </div>
    </div>
    <button text-lg i-carbon-sun dark:i-carbon-moon @click="toggleDark" />
  </nav>
</template>
