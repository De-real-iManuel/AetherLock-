import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Plus, Wallet, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EscrowTable } from '@/components/escrow/EscrowTable';
import TransactionChart from '@/components/dashboard/TransactionChart';
import { useWalletStore } from '@/stores/walletStore';
import { useEscrowStore } from '@/stores/escrowStore';
import { cn } from '@/lib/utils';
import type { Escrow } from '@/types/models';

// Animated counter component
const AnimatedCounter = ({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000; // 1 second
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {prefix}{displayValue.toFixed(2)}{suffix}
    </span>
  );
};

// Dispute countdown timer component
const DisputeCountdown = ({ deadline }: { deadline: Date }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(deadline).getTime();
      return Math.max(0, end - now);
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const isUrgent = timeLeft < 24 * 60 * 60 * 1000; // Less than 24 hours

  return (
    <div className={cn(
      "flex items-center gap-2 text-sm font-mono",
      isUrgent ? "text-red-400" : "text-yellow-400"
    )}>
      <Clock className="w-4 h-4" />
      <span>
        {days > 0 && `${days}d `}
        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};

const ClientDashboard = () => {
  const { address, balance } = useWalletStore();
  const { escrows, setEscrows } = useEscrowStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch client's escrows using React Query
  const { data: clientEscrows, isLoading, error } = useQuery({
    queryKey: ['client-escrows', address],
    queryFn: async () => {
      // TODO: Replace with actual API call
      // const response = await api.get(`/api/escrow/list?clientAddress=${address}`);
      // return response.data;
      
      // Mock data for now
      const mockEscrows: Escrow[] = [
        {
          id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
          title: 'Website Redesign Project',
          description: 'Complete redesign of company website with modern UI/UX',
          amount: 5000,
          currency: 'USDC',
          status: 'active',
          clientAddress: address || '',
          freelancerAddress: '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin',
          createdAt: new Date('2024-01-15'),
          deadline: new Date('2024-03-15'),
          milestones: [
            {
              id: 'm1',
              title: 'Design mockups',
              description: 'Create initial design mockups',
              percentage: 30,
              amount: 1500,
              deadline: new Date('2024-02-01'),
              status: 'completed'
            },
            {
              id: 'm2',
              title: 'Frontend development',
              description: 'Implement frontend',
              percentage: 50,
              amount: 2500,
              deadline: new Date('2024-02-28'),
              status: 'in_progress'
            },
            {
              id: 'm3',
              title: 'Testing and deployment',
              description: 'Final testing and deployment',
              percentage: 20,
              amount: 1000,
              deadline: new Date('2024-03-15'),
              status: 'pending'
            }
          ],
          submissions: []
        },
        {
          id: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
          title: 'Mobile App Development',
          description: 'Build cross-platform mobile app',
          amount: 8000,
          currency: 'SOL',
          status: 'ai_reviewing',
          clientAddress: address || '',
          freelancerAddress: '5xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin',
          createdAt: new Date('2024-01-20'),
          deadline: new Date('2024-04-20'),
          milestones: [],
          submissions: [],
          aiVerification: {
            passed: true,
            confidence: 85,
            feedback: 'Work meets requirements with high quality',
            timestamp: new Date(),
            analysisDetails: {
              qualityScore: 90,
              completenessScore: 85,
              accuracyScore: 80,
              suggestions: []
            }
          }
        },
        {
          id: '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r',
          title: 'Logo Design',
          description: 'Create modern logo for brand',
          amount: 500,
          currency: 'USDC',
          status: 'disputed',
          clientAddress: address || '',
          freelancerAddress: '7xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin',
          createdAt: new Date('2024-02-01'),
          deadline: new Date('2024-02-15'),
          milestones: [],
          submissions: [],
          disputeInfo: {
            id: 'd1',
            escrowId: '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r',
            initiatedBy: 'client',
            reason: 'Design does not match requirements',
            evidence: [],
            status: 'open',
            deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
          }
        },
        {
          id: '4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s',
          title: 'Content Writing',
          description: 'Write 10 blog posts',
          amount: 1200,
          currency: 'USDC',
          status: 'completed',
          clientAddress: address || '',
          freelancerAddress: '8xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin',
          createdAt: new Date('2024-01-10'),
          deadline: new Date('2024-02-10'),
          milestones: [],
          submissions: []
        }
      ];
      
      return mockEscrows;
    },
    enabled: !!address
  });

  // Update store when data is fetched
  useEffect(() => {
    if (clientEscrows) {
      setEscrows(clientEscrows);
    }
  }, [clientEscrows, setEscrows]);

  // Calculate statistics
  const stats = {
    totalEscrows: clientEscrows?.length || 0,
    activeEscrows: clientEscrows?.filter(e => e.status === 'active').length || 0,
    completedEscrows: clientEscrows?.filter(e => e.status === 'completed').length || 0,
    totalSpent: clientEscrows?.reduce((sum, e) => sum + (e.status === 'completed' ? e.amount : 0), 0) || 0
  };

  // Get disputed escrows with active countdowns
  const disputedEscrows = clientEscrows?.filter(e => e.status === 'disputed' && e.disputeInfo) || [];

  // Handle row click
  const handleRowClick = (escrow: Escrow) => {
    console.log('View escrow details:', escrow);
    // TODO: Navigate to escrow details page
  };

  // Handle create escrow
  const handleCreateEscrow = () => {
    console.log('Create new escrow');
    // TODO: Open escrow creation wizard
    setShowCreateModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              Client Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Manage your escrow agreements and track spending</p>
          </div>
          
          <Button
            onClick={handleCreateEscrow}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Escrow
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Balance Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Wallet Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-cyan-400">
                  <AnimatedCounter value={balance} prefix="$" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Available funds</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Total Escrows */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Total Escrows
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-400">
                  {stats.totalEscrows}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.activeEscrows} active
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Completed */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400">
                  {stats.completedEscrows}
                </div>
                <p className="text-xs text-gray-500 mt-1">Successfully finished</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Total Spent */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Total Spent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-pink-400">
                  <AnimatedCounter value={stats.totalSpent} prefix="$" />
                </div>
                <p className="text-xs text-gray-500 mt-1">On completed projects</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Dispute Countdown Timers */}
        <AnimatePresence>
          {disputedEscrows.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              {disputedEscrows.map((escrow) => (
                <Card key={escrow.id} className="border-red-500/30 bg-red-900/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <div>
                          <p className="font-semibold text-white">{escrow.title}</p>
                          <p className="text-sm text-gray-400">Dispute resolution deadline</p>
                        </div>
                      </div>
                      {escrow.disputeInfo && (
                        <DisputeCountdown deadline={escrow.disputeInfo.deadline} />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transaction Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <TransactionChart />
        </motion.div>

        {/* Escrow Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {isLoading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-400">Loading escrows...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="border-red-500/30">
              <CardContent className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-400">Failed to load escrows</p>
                <p className="text-gray-500 text-sm mt-2">Please try again later</p>
              </CardContent>
            </Card>
          ) : (
            <EscrowTable
              escrows={clientEscrows || []}
              onRowClick={handleRowClick}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ClientDashboard;
