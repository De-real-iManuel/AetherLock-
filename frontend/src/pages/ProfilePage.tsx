import * as React from 'react'

export default function ProfilePage() {
  const [name, setName] = React.useState('Anonymous')
  const [bio, setBio] = React.useState('')

  return (
    <div className="min-h-screen container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <div className="text-sm text-slate-400">Wallet: <span className="font-medium">0xAb...F3</span></div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-4 bg-slate-900/40 rounded">
          <h2 className="font-semibold mb-2">Identity</h2>
          <div className="mt-2">
            <div className="text-sm text-slate-300 mb-2">Display name</div>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 rounded bg-slate-800" />
          </div>

          <div className="mt-4">
            <div className="text-sm text-slate-300 mb-2">About</div>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="w-full p-2 rounded bg-slate-800" />
          </div>

          <div className="mt-4">
            <button className="px-4 py-2 bg-cyan-500 text-black rounded">Save profile</button>
          </div>
        </div>

        <div className="p-4 bg-slate-900/40 rounded md:col-span-2">
          <h2 className="font-semibold mb-2">Trust & Activity</h2>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-slate-800 rounded text-center">
              <div className="text-slate-400 text-sm">TrustScore</div>
              <div className="text-2xl font-semibold text-cyan-400">88</div>
            </div>
            <div className="p-3 bg-slate-800 rounded text-center">
              <div className="text-slate-400 text-sm">Jobs</div>
              <div className="text-2xl font-semibold">12</div>
            </div>
            <div className="p-3 bg-slate-800 rounded text-center">
              <div className="text-slate-400 text-sm">Rating</div>
              <div className="text-2xl font-semibold">4.9</div>
            </div>
          </div>

          <h3 className="font-semibold mb-2">Recent jobs</h3>
          <ul className="text-sm text-slate-300 space-y-2">
            <li className="p-2 bg-slate-800/40 rounded">Task #321 — Delivered, $400</li>
            <li className="p-2 bg-slate-800/40 rounded">Task #305 — Dispute opened</li>
            <li className="p-2 bg-slate-800/40 rounded">Task #298 — Released</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
