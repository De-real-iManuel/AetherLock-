import * as React from 'react';
import { escrowAPI } from '@/lib/api';

interface Escrow {
  id: string;
  title: string;
  amount: number;
  status: 'pending' | 'active' | 'verified' | 'released' | 'disputed';
  buyer: string;
  seller: string;
  createdAt: Date;
}

interface EscrowContextType {
  escrows: Escrow[];
  activeEscrow: Escrow | null;
  loading: boolean;
  createEscrow: (data: any) => Promise<string>;
  setActiveEscrow: (id: string) => void;
  refreshEscrows: () => Promise<void>;
}

const EscrowContext = React.createContext<EscrowContextType | null>(null);

export const EscrowProvider = ({ children }: { children: React.ReactNode }) => {
  const [escrows, setEscrows] = React.useState<Escrow[]>([]);
  const [activeEscrow, setActiveEscrowState] = React.useState<Escrow | null>(null);
  const [loading, setLoading] = React.useState(false);

  const createEscrow = async (data: any) => {
    setLoading(true);
    try {
      const response = await escrowAPI.create(data);
      return response.escrowId;
    } finally {
      setLoading(false);
    }
  };

  const setActiveEscrow = (id: string) => {
    const escrow = escrows.find(e => e.id === id);
    setActiveEscrowState(escrow || null);
  };

  const refreshEscrows = async () => {
    setLoading(true);
    try {
      // Fetch escrows from API
    } finally {
      setLoading(false);
    }
  };

  return (
    <EscrowContext.Provider value={{ escrows, activeEscrow, loading, createEscrow, setActiveEscrow, refreshEscrows }}>
      {children}
    </EscrowContext.Provider>
  );
};

export const useEscrow = () => {
  const context = React.useContext(EscrowContext);
  if (!context) throw new Error('useEscrow must be used within EscrowProvider');
  return context;
};