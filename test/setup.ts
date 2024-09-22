import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll } from 'vitest'

export const restHandlers = [
  rest.get(/google/, (req, res, ctx) => {
    return res(ctx.status(200), ctx.text('@font-face mocked {}'))
  }),
]

const server = setupServer(...restHandlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())
