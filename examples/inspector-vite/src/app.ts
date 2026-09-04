import { Card } from './components/card'

export function App(): string {
  return `
    <div class="h-screen flex flex-col items-center justify-center gap-4 bg-gray-100 dark:bg-gray-900">
      <h1 class="text-title text-teal-600">UnoCSS Inspector playground</h1>
      <p class="op-60 max-w-100 text-center">
        A plain Vite app with UnoCSS. Open
        <a class="text-teal-600 underline" href="/__unocss/">/__unocss/</a>
        and enter the one-time code printed in the dev server terminal.
      </p>
      ${Card('Hello', 'Some utilities across a few modules to inspect.')}
      <div class="m-4 p-2 text-sm text-red hover:op-50">More utilities</div>
    </div>
  `
}
