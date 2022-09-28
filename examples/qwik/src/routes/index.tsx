import { component$ } from '@builder.io/qwik'
import type { DocumentHead } from '@builder.io/qwik-city'
import { Link } from '@builder.io/qwik-city'

export default component$(() => {
  return (
    <div>
      <h1 mb-1 className="text-red-500">
        Welcome to Qwik <span hue-rotate-180>⚡️</span> <br />
        <span className="text-green-600">working with UNOCSS</span>
      </h1>

      <ul className="list-square mt-2 mb-8 pl-6">
        <li pt-1>
          Check out the <code font-monospace>src/routes</code> directory to get started.
        </li>
        <li pt-1>
          Add integrations with <code>npm run qwik add</code>.
        </li>
        <li pt-1>
          More info about development in <code>README.md</code>
        </li>
      </ul>

      <h2>Commands</h2>

      <table mb-5>
        <tr>
          <td command-first>
            <code className="code">npm run dev</code>
          </td>
          <td>Start the dev server and watch for changes.</td>
        </tr>
        <tr>
          <td command-first>
            <code className="code">npm run preview</code>
          </td>
          <td>Production build and start preview server.</td>
        </tr>
        <tr>
          <td command-first>
            <code className="code">npm run build</code>
          </td>
          <td>Production build.</td>
        </tr>
        <tr>
          <td command-first>
            <code className="code">npm run qwik add</code>
          </td>
          <td>Select an integration to add.</td>
        </tr>
      </table>
      <Link class="mindblow" href="/flower">
        Blow my mind 🤯
      </Link>
    </div>
  )
})

export const head: DocumentHead = {
  title: 'Welcome to Qwik',
}
