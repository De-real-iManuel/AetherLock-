import { motion } from 'framer-motion';
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  DollarSign, 
  MessageSquare,
  Clock,
  Upload
} from 'lucide-react';

export interface Activity {
  id: string;
  type: 'escrow_accepted' | 'work_submitted' | 'ai_verified' | 'funds_released' | 'dispute_opened' | 'message_received' | 'deadline_approaching';
  title: string;
  description: string;
  timestamp: Date;
  escrowId?: string;
  status?: 'success' | 'warning' | 'error' | 'info';
}

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
}

const ActivityFeed = ({ activities, maxItems = 10 }: ActivityFeedProps) => {
  // Get icon based on activity type
  const getActivityIcon = (type: Activity['type']) => {
    const iconClass = "w-5 h-5";
    
    switch (type) {
      case 'escrow_accepted':
        return <FileText className={iconClass} />;
      case 'work_submitted':
        return <Upload className={iconClass} />;
      case 'ai_verified':
        return <CheckCircle className={iconClass} />;
      case 'funds_released':
        return <DollarSign className={iconClass} />;
      case 'dispute_opened':
        return <AlertCircle className={iconClass} />;
      case 'message_received':
        return <MessageSquare className={iconClass} />;
      case 'deadline_approaching':
        return <Clock className={iconClass} />;
      default:
        return <FileText className={iconClass} />;
    }
  };

  // Get color scheme based on activity status
  const getActivityColors = (status?: Activity['status']) => {
    switch (status) {
      case 'success':
        return {
          bg: 'bg-green-500/20',
          border: 'border-green-500/30',
          text: 'text-green-400',
          glow: 'shadow-green-500/20'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/30',
          text: 'text-yellow-400',
          glow: 'shadow-yellow-500/20'
        };
      case 'error':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500/30',
          text: 'text-red-400',
          glow: 'shadow-red-500/20'
        };
      case 'info':
      default:
        return {
          bg: 'bg-cyan-500/20',
          border: 'border-cyan-500/30',
          text: 'text-cyan-400',
          glow: 'shadow-cyan-500/20'
        };
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  // Limit activities to maxItems
  const displayedActivities = activities.slice(0, maxItems);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6"
    >
      <h3 className="text-xl font-bold text-cyan-400 mb-6">Recent Activity</h3>

      {displayedActivities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedActivities.map((activity, index) => {
            const colors = getActivityColors(activity.status);
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex items-start gap-4 p-4 rounded-lg border ${colors.border} ${colors.bg} hover:${colors.glow} transition-all cursor-pointer group`}
              >
                {/* Icon */}
                <div className={`p-2 rounded-lg ${colors.bg} border ${colors.border} ${colors.text} group-hover:scale-110 transition-transform`}>
                  {getActivityIcon(activity.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`font-semibold ${colors.text} group-hover:underline`}>
                      {activity.title}
                    </h4>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                    {activity.description}
                  </p>
                  {activity.escrowId && (
                    <p className="text-xs text-gray-500 mt-2">
                      Escrow ID: {activity.escrowId.slice(0, 8)}...
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Show more indicator */}
      {activities.length > maxItems && (
        <div className="mt-4 pt-4 border-t border-gray-700/50 text-center">
          <p className="text-sm text-gray-400">
            Showing {maxItems} of {activities.length} activities
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ActivityFeed;
