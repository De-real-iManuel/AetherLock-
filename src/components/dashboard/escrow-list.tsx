import * as React from "react"
import { motion } from "framer-motion"
import { EscrowCard } from "./escrow-card"
import { EscrowFilterBar } from "./escrow-filter-bar"
import { useEscrowStore } from "@/store/escrowStore"
import { containerVariants, itemVariants } from "@/lib/animations"

export const EscrowList = () => {
  const { escrows, selectEscrow, filters, setFilters } = useEscrowStore()
  const [searchTerm, setSearchTerm] = React.useState("")

  const filteredEscrows = React.useMemo(() => {
    return escrows.filter(escrow => {
      const matchesSearch = searchTerm === "" || 
        escrow.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        escrow.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        escrow.seller.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = filters.status.length === 0 || 
        filters.status.includes(escrow.status)
      
      return matchesSearch && matchesStatus
    })
  }, [escrows, searchTerm, filters.status])

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-white mb-2">
          My Escrows
        </h2>
        <p className="text-slate-400">
          Manage your active and completed escrow transactions
        </p>
      </div>

      <EscrowFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeFilters={filters.status}
        onFilterChange={(status) => setFilters({ status })}
      />

      {filteredEscrows.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">No escrows found</div>
          <p className="text-sm text-slate-500">
            {searchTerm || filters.status.length > 0 
              ? "Try adjusting your search or filters"
              : "Create your first escrow to get started"
            }
          </p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredEscrows.map((escrow) => (
            <motion.div key={escrow.id} variants={itemVariants}>
              <EscrowCard 
                escrow={escrow} 
                onSelect={selectEscrow}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}