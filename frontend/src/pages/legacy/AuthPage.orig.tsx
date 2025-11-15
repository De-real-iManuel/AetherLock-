import * as React from 'react'
import { WalletConnector } from '@/components/auth/wallet-connector'

export default function AuthPage() {
  const [role, setRole] = React.useState<'client' | 'freelancer' | null>(null)
  const [kycComplete, setKycComplete] = React.useState(false)

  return (
    <div className="min-h-screen container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome — Get started</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-4 bg-slate-900/40 rounded">
          <h2 className="font-semibold mb-2">1) Connect Wallet</h2>
          <p className="text-sm text-slate-300 mb-3">Use your preferred wallet to connect. We support Phantom, MetaMask and WalletConnect.</p>
          <WalletConnector />
        </div>

        <div className="p-4 bg-slate-900/40 rounded">
          <h2 className="font-semibold mb-2">2) Select Role</h2>
          <div className="flex gap-3 mt-2">
            <button onClick={() => setRole('client')} className={`px-3 py-2 rounded ${role === 'client' ? 'bg-cyan-400 text-black' : 'bg-slate-800'}`}>Client</button>
            <button onClick={() => setRole('freelancer')} className={`px-3 py-2 rounded ${role === 'freelancer' ? 'bg-cyan-400 text-black' : 'bg-slate-800'}`}>Freelancer</button>
          </div>
          <div className="mt-3 text-slate-300 text-sm">Selected: <span className="font-medium">{role ?? 'none'}</span></div>
        </div>

        <div className="p-4 bg-slate-900/40 rounded">
          <h2 className="font-semibold mb-2">3) Verify Identity</h2>
          <p className="text-sm text-slate-300">Complete a lightweight zk-based verification to unlock TrustScore and avoid repeated manual KYC.</p>
          <div className="mt-3">
            <button onClick={() => setKycComplete(true)} className="px-4 py-2 bg-cyan-400 text-black rounded">Simulate KYC</button>
            <div className="mt-2 text-sm text-slate-300">Status: {kycComplete ? 'Verified' : 'Pending'}</div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-slate-900/30 rounded">
        <h3 className="font-semibold mb-2">Next</h3>
        <p className="text-slate-300 text-sm">Once connected and verified you can create escrows, join the marketplace and start transacting.</p>
        <div className="mt-3">
          <button className="px-4 py-2 bg-cyan-500 text-black rounded" disabled={!kycComplete}>Finish Onboarding</button>
        </div>
      </div>
    </div>
  )
}
