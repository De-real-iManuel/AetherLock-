import * as React from "react"
import { Button } from "@/components/ui/button"
import { useWalletStore } from "@/store/walletStore"
import { WalletConnectionModal } from "./wallet-connection-modal"
import { Wallet, LogOut } from "lucide-react"

export const WalletButton = () => {
  const [showModal, setShowModal] = React.useState(false)
  const { isConnected, address, disconnect } = useWalletStore()

  const formatAddress = (addr: string) => 
    `${addr.slice(0, 4)}...${addr.slice(-4)}`

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm text-slate-300">
          {formatAddress(address)}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={disconnect}
          className="text-slate-400 hover:text-white"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <>
      <Button
        variant="cyber"
        onClick={() => setShowModal(true)}
        className="gap-2"
      >
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </Button>
      
      <WalletConnectionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  )
}