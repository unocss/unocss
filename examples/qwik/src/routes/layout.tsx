import { Slot, component$ } from '@builder.io/qwik'

export default component$(() => {
  return (
    <>
      <main>
        <section>
          <Slot />
        </section>
      </main>
      <footer>
        <a href="https://www.builder.io/" target="_blank" rel="noreferrer">
          Made with ♡ by Builder.io
        </a>
      </footer>
    </>
  )
})
