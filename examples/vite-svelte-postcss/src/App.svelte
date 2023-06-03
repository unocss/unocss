<div text-center font-sans p4 flex flex-col items-center gap-8>
  <div class="flex gap-4">
    <div class="i-logos-unocss text-3xl" />
    <div class="i-logos-svelte-icon text-3xl" />
    <div class="i-logos-postcss text-3xl" />
  </div>
  <div text-gray2 text-2xl font-medium>
    UnoCSS + Svelte + PostCSS
  </div>
  <div class="bg-[url(../src/uno.svg)] bg-[url(/uno.svg)]" h-220px w-220px />
  <div class="flex gap-2 items-center">
    <button>
      Hello
    </button>
    <div class="dark">
      <a href="#">Hello</a>
    </div>
  </div>
  <div class="my-class">
    Directives in Svelte SFC
  </div>
</div>

<style lang="postcss">
.my-class {
  @apply bg-red-800 p-2 rounded;
  color: theme('colors.red.200');
}
</style>
