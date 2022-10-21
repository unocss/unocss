<script lang="ts">
 export let onclick: () => any;
</script>

<button on:click={onclick} type="button"><slot /></button>

<style>
  button {
    --at-apply: font-semibold bg-red-100 hover:bg-red-200 dark:bg-red-700 dark:hover:bg-red-600 p-3 rounded;
  }
</style>