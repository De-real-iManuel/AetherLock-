import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useWalletStore } from "@/store/walletStore"
import { useKycStore } from "@/store/kycStore"
import { 
  Wallet, 
  Shield, 
  Plus, 
  FileText, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight 
} from "lucide-react"

interface DashboardSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export const DashboardSidebar = ({ activeTab, onTabChange }: DashboardSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const { balance, isConnected } = useWalletStore()
  const { isVerified } = useKycStore()

  const tabs = [
    { id: 'escrows', label: 'My Escrows', icon: FileText },
    { id: 'create', label: 'Create New', icon: Plus },
    { id: 'verification', label: 'Verification Logs', icon: Shield },
    { id: 'disputes', label: 'Disputes', icon: AlertTriangle }
  ]

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="border-r border-gray-800 bg-gray-900/30 backdrop-blur-sm"
    >
      <div className="p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mb-4 text-slate-400 hover:text-white"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>

        {!isCollapsed && isConnected && (
          <div className="mb-6 space-y-4">
            <div className="rounded-lg border border-cyberpunk-500/30 bg-cyberpunk-500/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4 text-cyberpunk-400" />
                <span className="text-sm font-medium text-white">Balance</span>
              </div>
              <div className="text-lg font-bold text-cyberpunk-400">
                {balance.toFixed(2)} SOL
              </div>
            </div>
            
            <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-medium text-white">KYC Status</span>
              </div>
              <div className={`text-sm font-medium ${
                isVerified ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {isVerified ? 'Verified' : 'Not Verified'}
              </div>
            </div>
          </div>
        )}

        <nav className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <Button
                key={tab.id}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 ${
                  isActive ? "bg-cyberpunk-500/20 text-cyberpunk-400" : "text-slate-400 hover:text-white"
                }`}
                onClick={() => onTabChange(tab.id)}
              >
                <Icon className="h-4 w-4" />
                {!isCollapsed && <span>{tab.label}</span>}
              </Button>
            )
          })}
        </nav>
      </div>
    </motion.aside>
  )
}