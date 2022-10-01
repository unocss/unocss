import { component$ } from '@builder.io/qwik'
import { QwikCity, RouterOutlet } from '@builder.io/qwik-city'
import { RouterHead } from './components/router-head'
import '@unocss/reset/tailwind.css'
import 'uno.css'

export default component$(() => {
  return (
    <QwikCity>
      <head>
        <meta charSet="utf-8" />
        <RouterHead />
      </head>
      <body lang="en">
        <RouterOutlet />
      </body>
    </QwikCity>
  )
})
