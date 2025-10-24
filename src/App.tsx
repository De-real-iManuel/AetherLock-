import React from 'react'
import AetherLockEscrow from './components/AetherLockEscrow'
import WalletProvider from './components/WalletProvider'

const App: React.FC = () => {
  return (
    <WalletProvider>
      <div className="bg-slate-900 text-white min-h-screen">
        <AetherLockEscrow />
      </div>
    </WalletProvider>
  )
}

export default App
