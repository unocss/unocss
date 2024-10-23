import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { staticFontsourceMockData, variableFontsourceMockData, variableMockData } from './assets/fontsource-mock'

export const restHandlers = [
  rest.get(/google/, (req, res, ctx) => {
    return res(ctx.status(200), ctx.text('@font-face mocked {}'))
  }),
  rest.get('https://api.fontsource.org/v1/variable/:id', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(variableMockData))
  }),
  rest.get('https://api.fontsource.org/v1/fonts/:id', (req, res, ctx) => {
    const { id } = req.params
    let data: any
    if (id === 'dm-sans') {
      data = variableFontsourceMockData
    }
    else {
      data = staticFontsourceMockData
    }
    return res(ctx.status(200), ctx.json(data))
  }),
]

const server = setupServer(...restHandlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())
