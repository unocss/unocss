<script>
  import SvelteLogo from "$lib/SvelteLogo.svelte";
  import Button from "$lib/Button.svelte";
  let bounce = true;
</script>

<div class="p-3">
  <h1 class="text-4xl my-5">
    <SvelteLogo
      class="{bounce
        ? 'animate-bounce-alt'
        : ''} animate-count-infinite animate-duration-1s"
    /> SvelteKit + svelte-preprocess-unocss Component Library example
  </h1>

  <Button onclick={() => (bounce = !bounce)}>{bounce ? 'Stop' : 'Start'} Bouncing</Button>

  <p class="my-2">
    Visit <a class="underline" href="https://kit.svelte.dev">kit.svelte.dev</a> to
    read the `svelte-package` documentation
  </p>
</div>
