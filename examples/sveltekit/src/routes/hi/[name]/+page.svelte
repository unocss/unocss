<script lang="ts">
  import { page } from "$app/stores";

  $: name = decodeURIComponent($page.params.name || "");
</script>

<div><strong>/hi</strong> route</div>

<p>
  Hi: {name}
</p>
<br />
<a href="/" class="text-blue-600">Go Home</a>
