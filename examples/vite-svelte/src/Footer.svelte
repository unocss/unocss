<script lang="ts">
  const { foo = false, customclasses = "", name = "Footer" } = $props()
</script>

<footer>
  <div class="bar {customclasses}" class:foo>{name}</div>
</footer>
