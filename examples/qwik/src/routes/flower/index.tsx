import { component$, useClientEffect$, useStore } from '@builder.io/qwik'
import type { DocumentHead } from '@builder.io/qwik-city'
import { useLocation } from '@builder.io/qwik-city'

export default component$(() => {
  // useStylesScoped$(styles)
  const loc = useLocation()

  const state = useStore({
    count: 0,
    number: 20,
  })

  useClientEffect$(({ cleanup }) => {
    const timeout = setTimeout(() => (state.count = 1), 500)
    cleanup(() => clearTimeout(timeout))

    const internal = setInterval(() => state.count++, 7000)
    cleanup(() => clearInterval(internal))
  })

  return (
    <>

      <input
        className="w-100"
        type="range"
        value={state.number}
        max={33}
        onInput$={(ev) => {
          state.number = (ev.target as HTMLInputElement).valueAsNumber
        }}
      />
      <div
        style={{
          '--state': `${state.count * 0.1}`,
        }}

        class={{
          'h-[500px]': true,
          'grid': true,
          'w-full': true,
          'items-center': true,
          'justify-center': true,
          'justify-items-center': true,
          'host': true,
          'pride': loc.query.pride === 'true',
        }}
      >
        {Array.from({ length: state.number }, (_, i) => (
          <div
            key={i}
            class={{
              'b-1': true,
              'border-width-2': true,

              'bg-white': loc.query.pride !== 'true',
              'box-border': true,
              'square': true,
              'odd': i % 2 === 0,
            }}
            style={{
              'border-color': '#a97def',
              '--index': `${i + 1}`,
              'contain': 'strict',
              'will-change': 'transform, border-color',
            }}
          />
        )).reverse()}
      </div>
    </>
  )
})

export const head: DocumentHead = {
  title: 'Qwik Flower',
}
