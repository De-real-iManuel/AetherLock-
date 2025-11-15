import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useEscrowStore } from '../store/escrowStore'
import { Clock, Users, DollarSign, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

const EscrowList: React.FC = () => {
  const { escrows } = useEscrowStore()
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredEscrows = escrows.filter(escrow => {
    const matchesFilter = filter === 'all' || escrow.status === filter
    const matchesSearch = escrow.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         escrow.seller.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         escrow.buyer?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="w-4 h-4 text-status-pending" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-status-verified" />
      case 'disputed': return <AlertTriangle className="w-4 h-4 text-status-disputed" />
      case 'cancelled': return <XCircle className="w-4 h-4 text-status-failed" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-status-pending bg-status-pending/10 border-status-pending/20'
      case 'completed': return 'text-status-verified bg-status-verified/10 border-status-verified/20'
      case 'disputed': return 'text-status-disputed bg-status-disputed/10 border-status-disputed/20'
      case 'cancelled': return 'text-status-failed bg-status-failed/10 border-status-failed/20'
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex space-x-2">
          {['all', 'active', 'completed', 'disputed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-accent-electric text-black'
                  : 'bg-primary-card text-gray-400 hover:text-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        
        <input
          type="text"
          placeholder="Search escrows..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-primary-card border border-primary-border rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-accent-electric"
        />
      </div>

      {/* Escrow Cards */}
      <div className="grid gap-4">
        {filteredEscrows.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              {escrows.length === 0 ? 'No escrows found' : 'No escrows match your filters'}
            </div>
            {escrows.length === 0 && (
              <p className="text-sm text-gray-500">Create your first escrow to get started</p>
            )}
          </motion.div>
        ) : (
          filteredEscrows.map((escrow, index) => (
            <motion.div
              key={escrow.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-primary-card border border-primary-border rounded-lg p-6 hover:border-accent-electric/50 transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-code text-accent-electric">#{escrow.id}</h3>
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(escrow.status)}`}>
                      {getStatusIcon(escrow.status)}
                      <span>{escrow.status}</span>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">{escrow.description}</p>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-accent-cyan mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-medium">{escrow.amount} SOL</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Deadline: {new Date(escrow.deadline).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>Seller: {escrow.seller.slice(0, 6)}...{escrow.seller.slice(-4)}</span>
                  </div>
                  {escrow.buyer && (
                    <div className="flex items-center space-x-1 text-gray-400">
                      <span>Buyer: {escrow.buyer.slice(0, 6)}...{escrow.buyer.slice(-4)}</span>
                    </div>
                  )}
                </div>
                
                <button className="text-accent-electric hover:text-accent-electric/80 transition-colors">
                  View Details →
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

export default EscrowList