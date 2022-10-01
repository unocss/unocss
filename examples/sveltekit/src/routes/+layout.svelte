<script lang="ts">
  import 'uno.css'
	import { fade, fly } from 'svelte/transition'
	let showLogo = false
	let red = false
	function toggleLogo() {
		showLogo = !showLogo
	}
	function toggleSpan() {
		red = !red
	}
	$: button = showLogo ? 'Hide logo' : 'Show logo'
	$: span = red ? 'Normal' : 'Red'
</script>

<main class="text-center p-1em my-0 mx-auto">
	<span class="logo"></span>

	{#if showLogo}
		<span class:logo={showLogo} in:fly="{{ y: 200, duration: 2000 }}" out:fade></span>
	{/if}

	<h1 class="animate-bounce color-#ff3e00 uppercase font-size-4rem fw-100 line-height-1.1 my-2rem mx-auto max-width-14rem sm:max-width-auto">SvelteKit!</h1>

	<section>
		<h2>Custom Icons</h2>
		<span class="i-custom-circle"></span>
		<span class="i-customfsl-circle color-#ff3e00"></span>
	</section>

	<br/>

	<div class:bg-red-400={red}>My BG Color should change</div>

	<br/>

	<button class="bg-red-100" on:click={toggleLogo}>{button}</button>
	<button on:click={toggleSpan}>Change BG Color: {span}</button>

	<br />

	<div class="absolute mt-20px bottom-0">absolute</div>

	<slot />

</main>

<style>
	:root {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
		Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
	}
</style>
