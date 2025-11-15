import * as React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { type Escrow } from "@/store/escrowStore"
import { Clock, User, DollarSign } from "lucide-react"

interface EscrowCardProps {
  escrow: Escrow
  onSelect: (escrow: Escrow) => void
}

const statusColors = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  active: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  disputed: "bg-red-500/20 text-red-400 border-red-500/30",
  cancelled: "bg-gray-500/20 text-gray-400 border-gray-500/30"
}

export const EscrowCard = ({ escrow, onSelect }: EscrowCardProps) => {
  const timeLeft = Math.max(0, escrow.deadline.getTime() - Date.now())
  const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24))

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <Card className="cursor-pointer group" onClick={() => onSelect(escrow)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-mono">
              #{escrow.id.slice(0, 8)}
            </CardTitle>
            <Badge className={statusColors[escrow.status]}>
              {escrow.status}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-cyberpunk-400" />
            <span className="font-semibold text-cyberpunk-400">
              {escrow.amount} {escrow.token}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <User className="h-4 w-4" />
            <span>Seller: {escrow.seller.slice(0, 6)}...{escrow.seller.slice(-4)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Clock className="h-4 w-4" />
            <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}</span>
          </div>
          
          <p className="text-sm text-slate-300 line-clamp-2">
            {escrow.description}
          </p>
          
          {escrow.aiVerification && (
            <div className="pt-2 border-t border-gray-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">AI Verification</span>
                <span className={`font-medium ${
                  escrow.aiVerification.status === 'verified' ? 'text-green-400' :
                  escrow.aiVerification.status === 'failed' ? 'text-red-400' :
                  'text-yellow-400'
                }`}>
                  {escrow.aiVerification.status}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}