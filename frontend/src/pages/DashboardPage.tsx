import * as React from 'react'

function StatCard({ title, value }: { title: string; value: React.ReactNode }) {
  return (
    <div className="p-4 bg-slate-900/40 rounded">
      <div className="text-sm text-slate-400">{title}</div>
      <div className="text-2xl font-semibold mt-2">{value}</div>
    </div>
  )
}

export default function DashboardPage() {
  const sampleActivity = [
    'Escrow #328 funded by 0xAb...F3',
    'Escrow #322 released to freelancer',
    'Dispute opened for Escrow #305',
  ]

  return (
    <div className="min-h-screen container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-slate-800 rounded">Settings</button>
          <button className="px-3 py-1 bg-cyan-500 text-black rounded">Create Escrow</button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Balance (USDC)" value="$4,200" />
        <StatCard title="Active Escrows" value={6} />
        <StatCard title="TrustScore" value={<span className="text-cyan-400">88</span>} />
        <StatCard title="Open Disputes" value={1} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 p-4 bg-slate-900/30 rounded">
          <h2 className="font-semibold mb-3">Escrow Creator (Quick)</h2>
          <form className="space-y-3">
            <div>
              <label className="text-sm text-slate-300">Recipient wallet</label>
              <input className="w-full mt-1 p-2 rounded bg-slate-800" placeholder="0x..." />
            </div>

            <div>
              <label className="text-sm text-slate-300">Amount (USDC)</label>
              <input className="w-full mt-1 p-2 rounded bg-slate-800" placeholder="100" />
            </div>

            <div className="flex gap-2">
              <button className="px-4 py-2 bg-cyan-500 text-black rounded">Create</button>
              <button type="button" className="px-4 py-2 bg-slate-700 rounded">Save Draft</button>
            </div>
          </form>
        </div>

        <aside className="p-4 bg-slate-900/30 rounded">
          <h3 className="font-semibold mb-3">Recent activity</h3>
          <ul className="text-sm text-slate-300 space-y-2">
            {sampleActivity.map((a, i) => (
              <li key={i} className="p-2 bg-slate-800/40 rounded">{a}</li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  )
}
