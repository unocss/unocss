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
    /> SvelteKit + svelte-preprocess-unocss
  </h1>

  <p class="mb-3">
    Use this anytime you want Svelte + UnoCSS where Vite is not involved. The primary situation being when you want to build a component library with styles processed by `svelte-package`. But other situations exist, like Routify.
  </p>

  <Button onclick={() => (bounce = !bounce)}>{bounce ? 'Stop' : 'Start'} Bouncing</Button>

  <p class="my-2">
    Visit <a class="underline" href="https://kit.svelte.dev">kit.svelte.dev</a> to
    read the `svelte-package` documentation
  </p>
</div>
