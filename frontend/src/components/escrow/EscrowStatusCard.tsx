import * as React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  Clock, 
  User, 
  DollarSign, 
  Upload, 
  CheckCircle, 
  AlertTriangle,
  MessageSquare,
  Calendar,
  TrendingUp
} from "lucide-react"
import type { Escrow } from "@/types/models"

// Status badge color mapping
const statusColors = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  active: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ai_reviewing: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  disputed: "bg-red-500/20 text-red-400 border-red-500/30",
  cancelled: "bg-gray-500/20 text-gray-400 border-gray-500/30"
}

// Status display names
const statusNames = {
  pending: "Pending",
  active: "Active",
  ai_reviewing: "AI Reviewing",
  completed: "Completed",
  disputed: "Disputed",
  cancelled: "Cancelled"
}

interface EscrowStatusCardProps {
  escrow: Escrow
  userRole: 'client' | 'freelancer'
  onViewDetails?: () => void
  onSubmitWork?: () => void
  onRelease?: () => void
  onDispute?: () => void
  onAccept?: () => void
  onChat?: () => void
}

const EscrowStatusCardComponent: React.FC<EscrowStatusCardProps> = ({
  escrow,
  userRole,
  onViewDetails,
  onSubmitWork,
  onRelease,
  onDispute,
  onAccept,
  onChat
}) => {
  // Calculate time remaining
  const timeLeft = Math.max(0, new Date(escrow.deadline).getTime() - Date.now())
  const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
  const hoursLeft = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  // Calculate milestone progress
  const completedMilestones = escrow.milestones.filter(m => m.status === 'completed').length
  const totalMilestones = escrow.milestones.length
  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0

  // Determine if user can perform actions
  const canSubmitWork = userRole === 'freelancer' && escrow.status === 'active'
  const canRelease = userRole === 'client' && (escrow.status === 'ai_reviewing' || escrow.aiVerification?.passed)
  const canDispute = userRole === 'client' && escrow.status === 'ai_reviewing'
  const canAccept = userRole === 'freelancer' && escrow.status === 'pending' && !escrow.freelancerAddress

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <Card className="cursor-pointer group h-full" onClick={onViewDetails}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold text-white truncate mb-1">
                {escrow.title}
              </CardTitle>
              <p className="text-xs text-slate-400 font-mono">
                #{escrow.id.slice(0, 8)}...{escrow.id.slice(-4)}
              </p>
            </div>
            <Badge className={cn("border", statusColors[escrow.status])}>
              {statusNames[escrow.status]}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Amount */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent-electric/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-accent-electric" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400">Total Amount</p>
              <p className="text-lg font-bold text-accent-electric">
                {escrow.amount} {escrow.currency}
              </p>
            </div>
          </div>

          {/* Participants */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-slate-400" />
              <span className="text-slate-400">Client:</span>
              <span className="text-white font-mono text-xs">
                {escrow.clientAddress.slice(0, 6)}...{escrow.clientAddress.slice(-4)}
              </span>
            </div>
            {escrow.freelancerAddress && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-slate-400" />
                <span className="text-slate-400">Freelancer:</span>
                <span className="text-white font-mono text-xs">
                  {escrow.freelancerAddress.slice(0, 6)}...{escrow.freelancerAddress.slice(-4)}
                </span>
              </div>
            )}
          </div>

          {/* Deadline */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-slate-400">Deadline:</span>
            <span className={cn(
              "font-medium",
              daysLeft < 3 ? "text-status-failed" : daysLeft < 7 ? "text-yellow-400" : "text-white"
            )}>
              {daysLeft > 0 ? `${daysLeft}d ${hoursLeft}h left` : 'Expired'}
            </span>
          </div>

          {/* Milestone Progress */}
          {totalMilestones > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Progress</span>
                <span className="text-white font-medium">
                  {completedMilestones}/{totalMilestones} milestones
                </span>
              </div>
              <div className="w-full h-2 bg-primary-surface rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-accent-electric to-accent-cyan"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          )}

          {/* AI Verification Status */}
          {escrow.aiVerification && (
            <div className="p-3 bg-primary-surface/50 border border-primary-border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {escrow.aiVerification.passed ? (
                    <CheckCircle className="h-4 w-4 text-status-verified" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-status-failed" />
                  )}
                  <span className="text-sm text-slate-300">AI Verification</span>
                </div>
                <span className={cn(
                  "text-sm font-semibold",
                  escrow.aiVerification.passed ? "text-status-verified" : "text-status-failed"
                )}>
                  {escrow.aiVerification.passed ? "Passed" : "Failed"} ({escrow.aiVerification.confidence}%)
                </span>
              </div>
            </div>
          )}

          {/* Dispute Info */}
          {escrow.disputeInfo && escrow.status === 'disputed' && (
            <div className="p-3 bg-status-failed/10 border border-status-failed/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-status-failed" />
                <span className="text-sm font-semibold text-status-failed">Dispute Active</span>
              </div>
              <p className="text-xs text-slate-400">
                Initiated by {escrow.disputeInfo.initiatedBy}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
            {canAccept && (
              <Button 
                className="w-full" 
                onClick={onAccept}
                variant="primary"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Accept Escrow
              </Button>
            )}

            {canSubmitWork && (
              <Button 
                className="w-full" 
                onClick={onSubmitWork}
                variant="primary"
              >
                <Upload className="w-4 h-4 mr-2" />
                Submit Work
              </Button>
            )}

            {canRelease && (
              <Button 
                className="w-full" 
                onClick={onRelease}
                variant="primary"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Release Funds
              </Button>
            )}

            {canDispute && (
              <Button 
                className="w-full" 
                onClick={onDispute}
                variant="destructive"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Open Dispute
              </Button>
            )}

            {(escrow.status === 'active' || escrow.status === 'ai_reviewing') && onChat && (
              <Button 
                className="w-full" 
                onClick={onChat}
                variant="outline"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </Button>
            )}
          </div>

          {/* Created Date */}
          <div className="pt-2 border-t border-primary-border">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="h-3 w-3" />
              <span>Created {new Date(escrow.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Memoize component to prevent unnecessary re-renders
export const EscrowStatusCard = React.memo(EscrowStatusCardComponent, (prevProps, nextProps) => {
  // Only re-render if escrow data or callbacks change
  return (
    prevProps.escrow.id === nextProps.escrow.id &&
    prevProps.escrow.status === nextProps.escrow.status &&
    prevProps.escrow.deadline === nextProps.escrow.deadline &&
    prevProps.userRole === nextProps.userRole &&
    JSON.stringify(prevProps.escrow.milestones) === JSON.stringify(nextProps.escrow.milestones)
  );
});
