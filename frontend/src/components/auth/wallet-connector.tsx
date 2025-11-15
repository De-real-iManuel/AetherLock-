import * as React from 'react'
import { useWallet } from '@/context/WalletContext'

export const WalletConnector = () => {
  const { address, isConnected, connect, disconnect } = useWallet()

  const short = (addr: string | null) => (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '')

  return (
    <div className="flex items-center space-x-3">
      {isConnected ? (
        <>
          <div className="text-sm text-slate-200">{short(address)}</div>
          <button className="px-3 py-1 rounded bg-red-600 text-white text-sm" onClick={() => disconnect()}>
            Disconnect
          </button>
        </>
      ) : (
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 rounded bg-cyan-500 text-black text-sm" onClick={() => connect('phantom')}>
            Connect Phantom
          </button>
          <button className="px-3 py-1 rounded bg-slate-700 text-white text-sm" onClick={() => connect('metamask')}>
            Connect MetaMask
          </button>
        </div>
      )}
    </div>
  )
}
