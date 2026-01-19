import React from 'react'
import { cn } from './libs/utils'

export default function App() {
  return (
    <div className={cn('p-4 text-red-500 bg-white')}>
      <h1 className='font-bold'>Hello, world!</h1>
      <p>This is a minimal Vite + React + TypeScript + Tailwind app.</p>
    </div>
  )
}
