<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import Counter from "./Counter.svelte";
  let logo = false;
  let red = false;
  function toggleLogo() {
    logo = !logo;
  }
  function toggleSpan() {
    red = !red;
  }
  $: button = logo ? "Hide logo" : "Show logo";
  $: span = red ? "Normal" : "Red";
</script>

<main class="text-center p-1em my-0 mx-auto">
  <span class="logo" />

  {#if logo}
    <span class:logo in:fly={{ y: 200, duration: 2000 }} out:fade />
  {/if}

  <h1
    class="animate-bounce color-#ff3e00 uppercase font-size-4rem fw-100 line-height-1.1 my-2rem mx-auto max-width-14rem sm:max-width-auto"
  >
    SvelteKit!
  </h1>

  <br />

  <div class:bg-red-400={red}>My BG Color should change</div>

  <br />

  <button class="bg-red-100" on:click={toggleLogo}>{button}</button>
  <button on:click={toggleSpan}>Change BG Color: {span}</button>

  <br />
  <br />

  <Counter />

  <div class="absolute mt-20px bottom-0">absolute</div>
</main>

<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }
</style>
