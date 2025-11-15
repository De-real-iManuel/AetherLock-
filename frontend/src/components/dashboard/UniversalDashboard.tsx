import * as React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface UniversalDashboardProps {
  userRole: 'client' | 'freelancer';
  userAddress: string;
  chain: string;
}

const UniversalDashboard = React.forwardRef<HTMLDivElement, UniversalDashboardProps>(
  ({ userRole, userAddress, chain }, ref) => {
    const [escrows, setEscrows] = React.useState([]);
    const [stats, setStats] = React.useState({
      totalEscrows: 0,
      activeEscrows: 0,
      completedEscrows: 0,
      totalValue: 0
    });
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
      loadDashboardData();
    }, [userAddress, chain]);

    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // Load escrows and stats
        const response = await fetch(`/api/escrow/list?address=${userAddress}&chain=${chain}`);
        const data = await response.json();
        
        if (data.success) {
          setEscrows(data.escrows || []);
          setStats(data.stats || stats);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const getChainIcon = (chainName: string) => {
      const icons = {
        solana: '◎',
        zetachain: 'Ζ',
        sui: '🌊',
        ton: '💎'
      };
      return icons[chainName] || '⛓️';
    };

    const getStatusColor = (status: string) => {
      const colors = {
        active: 'bg-green-500',
        pending: 'bg-yellow-500',
        completed: 'bg-blue-500',
        disputed: 'bg-red-500',
        failed: 'bg-gray-500'
      };
      return colors[status] || 'bg-gray-500';
    };

    if (isLoading) {
      return (
        <div ref={ref} className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-400">Loading your dashboard...</p>
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {userRole === 'client' ? 'Client Dashboard' : 'Freelancer Dashboard'}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-slate-400">Connected to</span>
              <Badge variant="outline" className="border-cyan-500 text-cyan-400">
                {getChainIcon(chain)} {chain.toUpperCase()}
              </Badge>
            </div>
          </div>
          <Button className="bg-cyan-600 hover:bg-cyan-700">
            {userRole === 'client' ? 'Create Escrow' : 'Browse Jobs'}
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Escrows', value: stats.totalEscrows, icon: '📊' },
            { label: 'Active', value: stats.activeEscrows, icon: '🔄' },
            { label: 'Completed', value: stats.completedEscrows, icon: '✅' },
            { label: 'Total Value', value: `$${stats.totalValue.toLocaleString()}`, icon: '💰' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4 border-slate-700 bg-slate-900/50">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{stat.icon}</span>
                  <div>
                    <p className="text-sm text-slate-400">{stat.label}</p>
                    <p className="text-xl font-semibold text-white">{stat.value}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Escrows List */}
        <Card className="border-slate-700 bg-slate-900/50">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              {userRole === 'client' ? 'Your Escrows' : 'Your Assignments'}
            </h2>
            
            {escrows.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📭</div>
                <p className="text-slate-400 mb-4">
                  {userRole === 'client' 
                    ? 'No escrows created yet' 
                    : 'No assignments found'
                  }
                </p>
                <Button variant="outline" className="border-cyan-500 text-cyan-400">
                  {userRole === 'client' ? 'Create Your First Escrow' : 'Browse Available Jobs'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {escrows.map((escrow, index) => (
                  <motion.div
                    key={escrow.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-white">{escrow.title}</h3>
                          <Badge 
                            variant="outline" 
                            className={`${getStatusColor(escrow.status)} text-white border-0`}
                          >
                            {escrow.status}
                          </Badge>
                          <Badge variant="outline" className="border-slate-600 text-slate-300">
                            {getChainIcon(escrow.sourceChain)} → {getChainIcon(escrow.destinationChain)}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400 mb-2">{escrow.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                          <span>Amount: ${escrow.amount}</span>
                          <span>Created: {new Date(escrow.createdAt).toLocaleDateString()}</span>
                          {escrow.deadline && (
                            <span>Deadline: {new Date(escrow.deadline).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className="border-slate-600">
                          View Details
                        </Button>
                        {escrow.status === 'active' && (
                          <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                            {userRole === 'client' ? 'Manage' : 'Submit Work'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border-slate-700 bg-slate-900/50 cursor-pointer hover:border-cyan-500 transition-colors">
            <div className="text-center space-y-2">
              <div className="text-2xl">🤖</div>
              <h3 className="font-medium text-white">AI Verification</h3>
              <p className="text-xs text-slate-400">Submit work for AI review</p>
            </div>
          </Card>
          
          <Card className="p-4 border-slate-700 bg-slate-900/50 cursor-pointer hover:border-cyan-500 transition-colors">
            <div className="text-center space-y-2">
              <div className="text-2xl">⚖️</div>
              <h3 className="font-medium text-white">Dispute Center</h3>
              <p className="text-xs text-slate-400">Resolve conflicts fairly</p>
            </div>
          </Card>
          
          <Card className="p-4 border-slate-700 bg-slate-900/50 cursor-pointer hover:border-cyan-500 transition-colors">
            <div className="text-center space-y-2">
              <div className="text-2xl">📊</div>
              <h3 className="font-medium text-white">Analytics</h3>
              <p className="text-xs text-slate-400">Track your performance</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }
);

UniversalDashboard.displayName = 'UniversalDashboard';

export { UniversalDashboard };