import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll } from 'vitest'
import {
  staticFontsourceMockData,
  variableFontsourceMockDataDmSans,
  variableFontsourceMockDataNotoSansSC,
  variableMockData,
} from './assets/mock/fontsource'
import googleResponse from './assets/mock/google'

export const restHandlers = [
  http.get(/googleapis/, () => {
    return new HttpResponse(googleResponse, { status: 200, headers: { 'Content-Type': 'text/css' } })
  }),
  http.get('https://api.fontsource.org/v1/variable/:id', () => {
    return HttpResponse.json(variableMockData, { status: 200 })
  }),
  http.get('https://api.fontsource.org/v1/fonts/:id', ({ params }) => {
    const { id } = params
    let data: any
    if (id === 'dm-sans') {
      data = variableFontsourceMockDataDmSans
    }
    else if (id === 'noto-sans-sc') {
      data = variableFontsourceMockDataNotoSansSC
    }
    else {
      data = staticFontsourceMockData
    }
    return HttpResponse.json(data, { status: 200 })
  }),
]

const server = setupServer(...restHandlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())
