<script lang="ts">
  let count = 0;
  function increment() {
    count += 1;
  }
</script>

<button
  class="w-250px focus:border-orange-800 bg-orange-{400 -
    100} hover:bg-orange-400 color-orange-900 font-semibold rounded-xl p-4"
  on:click={increment}
>
  Clicks: {count}
</button>
