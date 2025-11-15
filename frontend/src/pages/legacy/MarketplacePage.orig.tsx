import * as React from 'react'

export default function MarketplacePage() {
  const [q, setQ] = React.useState('')
  const [min, setMin] = React.useState<number | ''>('')
  const sample = Array.from({ length: 12 }).map((_, i) => ({ id: i + 1, title: `Task #${i + 1}`, price: (i + 1) * 10 }))

  const filtered = sample.filter((s) => s.title.toLowerCase().includes(q.toLowerCase()) && (min === '' || s.price >= min))

  return (
    <div className="min-h-screen container mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Marketplace</h1>
        <div className="flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tasks" className="p-2 rounded bg-slate-800" />
          <input value={min === '' ? '' : String(min)} onChange={(e) => setMin(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Min $" className="p-2 rounded bg-slate-800 w-28" />
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {filtered.map((s) => (
          <div key={s.id} className="p-4 bg-slate-900/40 rounded">
            <div className="font-semibold">{s.title}</div>
            <div className="text-sm text-slate-400">{s.price} USDC</div>
            <div className="mt-3 flex gap-2">
              <button className="px-3 py-1 bg-cyan-500 text-black rounded">Quick Apply</button>
              <button className="px-3 py-1 bg-slate-700 rounded">Details</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center text-slate-400">Showing {filtered.length} results</div>
    </div>
  )
}
