import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWalletStore } from '../store/walletStore'
import WalletConnectionModal from './WalletConnectionModal'
import EscrowList from './EscrowList'
import EscrowCreationWizard from './EscrowCreationWizard'
import ParticleBackground from './ParticleBackground'
import { Wallet, Plus, List, Shield, Settings } from 'lucide-react'

const Dashboard: React.FC = () => {
  const { isConnected, address, balance, network } = useWalletStore()
  const [activeTab, setActiveTab] = useState('escrows')
  const [showWalletModal, setShowWalletModal] = useState(false)

  const tabs = [
    { id: 'escrows', label: 'My Escrows', icon: List },
    { id: 'create', label: 'Create New', icon: Plus },
    { id: 'verification', label: 'Verification Logs', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-primary-background relative overflow-hidden">
        <ParticleBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-display text-accent-electric mb-8">
              AetherLock Dashboard
            </h1>
            <p className="text-gray-400 mb-8">Connect your wallet to get started</p>
            <button
              onClick={() => setShowWalletModal(true)}
              className="bg-accent-purple hover:bg-accent-purple/80 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Connect Wallet
            </button>
          </motion.div>
        </div>
        <WalletConnectionModal 
          isOpen={showWalletModal} 
          onClose={() => setShowWalletModal(false)} 
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-background">
      <ParticleBackground />
      
      {/* Header */}
      <header className="relative z-10 border-b border-primary-border bg-primary-surface/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-display text-accent-electric">AetherLock</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                <span className="text-accent-cyan">{network}</span> • {balance} SOL
              </div>
              <div className="flex items-center space-x-2 bg-primary-card px-3 py-2 rounded-lg">
                <Wallet className="w-4 h-4 text-accent-electric" />
                <span className="text-sm font-code">
                  {address?.slice(0, 4)}...{address?.slice(-4)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-primary-border bg-primary-surface/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-accent-electric text-accent-electric'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'escrows' && <EscrowList />}
            {activeTab === 'create' && <EscrowCreationWizard />}
            {activeTab === 'verification' && <div className="text-center text-gray-400 py-12">Verification Logs - Coming Soon</div>}
            {activeTab === 'settings' && <div className="text-center text-gray-400 py-12">Settings - Coming Soon</div>}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default Dashboard