<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import Counter from "./Counter.svelte";
  import Prose from "./Prose.svelte";
  import RightToLeftDependent from "./RightToLeftDependent.svelte";

  let logo = false;
  let red = false;
  let rtl = true;
</script>

<main class="p-1em my-2px mx-auto">
  <div class="text-center mb-6">
    <span class="logo" />

    {#if logo}
      <span class:logo in:fly={{ y: 200, duration: 2000 }} out:fade />
    {/if}

    <h1
      class="animate-bounce color-#ff3e00 uppercase text-5xl fw-100 my-2rem mx-auto"
    >
      SvelteKit!
    </h1>

    <button class="bg-red-100 hover:bg-red-200 p-3 rounded border mb-4" on:click={() => (logo = !logo)}
      >{logo ? "Hide 2nd logo" : "Show 2nd logo"}</button
    >

    <div class:bg-red-400={red}>My BG Color should change</div>
    <button class="p-3 rounded border bg-gray-100 hover:bg-gray-200" on:click={() => (red = !red)}
      >Change BG Color: {red ? "Normal" : "Red"}</button
    >
  </div>

  <div class="border border-gray-400 p-1 mb-1" dir={rtl ? "rtl" : "ltr"}>
    <RightToLeftDependent />
  </div>
  <button class="p-3 rounded border bg-gray-100 hover:bg-gray-200" on:click={() => (rtl = !rtl)}
    >Toggle direction: {rtl ? "Right-to-left" : "Left-to-right"}</button
  >

  <br />
  <br />

  <Counter />

  <Prose />

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
