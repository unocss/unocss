<script lang="ts">
  export let onclick: () => any;
</script>

<button
  class="font-semibold {$$props.class}"
  on:click={onclick}
  type="button"
>
  <span class="i-logos:svelte-icon" />
  <slot /></button
>

<style>
  button {
    --at-apply: bg-red-100 hover:bg-red-200 p-3 rounded dark:bg-red-700 dark:hover:bg-red-600;
  }
</style>
