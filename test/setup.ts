import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { staticFontsourceMockData, variableFontsourceMockData, variableMockData } from './assets/fontsource-mock'

export const restHandlers = [
  http.get(/google/, () => {
    return new HttpResponse('@font-face mocked {}', { status: 200, headers: { 'Content-Type': 'text/css' } })
  }),
  http.get('https://api.fontsource.org/v1/variable/:id', () => {
    return HttpResponse.json(variableMockData, { status: 200 })
  }),
  http.get('https://api.fontsource.org/v1/fonts/:id', ({ params }) => {
    const { id } = params
    let data: any
    if (id === 'dm-sans') {
      data = variableFontsourceMockData
    }
    else {
      data = staticFontsourceMockData
    }
    return HttpResponse.json(data, { status: 200 })
  }),
]

const server = setupServer(...restHandlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())
