<script lang="ts">
  import Button from "./lib/Button.svelte";
  import Counter from "./lib/Counter.svelte";
  import Logos from "./lib/Logos.svelte";
  import Prose from "./lib/Prose.svelte";
  import RightToLeftDependent from "./lib/RightToLeftDependent.svelte";
  import DarkModeToggle from "./lib/DarkModeToggle.svelte";

  let red = false;
  let rtl = true;
</script>

<div
  class="bg-white text-gray-900 dark:bg-gray-900 dark:text-white px-3 py-15 min-h-100vh transition"
>
  <main class="max-w-800px mx-auto text-center">
    <div class="p-1em my-2px mx-auto">
      <h1
        class="animate-bounce color-#ff3e00 dark:color-white uppercase text-5xl fw-100 my-2rem mx-auto"
      >
        UnoCSS + Svelte Scoped!
      </h1>

      <Logos />

      <Prose />

      <div class="my-15">
        <div
          class:bg-red-400={red}
          class:bg-gray={!red}
          class="text-white p-3 rounded mb-3"
        >
          My BG Color should change
        </div>
        <Button onclick={() => (red = !red)}
          >Change BG Color: {red ? "Gray" : "Red"}</Button
        >
      </div>

      <div
        class="bg-gray-500 bg-opacity-15 shadow-lg p-2 mb-3"
        dir={rtl ? "rtl" : "ltr"}
      >
        <RightToLeftDependent />
      </div>
      <div class="mb-10">
        <Button onclick={() => (rtl = !rtl)}
          >Toggle direction: {rtl ? "Right-to-left" : "Left-to-right"}</Button
        >
      </div>

      <Counter />

      <div class="corner">Fixed</div>
    </div>
  </main>
  <DarkModeToggle />
</div>

<style>
  .corner {
    --at-apply: fixed flex left-2 bottom-2 md:left-6 md:bottom-6 bg-gray-200 dark:bg-black p-1;
  }
</style>
