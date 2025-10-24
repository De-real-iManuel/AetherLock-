import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"

interface EscrowFilterBarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  activeFilters: string[]
  onFilterChange: (filters: string[]) => void
}

const statusFilters = [
  { id: 'active', label: 'Active', color: 'text-blue-400' },
  { id: 'completed', label: 'Completed', color: 'text-green-400' },
  { id: 'disputed', label: 'Disputed', color: 'text-red-400' }
]

export const EscrowFilterBar = ({ 
  searchTerm, 
  onSearchChange, 
  activeFilters, 
  onFilterChange 
}: EscrowFilterBarProps) => {
  const toggleFilter = (filterId: string) => {
    const newFilters = activeFilters.includes(filterId)
      ? activeFilters.filter(f => f !== filterId)
      : [...activeFilters, filterId]
    onFilterChange(newFilters)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by escrow ID or participant address..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-400" />
        {statusFilters.map((filter) => (
          <Button
            key={filter.id}
            variant={activeFilters.includes(filter.id) ? "secondary" : "ghost"}
            size="sm"
            onClick={() => toggleFilter(filter.id)}
            className={`${filter.color} ${
              activeFilters.includes(filter.id) ? 'bg-cyberpunk-500/20' : ''
            }`}
          >
            {filter.label}
          </Button>
        ))}
      </div>
    </div>
  )
}