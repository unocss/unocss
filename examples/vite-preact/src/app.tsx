// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Fragment, h } from 'preact'
import { useState } from 'preact/compat'

export function App() {
  const [count, setCount] = useState(0)
  return (
    <>
      <div className="h-100% bg-#673ab8 c-#fff font-size-1.5em text-center">
        <header className="bg-#673ab8 min-h-100vh flex flex-col items-center justify-center color-white">
          <div className="logo" />
          <h1 className="mt-2em animate-bounce-alt animate-duration-2s">Hello Vite + Preact!</h1>
          <p>
            <button
              className="bg-blue-400 hover:bg-blue-500 text-sm text-white font-mono font-light py-2 px-4 rounded border-2 border-blue-200 dark:bg-blue-500 dark:hover:bg-blue-600"
              type="button"
              onClick={() => setCount(count => count + 1)}
            >
                    count is: {count}
            </button>

            <button
              bg="blue-400 hover:blue-500 dark:blue-500 dark:hover:blue-600"
              text="sm white"
              font="mono light"
              p="y-2 x-4"
              m="l-1em"
              border="2 rounded blue-200"
              type="button"
              onClick={() => setCount(count => count + 1)}
            >
                    count is: {count}
            </button>

          </p>
          <p>
            <a
              className="color-#fff"
              href="https://preactjs.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
          Learn Preact
            </a>
          </p>
        </header>
      </div>
    </>
  )
}
