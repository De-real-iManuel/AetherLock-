import * as React from "react"
import { Button } from "@/components/ui/button"
import { WalletButton } from "@/components/wallet/wallet-button"
import { useThemeStore } from "@/store/themeStore"
import { Moon, Sun, Settings } from "lucide-react"

export const DashboardHeader = () => {
  const { isDark, toggleTheme } = useThemeStore()

  return (
    <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-display font-bold text-cyberpunk-400">
            AetherLock
          </h1>
          <div className="text-sm text-slate-400">
            Dashboard
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-slate-400 hover:text-white"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-white"
          >
            <Settings className="h-4 w-4" />
          </Button>
          
          <WalletButton />
        </div>
      </div>
    </header>
  )
}