import { Button } from './button'

export function Card(title: string, body: string): string {
  return `
    <div class="max-w-100 p-6 rounded-lg bg-white dark:bg-gray-800 shadow flex flex-col gap-3">
      <h2 class="text-lg font-bold text-teal-600">${title}</h2>
      <p class="op-70 text-sm">${body}</p>
      ${Button('A button')}
    </div>
  `
}
