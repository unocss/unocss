<script lang="ts">
  let count = 0;
  function increment() {
    count += 1;
  }
</script>

<button
  class="w-250px border focus:border-orange-800 bg-orange-{400 -
    100} hover:bg-orange-400"
  on:click={increment}
>
  Clicks: {count}
</button>

<style>
  button {
    font-family: inherit;
    font-size: inherit;
    padding: 1em 2em;
    border-radius: 2em;
    border: 2px solid rgba(255, 62, 0, 0);
    outline: none;
    font-variant-numeric: tabular-nums;
    cursor: pointer;
  }
</style>
