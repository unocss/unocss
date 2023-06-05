<script lang="ts">
  let count = 0;
  function increment() {
    count += 1;
  }
  
  const orange = (n: number) => `bg-orange-${n}`;
</script>

<button
  class="w-250px focus:border-orange-800 {orange(300)} hover:bg-orange-400 color-orange-900 font-semibold rounded-xl p-4"
  on:click={increment}
>
  Clicks: {count}<br />
  <span class="text-sm"
    >orange background dynamically calculated so bg-orange-300 is in the
    safelist</span
  >
</button>
