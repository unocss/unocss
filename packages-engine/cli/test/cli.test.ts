import fs from 'fs-extra'
import { resolve } from 'pathe'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getWatcher } from '../src/watcher'
import { getTestDir, readFile, runAsyncChildProcess, runCli, sleep, tempDir } from './utils'

beforeAll(async () => {
  await fs.remove(tempDir)
})

afterAll(async () => {
  (await getWatcher()).close()
  await fs.remove(tempDir)
})

describe('cli', () => {
  it('builds uno.css', async () => {
    const { output } = await runCli({
      'views/index.html': '<div class="p-4 max-w-screen-md"></div>',
    })

    expect(output).toMatchSnapshot()
  })

  it('builds scan and transform *.css', async () => {
    const { output } = await runCli({
      'views/style.css': `body {
  color: white;
  @apply bg-red dark:bg-blue;
}`.trim(),
      'views/main.css': `
  .btn {
    @apply p-2 bg-red;
  }
`.trim(),
    })

    expect(output).toMatchSnapshot()
  })

  it('supports unocss.config.js', async () => {
    const { output } = await runCli({
      'views/index.html': '<div class="box"></div>',
      'unocss.config.js': `
  import { defineConfig, presetWind3 } from 'unocss'
  export default defineConfig({
    presets: [presetWind3()],
    shortcuts: [{ box: 'max-w-7xl mx-auto bg-gray-100 rounded-md shadow-sm p-4' }]
  })
      `.trim(),
    })

    expect(output).toMatchSnapshot()
  })

  it('supports variantGroup transformer', async () => {
    const { output, transform } = await runCli({
      'views/index.html': '<div class="p-4 border-(~ solid red)"></div>',
      'unocss.config.js': `
  import { defineConfig, presetWind3, transformerVariantGroup } from 'unocss'
  export default defineConfig({
    presets: [presetWind3()],
    transformers: [transformerVariantGroup()]
  })
      `.trim(),
    }, {
      args: ['--rewrite'],
      transformFile: 'views/index.html',
    })
    expect(output).toMatchSnapshot()
    expect(transform).toMatchSnapshot()
  })

  it('supports directives transformer', async () => {
    const { output, transform } = await runCli({
      'views/index.css': '.btn-center{@apply text-center my-0 font-medium;}',
      'unocss.config.js': `
  import { defineConfig, presetWind3, transformerDirectives } from 'unocss'
  export default defineConfig({
    presets: [presetWind3()],
    transformers: [transformerDirectives()]
  })
      `.trim(),
    }, { transformFile: 'views/index.css' })
    expect(output).toMatchSnapshot()
    expect(transform).toMatchSnapshot()
  })

  it('uno.css exclude initialized class after changing file', async () => {
    const fileName = 'views/index.html'
    const initializedContent = '<div class="bg-blue"></div>'
    const testDir = getTestDir()
    const absolutePathOfFile = resolve(testDir, fileName)
    await fs.outputFile(absolutePathOfFile, initializedContent)
    await runAsyncChildProcess(testDir, 'views/**/*', '--preset', 'wind3', '-w')
    const outputPath = resolve(testDir, 'uno.css')

    for (let i = 50; i >= 0; i--) {
      await sleep(50)
      if (fs.existsSync(outputPath))
        break
    }

    const output = await readFile(testDir)
    expect(output).toContain('.bg-blue')

    const changedContent = '<div class="bg-red"></div>'
    await fs.writeFile(absolutePathOfFile, changedContent)

    // polling until update
    for (let i = 100; i >= 0; i--) {
      await sleep(100)
      const output = await readFile(testDir)
      if (i === 0 || output.includes('.bg-red')) {
        expect(output).toContain('.bg-red')
        break
      }
    }
  })

  it('supports unocss.config.js cli options', async () => {
    const testDir = getTestDir()
    const outFiles = ['./uno1.css', './test/uno2.css']
    const files = [
      {
        path: 'views/index1.html',
        content: '<div class="bg-blue"></div>',
      },
      {
        path: 'views/index2.html',
        content: '<div class="bg-red"></div>',
      },
      {
        path: 'unocss.config.js',
        content: `
  import { defineConfig, presetWind3 } from 'unocss'
  export default defineConfig({
    cli: {
      entry: [
        {
          patterns: ['views/index1.html'],
          outFile: '${outFiles[0]}',
        },
        {
          patterns: ['views/index2.html'],
          outFile: '${outFiles[1]}',
        },
      ],
    },
    presets: [presetWind3()],
  })
            `.trim(),
      },
    ]
    await Promise.all(files.map(({ path, content }) => fs.outputFile(resolve(testDir, path), content)))
    await runAsyncChildProcess(testDir, '', '')

    await sleep(500)
    const [output1, output2] = await Promise.all(outFiles.map(async file => readFile(testDir, resolve(testDir, file))))

    expect(output1).toContain('.bg-blue')
    expect(output2).toContain('.bg-red')
  })

  it('supports uno.config.ts changed rebuild', async () => {
    const { output, testDir } = await runCli({
      'views/index.html': '<div class="bg-foo"></div>',
      'uno.config.ts': `
  import { defineConfig, presetWind3 } from 'unocss'
  export default defineConfig({
    presets: [presetWind3()],
    theme: {
      colors: {
        foo: "red",
      }
    }
  })`.trim(),
    }, { args: ['-w'] })

    expect(output).toContain('red')

    await fs.writeFile(resolve(testDir as string, 'uno.config.ts'), `
  import { defineConfig, presetWind3 } from 'unocss'
  export default defineConfig({
    presets: [presetWind3()],
    theme: {
      colors: {
        foo: "blue",
      }
    }
  })
      `)
    for (let i = 50; i >= 0; i--) {
      await sleep(500)
      const outputChanged = await readFile(testDir as string)
      if (i === 0 || outputChanged.includes('blue')) {
        expect(outputChanged).toContain('blue')
        break
      }
    }
  })

  it('should correctly deduplicate files of different types containing @media', async () => {
    const { output, transform } = await runCli(
      {
        'views/index1.html': '<div class="lg:p-8"></div>',
        'views/index2.html': '<div class="md:p-4"></div>',
        'views/index3.html': '<div class="box"></div>',
        'views/index.css': '.box { @apply pd-6 sm:p-2; }',
        'unocss.config.js': `
            import { defineConfig, presetWind3, transformerDirectives } from 'unocss'
            export default defineConfig({
              presets: [presetWind3()],
              transformers: [transformerDirectives()]
            })
          `.trim(),
      },
      { transformFile: 'views/index.css', args: ['--rewrite'] },
    )

    expect(output).toMatchSnapshot()
    expect(transform).toMatchSnapshot()
  })

  it('@unocss-skip uno.css', async () => {
    const { output } = await runCli({
      'views/index.html': `
      <div class="p-4"></div>
    // @unocss-skip-start
      <div class="bg-red text-white"></div>
    // @unocss-skip-end
      <div className="w-10"></div>
  `,
    })

    expect(output).toContain('.p-4')
    expect(output).toContain('.w-10')
    expect(output).not.toContain('.bg-red')
    expect(output).not.toContain('.text-white')
  })

  it('use default preset via cli option', async () => {
    const { output } = await runCli({
      'views/index.html': `<div class="bg-blue"></div>`,
      'views/index.css': `.btn { @apply p-2 bg-red; }`,
    }, {
      args: ['--preset', 'wind4'],
    })
    expect(output).toMatchSnapshot()
  })
})
