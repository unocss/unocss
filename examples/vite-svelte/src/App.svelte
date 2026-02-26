<script lang="ts">
    import { fade, fly } from 'svelte/transition'
    import Footer from './Footer.svelte'

    let logo = $state(false)
    let red = $state(false)
    let x = $state('abc?cbd')
    $inspect(x)
    const button = $derived(logo ? 'Hide logo' : 'Show logo')
    const span = $derived(red ? 'Normal' : 'Red')

    function toggleLogo() {
        logo = !logo
    }
    
    function toggleSpan() {
        red = !red
    }
</script>

<main>
  <span class="logo"></span>

  {#if logo}
    <span class:logo={logo} in:fly="{{ y: 200, duration: 2000 }}" out:fade></span>
  {/if}

  <h1 class="animate-bounce">Hello Typescript!</h1>

  <h2 class="text-lg font-semibold text-orange-600">Use shift+ctrl for the inspector</h2>

  <br/>

  <div class:bg-red-400={red}>BG Color should change</div>

  <br/>

  <button class="bg-red-100" onclick={toggleLogo}>{button}</button>
  <button onclick={toggleSpan}>Change BG Color: {span}</button>

  <br />

  <input bind:value={x} type="text" name="" id="">

  <div class="absolute mt-20px bottom-0">absolute</div>

</main>

<Footer />
<Footer foo={true} name=Footer2 />
<Footer customclasses={"bg-blue-500 text-xl"} name=Footer3 />


<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  main {
    text-align: center;
    padding: 1em;
    margin: 0 auto;
  }


  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4rem;
    font-weight: 100;
    line-height: 1.1;
    margin: 2rem auto;
    max-width: 14rem;
  }


  @media (min-width: 480px) {
    h1 {
      max-width: none;
    }
  }
</style>
