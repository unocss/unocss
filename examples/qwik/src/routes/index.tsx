import { component$, useStore } from '@builder.io/qwik'
import type { DocumentHead } from '@builder.io/qwik-city'

export default component$(() => {
  const state = useStore({ count: 0 })

  return (
    <div className="text-center">
      <header className="bg-#282c34 min-h-100vh flex flex-col items-center justify-center color-white space-y-2em">
        <div className="logo"/>
        <h1 className="text-xl font-500 animate-bounce-alt animate-duration-2s">Hello Vite + Qwik!</h1>
        <p>
          <button
            className="bg-blue-400 hover:bg-blue-500 text-sm text-white font-mono font-light py-2 px-4 rounded border-2 border-blue-200"
            type="button"
            onClick$={() => state.count++}
          >
            count is: {state.count}
          </button>

          <button
            bg-blue-400 hover:bg-blue-500
            text-sm text-white
            font-mono font-light
            py-2 px-4
            ml-1em
            b-2 b-blue-200
            className="rounded"
            type="button"
            onClick$={() => state.count++}
          >
            count is: {state.count}
          </button>
        </p>
        <p>
          Edit <code>index.tsx</code> and save to test HMR updates.
        </p>
        <p>
          <a
            className="color-#61dafb"
            href="https://qwik.builder.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn Qwik
          </a>
          {' | '}
          <a
            className="color-#61dafb"
            href="https://vitejs.dev/guide/features.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vite Docs
          </a>
        </p>
      </header>
    </div>
  )
})

export const head: DocumentHead = {
  title: 'Welcome to Qwik',
}
