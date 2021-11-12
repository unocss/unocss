import { remove } from 'fs-extra'
import { runCli, cacheDir } from './utils'

beforeAll(async() => {
  await remove(cacheDir)
})

it('builds uno.css', async() => {
  const { output } = await runCli({
    'views/index.html': '<div class="p-4 max-w-screen-md"></div>',
  })

  expect(output).toMatchSnapshot()
})

it('supports unocss.config.js', async() => {
  const { output } = await runCli({
    'views/index.html': '<div class="box"></div>',
    'unocss.config.js': `
      import { defineConfig } from 'unocss'
      export default defineConfig({
        shortcuts: [{ box: 'max-w-7xl mx-auto bg-gray-100 rounded-md shadow-sm p-4' }]
      })
    `,
  })

  expect(output).toMatchSnapshot()
})
