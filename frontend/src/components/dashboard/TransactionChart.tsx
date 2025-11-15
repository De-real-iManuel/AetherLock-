import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface TransactionData {
  date: string;
  amount: number;
}

interface TransactionChartProps {
  data?: TransactionData[];
}

type DateRange = '7d' | '30d' | '90d' | 'all';

const TransactionChart = ({ data = [] }: TransactionChartProps) => {
  const [selectedRange, setSelectedRange] = useState<DateRange>('30d');

  // Filter data based on selected range
  const filterDataByRange = (range: DateRange): TransactionData[] => {
    if (!data.length) return generateMockData(range);
    
    const now = new Date();
    const daysMap: Record<DateRange, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      'all': Infinity
    };
    
    const days = daysMap[range];
    if (days === Infinity) return data;
    
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return data.filter(item => new Date(item.date) >= cutoffDate);
  };

  // Generate mock data for demonstration
  const generateMockData = (range: DateRange): TransactionData[] => {
    const daysMap: Record<DateRange, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      'all': 180
    };
    
    const days = daysMap[range];
    const mockData: TransactionData[] = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      mockData.push({
        date: date.toISOString().split('T')[0],
        amount: Math.random() * 500 + 100
      });
    }
    
    return mockData;
  };

  const chartData = filterDataByRange(selectedRange);

  const dateRanges: { value: DateRange; label: string }[] = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: 'all', label: 'All Time' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-cyan-400">Transaction History</h3>
        
        {/* Date Range Selector */}
        <div className="flex gap-2">
          {dateRanges.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSelectedRange(value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedRange === value
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:border-cyan-500/30'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #06b6d4',
                borderRadius: '8px',
                color: '#fff'
              }}
              labelStyle={{ color: '#06b6d4' }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                });
              }}
            />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="#06b6d4" 
              strokeWidth={2}
              dot={{ fill: '#06b6d4', r: 4 }}
              activeDot={{ r: 6, fill: '#06b6d4' }}
              fill="url(#colorAmount)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-700/50">
        <div>
          <p className="text-gray-400 text-sm">Total Spent</p>
          <p className="text-2xl font-bold text-cyan-400">
            ${chartData.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Average</p>
          <p className="text-2xl font-bold text-purple-400">
            ${chartData.length > 0 
              ? (chartData.reduce((sum, item) => sum + item.amount, 0) / chartData.length).toFixed(2)
              : '0.00'
            }
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Transactions</p>
          <p className="text-2xl font-bold text-pink-400">{chartData.length}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default TransactionChart;
