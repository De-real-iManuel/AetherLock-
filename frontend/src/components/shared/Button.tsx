import * as React from 'react'

export const Button = ({ children, onClick, className = '' }: { children: React.ReactNode; onClick?: () => void; className?: string }) => {
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-md bg-cyan-500 text-black hover:brightness-90 ${className}`}>
      {children}
    </button>
  )
}
