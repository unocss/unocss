<script lang="ts">
 export let onclick: () => any;
</script>

<button on:click={onclick} type="button" class="bg-red-300 p-2 rounded font-semibold"><slot /></button>
