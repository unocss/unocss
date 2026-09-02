import { Card } from './components/card'

export function App(): string {
  return `
    <div class="h-screen flex flex-col items-center justify-center gap-4 bg-gray-100 dark:bg-gray-900">
      <h1 class="text-title text-violet-600">UnoCSS + Vite DevTools</h1>
      <p class="op-60 max-w-100 text-center">
        Vite DevTools is enabled — open
        <a class="text-violet-600 underline" href="/__devtools/">/__devtools/</a>
        and pick the UnoCSS dock.
      </p>
      ${Card('Hello', 'Some utilities across a few modules to inspect.')}
      <div class="m-4 p-2 text-sm text-emerald hover:op-50">More utilities</div>
    </div>
  `
}
