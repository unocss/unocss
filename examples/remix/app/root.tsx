import reset from '@unocss/reset/tailwind.css'
import type { LinksFunction, MetaFunction } from 'remix'
import {
  Links, LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'remix'
import unocss from '~/uno.css'

export const meta: MetaFunction = () => {
  return { title: 'unocss remix' }
}

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: unocss,
    },
    {
      rel: 'stylesheet',
      href: reset,
    },
  ]
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === 'development' && <LiveReload />}
      </body>
    </html>
  )
}
