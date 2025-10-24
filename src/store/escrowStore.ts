import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface Escrow {
  id: string
  buyer: string
  seller: string
  amount: number
  token: string
  status: 'pending' | 'active' | 'completed' | 'disputed' | 'cancelled'
  description: string
  deadline: Date
  createdAt: Date
  evidenceHash?: string
  aiVerification?: {
    status: 'pending' | 'verified' | 'failed'
    confidence: number
    timestamp: Date
  }
}

interface EscrowState {
  escrows: Escrow[]
  selectedEscrow: Escrow | null
  isLoading: boolean
  error: string | null
  filters: {
    status: string[]
    search: string
  }
}

interface EscrowActions {
  setEscrows: (escrows: Escrow[]) => void
  addEscrow: (escrow: Escrow) => void
  updateEscrow: (id: string, updates: Partial<Escrow>) => void
  selectEscrow: (escrow: Escrow | null) => void
  setFilters: (filters: Partial<EscrowState['filters']>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

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
        search: ''
      },

      // Actions
      setEscrows: (escrows) => set({ escrows }),
      
      addEscrow: (escrow) => 
        set(state => ({ escrows: [...state.escrows, escrow] })),
      
      updateEscrow: (id, updates) =>
        set(state => ({
          escrows: state.escrows.map(escrow =>
            escrow.id === id ? { ...escrow, ...updates } : escrow
          )
        })),
      
      selectEscrow: (escrow) => set({ selectedEscrow: escrow }),
      
      setFilters: (filters) =>
        set(state => ({ filters: { ...state.filters, ...filters } })),
      
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error })
    }),
    { name: 'escrow-store' }
  )
)