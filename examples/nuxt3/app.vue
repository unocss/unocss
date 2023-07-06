<template>
  <main class="py-20 px-12 text-center">
    <span text="blue 5xl hover:red" cursor="default">Hello Nuxt 3</span>
    <br>
    <div i-carbon-car text-4xl inline-block />
    <br>
    <button btn>
      Button
    </button>
  </main>
</template>

<style>
/**
 * Alternatively, `preflight: true` or `preflight: "@unocss/reset/tailwind.css"` can be used on `nuxt.config.ts`
 * to achieve the same behaviour
 */
@import '@unocss/reset/tailwind.css';
</style>
