<script lang="ts">
  const { foo = false, customclass = "", name = "Footer" } = $props()
</script>

<footer>
  <div class="bar {customclass}" class:foo>{name}</div>
</footer>
