import { A } from '@solidjs/router'
import Counter from '~/components/Counter'

export default function About() {
  return (
    <main class="mx-auto p-4 text-center text-gray-700">
      <h1 class="my-16 text-6xl text-sky-700 font-thin uppercase">
        About Page
      </h1>
      <Counter />
      <p class="mt-8">
        Visit
        {' '}
        <a
          href="https://www.solidjs.com/"
          target="_blank"
          class="text-sky-600 hover:underline"
        >
          solidjs.com
        </a>
        {' '}
        to learn how to build Solid apps.
      </p>
      <p class="my-4">
        <A href="/" class="text-sky-600 hover:underline">
          Home
        </A>
        {' - '}
        <span>About Page</span>
      </p>
    </main>
  )
}
