import React from 'react'
import { Link } from 'react-router-dom'

// Minimal stub for WinningDemoShowcase — demo UI removed for MVP to reduce template bloat.
export default function WinningDemoShowcase() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Demo removed for MVP</h1>
        <p className="text-neutral-500 mb-6">This demo has been removed to focus the frontend on the core MVP flows.</p>
        <Link to="/auth" className="px-6 py-3 bg-primary-600 text-white rounded-lg">Launch App</Link>
      </div>
    </div>
  )
}