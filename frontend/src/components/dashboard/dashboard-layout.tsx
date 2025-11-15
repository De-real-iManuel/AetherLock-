import * as React from "react"
import { DashboardHeader } from "./dashboard-header"
import { DashboardSidebar } from "./dashboard-sidebar"
import { PageTransition } from "@/components/ui/page-transition"
import { websocketService } from "@/services/websocketService"
import { WEBSOCKET_URL } from "@/config/constants"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [activeTab, setActiveTab] = React.useState('escrows')

  React.useEffect(() => {
    websocketService.connect(WEBSOCKET_URL)
    return () => websocketService.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-black">
      <DashboardHeader />
      <div className="flex">
        <DashboardSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
        <main className="flex-1 p-6">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  )
}