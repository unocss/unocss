<script lang="ts">
  let foo = $state(true);
</script>

<footer>
  <div class={["bar", foo && "foo"]}>Footer</div>
  <div class={["bar", { foo: foo }]}>Footer2</div>
</footer>
