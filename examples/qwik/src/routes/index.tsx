import { component$ } from '@builder.io/qwik'
import type { DocumentHead } from '@builder.io/qwik-city'
import { Link } from '@builder.io/qwik-city'

export default component$(() => {
  return (
    <div>
      <h1 mb-1 className="text-red-500" hue-rotate-180>
        Welcome to Qwik <span text-4xl>⚡️</span> <br />
        working with UNOCSS
      </h1>
      <Link class="mindblow" href="/flower">
        Blow my mind 🤯
      </Link>
      </div>
  )
})

export const head: DocumentHead = {
  title: 'Welcome to Qwik',
}
