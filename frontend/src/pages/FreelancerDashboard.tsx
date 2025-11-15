import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  Clock, 
  DollarSign,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useEscrowStore } from '../stores/escrowStore';
import { useDebounce } from '../hooks/useDebounce';
import EarningsSummary from '../components/dashboard/EarningsSummary';
import ActivityFeed, { Activity } from '../components/dashboard/ActivityFeed';
import { EscrowStatusCard } from '../components/escrow/EscrowStatusCard';
import type { Escrow } from '../types/models';

interface FilterOptions {
  minAmount: number;
  maxAmount: number;
  deadline: 'all' | '7d' | '30d' | '90d';
  skills: string[];
}

const FreelancerDashboard = () => {
  const { user } = useUserStore();
  const { escrows } = useEscrowStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // Debounce search by 300ms
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    minAmount: 0,
    maxAmount: 10000,
    deadline: 'all',
    skills: []
  });

  // Fetch freelancer's escrows and available tasks
  const { data: freelancerData, isLoading } = useQuery({
    queryKey: ['freelancer-dashboard', user?.address],
    queryFn: async () => {
      // Fetch data from store and compute dashboard metrics
      const activeJobs = escrows.filter(e => 
        e.freelancerAddress === user?.address && 
        ['active', 'ai_reviewing'].includes(e.status)
      );
      
      const availableTasks = escrows.filter(e => 
        e.status === 'pending' && 
        !e.freelancerAddress
      );
      
      const pendingAmount = escrows
        .filter(e => e.freelancerAddress === user?.address && e.status === 'ai_reviewing')
        .reduce((sum, e) => sum + e.amount, 0);
      
      return {
        activeJobs,
        availableTasks,
        earnings: {
          total: user?.totalEarned || 0,
          pending: pendingAmount,
          successRate: user?.successRate || 0
        },
        activities: generateMockActivities()
      };
    },
    enabled: !!user?.address,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  // Filter available tasks
  const filteredTasks = useMemo(() => {
    if (!freelancerData?.availableTasks) return [];
    
    let filtered = freelancerData.availableTasks;

    // Search filter (using debounced value for better performance)
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      );
    }

    // Amount filter
    filtered = filtered.filter(task =>
      task.amount >= filters.minAmount &&
      task.amount <= filters.maxAmount
    );

    // Deadline filter
    if (filters.deadline !== 'all') {
      const now = new Date();
      const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
      const days = daysMap[filters.deadline];
      const cutoffDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      
      filtered = filtered.filter(task =>
        new Date(task.deadline) <= cutoffDate
      );
    }

    return filtered;
  }, [freelancerData?.availableTasks, debouncedSearchQuery, filters]);

  // Calculate time remaining for deadlines
  const getTimeRemaining = (deadline: Date) => {
    const now = new Date();
    const diff = new Date(deadline).getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Calculate milestone progress
  const getMilestoneProgress = (escrow: Escrow) => {
    const completed = escrow.milestones.filter(m => m.status === 'completed').length;
    const total = escrow.milestones.length;
    return (completed / total) * 100;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            Freelancer Dashboard
          </h1>
          <p className="text-gray-400 mt-2">
            Welcome back, {user?.name || 'Freelancer'}! Find new opportunities and manage your active jobs.
          </p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500/20 rounded-lg">
                <Briefcase className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Active Jobs</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {freelancerData?.activeJobs.length || 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Search className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Available Tasks</p>
                <p className="text-2xl font-bold text-purple-400">
                  {filteredTasks.length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Earned</p>
                <p className="text-2xl font-bold text-green-400">
                  {freelancerData?.earnings.total.toFixed(2) || '0.00'} SOL
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900/50 backdrop-blur-sm border border-yellow-500/30 rounded-lg p-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Success Rate</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {freelancerData?.earnings.successRate.toFixed(1) || '0.0'}%
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Available Tasks & Active Jobs */}
          <div className="lg:col-span-2 space-y-8">
            {/* Available Tasks Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-cyan-400">Available Tasks</h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/10 transition-all"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
              </div>

              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-6 bg-gray-900/50 border border-cyan-500/30 rounded-lg"
                >
                  <h3 className="text-lg font-semibold text-cyan-400 mb-4">Filter Options</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Amount Range */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Min Amount (SOL)</label>
                      <input
                        type="number"
                        value={filters.minAmount}
                        onChange={(e) => setFilters({ ...filters, minAmount: Number(e.target.value) })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Max Amount (SOL)</label>
                      <input
                        type="number"
                        value={filters.maxAmount}
                        onChange={(e) => setFilters({ ...filters, maxAmount: Number(e.target.value) })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    {/* Deadline Filter */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Deadline</label>
                      <select
                        value={filters.deadline}
                        onChange={(e) => setFilters({ ...filters, deadline: e.target.value as FilterOptions['deadline'] })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="all">All</option>
                        <option value="7d">Within 7 days</option>
                        <option value="30d">Within 30 days</option>
                        <option value="90d">Within 90 days</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tasks Grid */}
              <div className="grid grid-cols-1 gap-4">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-12 bg-gray-900/50 border border-cyan-500/30 rounded-lg">
                    <p className="text-gray-400">No available tasks found</p>
                  </div>
                ) : (
                  filteredTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <EscrowStatusCard
                        escrow={task}
                        userRole="freelancer"
                        onViewDetails={() => console.log('View details:', task.id)}
                      />
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Active Jobs Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="text-2xl font-bold text-purple-400 mb-6">Active Jobs</h2>
              
              <div className="space-y-4">
                {!freelancerData?.activeJobs.length ? (
                  <div className="text-center py-12 bg-gray-900/50 border border-purple-500/30 rounded-lg">
                    <p className="text-gray-400">No active jobs</p>
                  </div>
                ) : (
                  freelancerData.activeJobs.map((job) => {
                    const progress = getMilestoneProgress(job);
                    const timeRemaining = getTimeRemaining(job.deadline);
                    
                    return (
                      <div
                        key={job.id}
                        className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 hover:border-purple-500/50 transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-purple-400">{job.title}</h3>
                            <p className="text-gray-400 text-sm mt-1">{job.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-purple-400">{job.amount} {job.currency}</p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Progress</span>
                            <span className="text-sm font-medium text-purple-400">{progress.toFixed(0)}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full"
                            />
                          </div>
                        </div>

                        {/* Deadline Countdown */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-yellow-400">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">Deadline: {timeRemaining}</span>
                          </div>
                          <button className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/30 transition-all">
                            Submit Work
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Earnings & Activity */}
          <div className="space-y-8">
            {/* Earnings Summary */}
            <EarningsSummary
              totalEarned={freelancerData?.earnings.total || 0}
              pendingPayments={freelancerData?.earnings.pending || 0}
              successRate={freelancerData?.earnings.successRate || 0}
            />

            {/* Activity Feed */}
            <ActivityFeed
              activities={freelancerData?.activities || []}
              maxItems={10}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Generate mock activities for demonstration
const generateMockActivities = (): Activity[] => {
  return [
    {
      id: '1',
      type: 'escrow_accepted',
      title: 'New Job Accepted',
      description: 'You accepted the escrow "Build Landing Page"',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      status: 'success'
    },
    {
      id: '2',
      type: 'work_submitted',
      title: 'Work Submitted',
      description: 'Your submission for "Mobile App Design" is under AI review',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      status: 'info'
    },
    {
      id: '3',
      type: 'ai_verified',
      title: 'AI Verification Passed',
      description: 'Your work on "Logo Design" passed AI verification with 95% confidence',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      status: 'success'
    },
    {
      id: '4',
      type: 'funds_released',
      title: 'Payment Received',
      description: 'You received 5.5 SOL for "Website Development"',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      status: 'success'
    },
    {
      id: '5',
      type: 'deadline_approaching',
      title: 'Deadline Approaching',
      description: 'Only 2 days left to submit "Content Writing" project',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      status: 'warning'
    }
  ];
};

export default FreelancerDashboard;
