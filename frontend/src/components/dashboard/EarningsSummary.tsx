import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, CheckCircle } from 'lucide-react';

interface EarningsSummaryProps {
  totalEarned: number;
  pendingPayments: number;
  successRate: number;
  currency?: string;
}

const EarningsSummary = ({ 
  totalEarned, 
  pendingPayments, 
  successRate,
  currency = 'SOL'
}: EarningsSummaryProps) => {
  const [animatedEarned, setAnimatedEarned] = useState(0);
  const [animatedPending, setAnimatedPending] = useState(0);
  const [animatedRate, setAnimatedRate] = useState(0);

  // Animated counter effect
  useEffect(() => {
    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const earnedIncrement = totalEarned / steps;
    const pendingIncrement = pendingPayments / steps;
    const rateIncrement = successRate / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        setAnimatedEarned(earnedIncrement * currentStep);
        setAnimatedPending(pendingIncrement * currentStep);
        setAnimatedRate(rateIncrement * currentStep);
      } else {
        setAnimatedEarned(totalEarned);
        setAnimatedPending(pendingPayments);
        setAnimatedRate(successRate);
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [totalEarned, pendingPayments, successRate]);

  // Get success rate color and status
  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-400';
    if (rate >= 70) return 'text-cyan-400';
    if (rate >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSuccessRateStatus = (rate: number) => {
    if (rate >= 90) return 'Excellent';
    if (rate >= 70) return 'Good';
    if (rate >= 50) return 'Average';
    return 'Needs Improvement';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6"
    >
      <h3 className="text-xl font-bold text-cyan-400 mb-6">Earnings Summary</h3>

      <div className="space-y-6">
        {/* Total Earned */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
              <DollarSign className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Earned</p>
              <p className="text-3xl font-bold text-cyan-400">
                {animatedEarned.toFixed(2)} {currency}
              </p>
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pending Payments</p>
              <p className="text-3xl font-bold text-purple-400">
                {animatedPending.toFixed(2)} {currency}
              </p>
            </div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/20 rounded-lg border border-green-500/30">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-gray-400 text-sm">Success Rate</p>
              <div className="flex items-center gap-3">
                <p className={`text-3xl font-bold ${getSuccessRateColor(animatedRate)}`}>
                  {animatedRate.toFixed(1)}%
                </p>
                <span className={`text-sm ${getSuccessRateColor(animatedRate)}`}>
                  {getSuccessRateStatus(animatedRate)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar for Success Rate */}
        <div className="pt-4 border-t border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Performance</span>
            <span className={`text-sm font-medium ${getSuccessRateColor(animatedRate)}`}>
              {animatedRate.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${animatedRate}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                animatedRate >= 90 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                  : animatedRate >= 70
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-400'
                  : animatedRate >= 50
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-400'
                  : 'bg-gradient-to-r from-red-500 to-pink-400'
              }`}
              style={{
                boxShadow: `0 0 20px ${
                  animatedRate >= 90 
                    ? 'rgba(34, 197, 94, 0.5)'
                    : animatedRate >= 70
                    ? 'rgba(6, 182, 212, 0.5)'
                    : animatedRate >= 50
                    ? 'rgba(234, 179, 8, 0.5)'
                    : 'rgba(239, 68, 68, 0.5)'
                }`
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EarningsSummary;
