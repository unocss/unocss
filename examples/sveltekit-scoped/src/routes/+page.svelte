<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import Counter from "./Counter.svelte";
  import RightToLeftDependent from "./RightToLeftDependent.svelte";

  let logo = false;
  let red = false;
  let rtl = true;
</script>

<main class="text-center p-1em my-2px mx-auto">
  <span class="logo" />

  {#if logo}
    <span class:logo in:fly={{ y: 200, duration: 2000 }} out:fade />
  {/if}

  <h1
    class="animate-bounce color-#ff3e00 uppercase font-size-4rem fw-100 line-height-1.1 my-2rem mx-auto max-width-14rem sm:max-width-auto"
  >
    SvelteKit!
  </h1>

  <button class="bg-red-100" on:click={() => (logo = !logo)}
    >{logo ? "Hide 2nd logo" : "Show 2nd logo"}</button
  >

  <br />
  <br />

  <div class:bg-red-400={red}>My BG Color should change</div>
  <button on:click={() => (red = !red)}
    >Change BG Color: {red ? "Normal" : "Red"}</button
  >

  <br />
  <br />

  <div class="border border-gray-400 p-1" dir={rtl ? "rtl" : "ltr"}>
    <RightToLeftDependent />
  </div>
  <button on:click={() => (rtl = !rtl)}
    >Toggle direction: {rtl ? "Right-to-left" : "Left-to-right"}</button
  >

  <br />
  <br />

  <Counter />

  <div class="corner">absolute</div>
</main>

<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }
  
  .corner {
    --at-apply: absolute flex bottom-2 sm:bottom-6 lg:bottom-10;
  }
</style>
