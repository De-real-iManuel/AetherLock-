import * as React from 'react'

type Tx = { id: string; type: string; amount: string; status: string }

export default function TransactionsPage() {
  const [q, setQ] = React.useState('')
  const data: Tx[] = [
    { id: '328', type: 'Escrow funded', amount: '200 USDC', status: 'Completed' },
    { id: '322', type: 'Release', amount: '400 USDC', status: 'Completed' },
    { id: '305', type: 'Dispute', amount: '150 USDC', status: 'Open' },
  ]

  const filtered = data.filter((d) => d.id.includes(q) || d.type.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="min-h-screen container mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <div className="flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search id or type" className="p-2 rounded bg-slate-800" />
          <button className="px-3 py-1 bg-slate-700 rounded">Export CSV</button>
        </div>
      </div>

      <div className="overflow-x-auto bg-slate-900/30 rounded">
        <table className="min-w-full">
          <thead className="text-left text-slate-400 text-sm">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Type</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-t border-slate-800">
                <td className="p-3 text-slate-200">{t.id}</td>
                <td className="p-3 text-slate-200">{t.type}</td>
                <td className="p-3 text-slate-200">{t.amount}</td>
                <td className="p-3 text-slate-200">{t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
