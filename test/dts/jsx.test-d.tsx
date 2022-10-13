import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="text-center">
      <header className="m-4">
        <p>
          <button
            ma flex absolute
            op30 fw20 p1 m10px
            items="center"
            p="x-4 y-2"
            hover:p="0"
            hover="bg-teal-400 border-teal-400"
            className="*app-border rounded mt-4"
            onClick={() => setCount(count => count + 1)}>
            count is: {count}
          </button>
        </p>
      </header>
    </div>
  )
}

export default App
