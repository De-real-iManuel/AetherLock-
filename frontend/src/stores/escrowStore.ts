import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Escrow } from '../types/models'

/**
 * Escrow Store State
 * Manages escrow agreements and filtering
 */
interface EscrowState {
  escrows: Escrow[]
  selectedEscrow: Escrow | null
  isLoading: boolean
  error: string | null
  filters: {
    status: Array<'pending' | 'active' | 'ai_reviewing' | 'completed' | 'disputed' | 'cancelled'>
    search: string
    sortBy: 'createdAt' | 'deadline' | 'amount' | 'title'
    sortOrder: 'asc' | 'desc'
  }
}

/**
 * Escrow Store Actions
 * Actions for creating, updating, and filtering escrows
 */
interface EscrowActions {
  setEscrows: (escrows: Escrow[]) => void
  addEscrow: (escrow: Escrow) => void
  updateEscrow: (id: string, updates: Partial<Escrow>) => void
  removeEscrow: (id: string) => void
  selectEscrow: (escrow: Escrow | null) => void
  setFilters: (filters: Partial<EscrowState['filters']>) => void
  setSortBy: (sortBy: EscrowState['filters']['sortBy']) => void
  setSortOrder: (sortOrder: 'asc' | 'desc') => void
  toggleSortOrder: () => void
  filterByStatus: (status: EscrowState['filters']['status']) => void
  searchEscrows: (query: string) => void
  getFilteredEscrows: () => Escrow[]
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

/**
 * Escrow Store
 * Zustand store for managing escrow agreements
 * Implements sorting and status filtering logic
 */
export const useEscrowStore = create<EscrowState & EscrowActions>()(
  devtools(
    (set, get) => ({
      // State
      escrows: [],
      selectedEscrow: null,
      isLoading: false,
      error: null,
      filters: {
        status: [],
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      },

      // Actions
      setEscrows: (escrows) => set({ escrows, error: null }),
      
      addEscrow: (escrow) => 
        set((state) => ({ 
          escrows: [...state.escrows, escrow],
          error: null
        })),
      
      updateEscrow: (id, updates) =>
        set((state) => ({
          escrows: state.escrows.map((escrow) =>
            escrow.id === id ? { ...escrow, ...updates } : escrow
          ),
          selectedEscrow: state.selectedEscrow?.id === id 
            ? { ...state.selectedEscrow, ...updates }
            : state.selectedEscrow
        })),
      
      removeEscrow: (id) =>
        set((state) => ({
          escrows: state.escrows.filter((escrow) => escrow.id !== id),
          selectedEscrow: state.selectedEscrow?.id === id ? null : state.selectedEscrow
        })),
      
      selectEscrow: (escrow) => set({ selectedEscrow: escrow }),
      
      setFilters: (filters) =>
        set((state) => ({ 
          filters: { ...state.filters, ...filters } 
        })),
      
      setSortBy: (sortBy) =>
        set((state) => ({
          filters: { ...state.filters, sortBy }
        })),
      
      setSortOrder: (sortOrder) =>
        set((state) => ({
          filters: { ...state.filters, sortOrder }
        })),
      
      toggleSortOrder: () =>
        set((state) => ({
          filters: { 
            ...state.filters, 
            sortOrder: state.filters.sortOrder === 'asc' ? 'desc' : 'asc'
          }
        })),
      
      filterByStatus: (status) =>
        set((state) => ({
          filters: { ...state.filters, status }
        })),
      
      searchEscrows: (query) =>
        set((state) => ({
          filters: { ...state.filters, search: query }
        })),
      
      getFilteredEscrows: () => {
        const { escrows, filters } = get()
        let filtered = [...escrows]
        
        // Filter by status
        if (filters.status.length > 0) {
          filtered = filtered.filter((escrow) => 
            filters.status.includes(escrow.status)
          )
        }
        
        // Filter by search query
        if (filters.search) {
          const query = filters.search.toLowerCase()
          filtered = filtered.filter((escrow) =>
            escrow.title.toLowerCase().includes(query) ||
            escrow.description.toLowerCase().includes(query) ||
            escrow.clientAddress.toLowerCase().includes(query) ||
            escrow.freelancerAddress?.toLowerCase().includes(query)
          )
        }
        
        // Sort escrows
        filtered.sort((a, b) => {
          const { sortBy, sortOrder } = filters
          let comparison = 0
          
          switch (sortBy) {
            case 'createdAt':
              comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              break
            case 'deadline':
              comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
              break
            case 'amount':
              comparison = a.amount - b.amount
              break
            case 'title':
              comparison = a.title.localeCompare(b.title)
              break
          }
          
          return sortOrder === 'asc' ? comparison : -comparison
        })
        
        return filtered
      },
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      reset: () => set({
        escrows: [],
        selectedEscrow: null,
        isLoading: false,
        error: null,
        filters: {
          status: [],
          search: '',
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      })
    }),
    { name: 'escrow-store' }
  )
)
