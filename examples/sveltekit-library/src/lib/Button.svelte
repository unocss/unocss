<script lang="ts">
 export let onclick: () => any;
</script>

<button on:click={onclick} type="button" class="hover:bg-red-400"><slot /></button>

<style>
  button {
    --at-apply: bg-red-300 "hover:bg-red-400" p-2 rounded font-semibold;
  }
</style>