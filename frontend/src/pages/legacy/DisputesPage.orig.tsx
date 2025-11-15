import * as React from 'react'

export default function DisputesPage() {
  const [open, setOpen] = React.useState(false)
  const disputes = [
    { id: '305', title: 'Missing deliverable', status: 'Open' },
    { id: '289', title: 'Partial refund requested', status: 'Resolved' },
  ]

  return (
    <div className="min-h-screen container mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Disputes</h1>
        <button onClick={() => setOpen(true)} className="px-3 py-1 bg-cyan-500 text-black rounded">Raise dispute</button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {disputes.map((d) => (
          <div key={d.id} className="p-4 bg-slate-900/30 rounded">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Escrow #{d.id}</div>
                <div className="text-sm text-slate-400">{d.title}</div>
              </div>
              <div className="text-sm text-slate-300">{d.status}</div>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60">
          <div className="bg-slate-900 p-6 rounded w-full max-w-xl">
            <h3 className="font-semibold mb-3">Raise dispute</h3>
            <textarea className="w-full p-2 rounded bg-slate-800 text-slate-200" rows={5} placeholder="Describe the issue and attach evidence..." />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="px-3 py-1 bg-slate-700 rounded">Cancel</button>
              <button onClick={() => setOpen(false)} className="px-3 py-1 bg-cyan-500 text-black rounded">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
