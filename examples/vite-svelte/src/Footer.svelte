<script lang="ts">
  let showYellow = false;
</script>

<footer>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class="cursor-pointer myyellow"
    class:special-green-shortcut={showYellow}
    on:click={() => (showYellow = !showYellow)}
  >
    Yellow overridden by green shortcut if you click (later alphabetical shortcuts override earlier alphabetical shortcuts)
  </div>
  <div class="special-green-shortcut">
    Background set by green shortcut class
  </div>
</footer>
