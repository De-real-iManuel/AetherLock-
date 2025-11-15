import * as React from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react"
import type { Escrow } from "@/types/models"

// Status badge color mapping
const statusColors = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  active: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ai_reviewing: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  disputed: "bg-red-500/20 text-red-400 border-red-500/30",
  cancelled: "bg-gray-500/20 text-gray-400 border-gray-500/30"
}

// Status display names
const statusNames = {
  pending: "Pending",
  active: "Active",
  ai_reviewing: "AI Reviewing",
  completed: "Completed",
  disputed: "Disputed",
  cancelled: "Cancelled"
}

// Column definitions
type SortableColumn = 'title' | 'freelancer' | 'amount' | 'status' | 'deadline'
type SortOrder = 'asc' | 'desc' | null

interface Column {
  key: SortableColumn
  label: string
  sortable: boolean
  className?: string
}

const columns: Column[] = [
  { key: 'title', label: 'Title', sortable: true, className: 'min-w-[200px]' },
  { key: 'freelancer', label: 'Freelancer', sortable: true, className: 'min-w-[150px]' },
  { key: 'amount', label: 'Amount', sortable: true, className: 'min-w-[120px]' },
  { key: 'status', label: 'Status', sortable: true, className: 'min-w-[120px]' },
  { key: 'deadline', label: 'Deadline', sortable: true, className: 'min-w-[150px]' }
]

interface EscrowTableProps {
  escrows: Escrow[]
  onRowClick?: (escrow: Escrow) => void
  className?: string
}

export const EscrowTable: React.FC<EscrowTableProps> = ({ 
  escrows, 
  onRowClick,
  className 
}) => {
  const [sortColumn, setSortColumn] = React.useState<SortableColumn>('deadline')
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('asc')
  const [searchQuery, setSearchQuery] = React.useState('')

  // Handle column sort
  const handleSort = (column: SortableColumn) => {
    if (sortColumn === column) {
      // Toggle sort order
      setSortOrder(sortOrder === 'asc' ? 'desc' : sortOrder === 'desc' ? null : 'asc')
      if (sortOrder === 'desc') {
        setSortColumn('deadline') // Reset to default
      }
    } else {
      setSortColumn(column)
      setSortOrder('asc')
    }
  }

  // Filter escrows by search query
  const filteredEscrows = React.useMemo(() => {
    if (!searchQuery.trim()) return escrows

    const query = searchQuery.toLowerCase()
    return escrows.filter(escrow => 
      escrow.title.toLowerCase().includes(query) ||
      escrow.id.toLowerCase().includes(query) ||
      escrow.freelancerAddress?.toLowerCase().includes(query) ||
      escrow.clientAddress.toLowerCase().includes(query)
    )
  }, [escrows, searchQuery])

  // Sort escrows
  const sortedEscrows = React.useMemo(() => {
    if (!sortColumn || !sortOrder) return filteredEscrows

    return [...filteredEscrows].sort((a, b) => {
      let comparison = 0

      switch (sortColumn) {
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'freelancer':
          const aFreelancer = a.freelancerAddress || ''
          const bFreelancer = b.freelancerAddress || ''
          comparison = aFreelancer.localeCompare(bFreelancer)
          break
        case 'amount':
          comparison = a.amount - b.amount
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        case 'deadline':
          comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [filteredEscrows, sortColumn, sortOrder])

  // Get sort icon
  const getSortIcon = (column: SortableColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-4 h-4 text-slate-500" />
    }
    if (sortOrder === 'asc') {
      return <ArrowUp className="w-4 h-4 text-accent-electric" />
    }
    if (sortOrder === 'desc') {
      return <ArrowDown className="w-4 h-4 text-accent-electric" />
    }
    return <ArrowUpDown className="w-4 h-4 text-slate-500" />
  }

  // Format deadline
  const formatDeadline = (deadline: Date) => {
    const date = new Date(deadline)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { text: 'Expired', className: 'text-status-failed' }
    } else if (diffDays === 0) {
      return { text: 'Today', className: 'text-yellow-400' }
    } else if (diffDays === 1) {
      return { text: 'Tomorrow', className: 'text-yellow-400' }
    } else if (diffDays < 7) {
      return { text: `${diffDays} days`, className: 'text-yellow-400' }
    } else {
      return { text: date.toLocaleDateString(), className: 'text-slate-300' }
    }
  }

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by title, ID, or address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-md border border-primary-border bg-primary-surface/50 backdrop-blur-sm text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-electric transition-all"
        />
      </div>

      {/* Table Container */}
      <div className="rounded-lg border border-primary-border bg-primary-card/80 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Table Header */}
            <thead className="bg-primary-surface/50 border-b border-primary-border">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider",
                      column.sortable && "cursor-pointer hover:text-accent-electric transition-colors select-none",
                      column.className
                    )}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.label}</span>
                      {column.sortable && getSortIcon(column.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-primary-border">
              {sortedEscrows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-slate-400">No escrows found</p>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="text-sm text-accent-electric hover:underline"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                sortedEscrows.map((escrow, index) => {
                  const deadline = formatDeadline(escrow.deadline)
                  
                  return (
                    <motion.tr
                      key={escrow.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-primary-surface/30 cursor-pointer transition-colors group"
                      onClick={() => onRowClick?.(escrow)}
                    >
                      {/* Title */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-white group-hover:text-accent-electric transition-colors">
                            {escrow.title}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            #{escrow.id.slice(0, 8)}...
                          </span>
                        </div>
                      </td>

                      {/* Freelancer */}
                      <td className="px-6 py-4">
                        {escrow.freelancerAddress ? (
                          <span className="text-sm text-slate-300 font-mono">
                            {escrow.freelancerAddress.slice(0, 6)}...{escrow.freelancerAddress.slice(-4)}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-500 italic">Not assigned</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold text-accent-electric">
                            {escrow.amount}
                          </span>
                          <span className="text-xs text-slate-400">
                            {escrow.currency}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <Badge className={cn("border", statusColors[escrow.status])}>
                          {statusNames[escrow.status]}
                        </Badge>
                      </td>

                      {/* Deadline */}
                      <td className="px-6 py-4">
                        <span className={cn("text-sm font-medium", deadline.className)}>
                          {deadline.text}
                        </span>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Count */}
      {sortedEscrows.length > 0 && (
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>
            Showing {sortedEscrows.length} of {escrows.length} escrow{escrows.length !== 1 ? 's' : ''}
          </span>
          {sortColumn && sortOrder && (
            <span>
              Sorted by {sortColumn} ({sortOrder === 'asc' ? 'ascending' : 'descending'})
            </span>
          )}
        </div>
      )}
    </div>
  )
}
