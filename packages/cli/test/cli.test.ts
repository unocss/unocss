import { resolve } from 'node:path'
import fs from 'fs-extra'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { startCli } from '../src/cli-start'
import { getWatcher } from '../src/watcher'

export const tempDir = resolve('_temp')
export const cli = resolve(__dirname, '../src/cli.ts')

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

  it('supports unocss.config.js', async () => {
    const { output } = await runCli({
      'views/index.html': '<div class="box"></div>',
      'unocss.config.js': `
import { defineConfig } from 'unocss'
export default defineConfig({
  shortcuts: [{ box: 'max-w-7xl mx-auto bg-gray-100 rounded-md shadow-sm p-4' }]
})
    `.trim(),
    })

    expect(output).toMatchSnapshot()
  })

  it('supports variantGroup transformer', async () => {
    const { output, transform } = await runCli({
      'views/index.html': '<div class="p-4 border-(solid red)"></div>',
      'unocss.config.js': `
import { defineConfig, transformerVariantGroup } from 'unocss'
export default defineConfig({
  transformers: [transformerVariantGroup()]
})
    `.trim(),
    }, { transformFile: 'views/index.html' })
    expect(output).toMatchSnapshot()
    expect(transform).toMatchSnapshot()
  })

  it('supports directives transformer', async () => {
    const { output, transform } = await runCli({
      'views/index.css': '.btn-center{@apply text-center my-0 font-medium;}',
      'unocss.config.js': `
import { defineConfig, transformerDirectives } from 'unocss'
export default defineConfig({
  transformers: [transformerDirectives()]
})
    `.trim(),
    }, { transformFile: 'views/index.css' })
    expect(output).toMatchSnapshot()
    expect(transform).toMatchSnapshot()
  })

  it.each([
    {
      transformer: 'variant group transformer',
      files: {
        'views/index.html': '<div class="p-4 border-(solid red)"></div>',
        'unocss.config.js': `
import { defineConfig, transformerVariantGroup } from 'unocss'
export default defineConfig({
  transformers: [transformerVariantGroup()]
})
      `.trim(),
      } as Record<string, string>,
      transformFile: 'views/index.html',
    },
    {
      transformer: 'directives transformer',
      files: {
        'views/index.css': '.btn-center{@apply text-center my-0 font-medium;}',
        'unocss.config.js': `
import { defineConfig, transformerDirectives } from 'unocss'
export default defineConfig({
  transformers: [transformerDirectives()]
})
      `.trim(),
      },
      transformFile: 'views/index.css',
    },
  ])('supports updating source files with transformed utilities ($transformer)', async ({ files, transformFile }) => {
    const { output, transform } = await runCli(files, { transformFile, args: ['--write-transformed'] })
    expect(output).toMatchSnapshot()
    expect(transform).toMatchSnapshot()
  })

  it('uno.css exclude initialized class after changing file', async () => {
    const fileName = 'views/index.html'
    const initializedContent = '<div class="bg-blue"></div>'
    const changedContent = '<div class="bg-red"></div>'
    const testDir = getTestDir()
    const absolutePathOfFile = resolve(testDir, fileName)
    await fs.outputFile(absolutePathOfFile, initializedContent)
    await runAsyncChildProcess(testDir, './views/**/*', '-w')
    const outputPath = resolve(testDir, 'uno.css')
    for (let i = 50; i >= 0; i--) {
      await sleep(50)
      if (fs.existsSync(outputPath))
        break
    }
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
import { defineConfig } from 'unocss'
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
  }
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
import { defineConfig } from 'unocss'
export default defineConfig({
  theme: {
    colors: {
      foo: "red",
    }
  }
})`.trim(),
    }, { args: ['-w'] })
    for (let i = 50; i >= 0; i--) {
      await sleep(50)
      if (output)
        break
    }
    expect(output).toContain('.bg-foo{background-color:red /* red */;}')
    await fs.writeFile(resolve(testDir as string, 'uno.config.ts'), `
import { defineConfig } from 'unocss'
export default defineConfig({
  theme: {
    colors: {
      foo: "blue",
    }
  }
})
    `)
    for (let i = 100; i >= 0; i--) {
      await sleep(500)
      const outputChanged = await readFile(testDir as string)
      if (i === 0 || outputChanged.includes('.bg-foo{background-color:blue /* blue */;}')) {
        expect(outputChanged).toContain('.bg-foo{background-color:blue /* blue */;}')
        break
      }
    }
  })

  it('@unocss-skip uno.css', async () => {
    const { output } = await runCli({
      'views/index.html': `
import clsx from "clsx"
import React, { useCallback, useEffect, useRef, useState } from "react"

const Navbar: React.FC<any> = ({
  className,
  children,
  show,
  id,
  navbar,
  tag: Tag = "div",
  collapseRef,
  style,
  ...props
}): JSX.Element => {

  const [showCollapse, setShowCollapse] = useState<boolean | undefined>(false)
  //  @unocss-skip-start
  const [transition, setTransition] = useState(false)

  const classes = clsx(
    transition ? "collapsing" : "collapse", // transition is not used in the app
    !transition && showCollapse && "show", // transition is not used in the app
    navbar && "navbar-collapse",
    className
  )
  const handleResize = useCallback(() => {

  }, [])


  useEffect(() => {
    window.addEventListener("resize", handleResize) // resize is not used in the app

    return () => {
      window.removeEventListener("resize", handleResize) // resize is not used in the app
    }
  }, [handleResize])
  //  @unocss-skip-end

  return (
    <div className="w-10">

    </div>
  )
}

export default Navbar
`,
    })

    expect(output).toMatchSnapshot()
  })
})

// ----- Utils -----
function sleep(time = 300) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

function getTestDir() {
  return resolve(tempDir, Math.round(Math.random() * 100000).toString())
}

function initOutputFiles(testDir: string, files: Record<string, string>) {
  return Promise.all(
    Object.entries(files).map(([path, content]) => fs.outputFile(resolve(testDir, path), content, 'utf8')),
  )
}

function runAsyncChildProcess(cwd: string, ...args: string[]) {
  return startCli(cwd, ['', '', ...args, '--no-preflights'])
}

function readFile(testDir: string, targetFile?: string) {
  return fs.readFile(resolve(testDir, targetFile ?? 'uno.css'), 'utf8')
}

async function runCli(files: Record<string, string>, options?: { transformFile?: string, args?: string[] }) {
  const testDir = getTestDir()

  await initOutputFiles(testDir, files)
  await runAsyncChildProcess(testDir, 'views/**/*', ...options?.args ?? [])

  const output = await readFile(testDir)

  if (options?.transformFile) {
    const transform = await readFile(testDir, options?.transformFile)
    return {
      output,
      transform,
    }
  }

  return {
    output,
    testDir,
  }
}
