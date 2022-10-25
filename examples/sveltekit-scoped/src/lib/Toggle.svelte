<script>
  let show = false;
</script>

<slot {show} toggle={() => (show = !show)} />
