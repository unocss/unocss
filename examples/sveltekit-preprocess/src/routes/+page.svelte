<script lang="ts">
  import Button from "$lib/Button.svelte";
</script>

<div class="p-3">
  <h1 class="text-3xl mb-3">Welcome to your library project</h1>
  <p>
    Create your package using @sveltejs/package and preview/showcase your work
    with SvelteKit
  </p>
  <p class="mb-2">
    Visit <a class="underline" href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
  </p>

  <div>
    <Button class="mb-2" onclick={() => alert("hello!")}>Hello</Button>
  </div>

  <div class="logo bg-red-100" />
</div>
