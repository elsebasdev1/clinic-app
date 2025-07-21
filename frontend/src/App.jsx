import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="flex justify-center space-x-8 my-8">
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="w-16 h-16" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="w-16 h-16" alt="React logo" />
        </a>
      </div>
      <h1 className="text-4xl font-semibold text-center mb-4">Vite + React</h1>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-xs mx-auto">
        <button 
          onClick={() => setCount(count + 1)} 
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition duration-200"
        >
          count is {count}
        </button>
        <p className="mt-4 text-gray-600">
          Edit <code className="font-mono text-sm text-blue-600">src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="mt-4 text-center text-gray-500">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
