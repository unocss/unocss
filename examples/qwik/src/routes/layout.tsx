import { Slot, component$ } from '@builder.io/qwik'

export default component$(() => {
  return (
    <>
      <main max-w-760px mx-a bg-white rounded-sm overflow-hidden p-7
      style={{
        'box-shadow': '0px 0px 130px -50px var(--qwik-light-purple)',
      }}>

          <Slot />

      </main>
      <footer text-center pa-4 text-sm>
      Made with ♡ Qwik UnoCSS
      </footer>
    </>
  )
})
