<script>
	import { goto } from "$app/navigation"

	let name = ''

	let input

	function go() {
		if (name) {
			goto(`/hi/${name}`)
		} else {
			input?.focus()
		}
	}
</script>

<form on:submit|preventDefault={go}>
	<input bind:this={input} bind:value={name} type="text" aria-label="What's your name?" placeholder="What's your name?">
	<button type="submit">
		GO
	</button>
</form>

<style>
	form {
		padding-top: 1rem;
	}
	button {
		font-family: inherit;
		font-size: inherit;
		padding: 1em 2em;
		color: #ff3e00;
		background-color: rgba(255, 62, 0, 0.1);
		border-radius: 2em;
		border: 2px solid rgba(255, 62, 0, 0);
		outline: none;
		width: 200px;
		font-variant-numeric: tabular-nums;
		cursor: pointer;
		padding-top: 1rem;
	}
	button:focus {
		border: 2px solid #ff3e00;
	}
	button:active {
		background-color: rgba(255, 62, 0, 0.2);
	}
</style>
