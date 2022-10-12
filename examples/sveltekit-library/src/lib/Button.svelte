<script lang="ts">
 export let onclick: () => any;
</script>

<button on:click={onclick} type="button"><slot /></button>

<style>
  button {
    --at-apply: bg-red-300 hover:(bg-red-200 text-red-700) p-2 rounded font-semibold;
  }
</style>