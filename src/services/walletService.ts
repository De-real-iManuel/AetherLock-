export interface WalletProvider {
  name: string
  icon: string
  connect: () => Promise<{ address: string; balance: number }>
  disconnect: () => Promise<void>
  isInstalled: () => boolean
}

class PhantomWallet implements WalletProvider {
  name = "Phantom"
  icon = "/icons/phantom.svg"

  isInstalled() {
    return typeof window !== 'undefined' && 'solana' in window
  }

  async connect() {
    if (!this.isInstalled()) throw new Error("Phantom not installed")
    
    const resp = await (window as any).solana.connect()
    return {
      address: resp.publicKey.toString(),
      balance: 0 // Will be fetched separately
    }
  }

  async disconnect() {
    await (window as any).solana.disconnect()
  }
}

class SolflareWallet implements WalletProvider {
  name = "Solflare"
  icon = "/icons/solflare.svg"

  isInstalled() {
    return typeof window !== 'undefined' && 'solflare' in window
  }

  async connect() {
    if (!this.isInstalled()) throw new Error("Solflare not installed")
    
    const resp = await (window as any).solflare.connect()
    return {
      address: resp.publicKey.toString(),
      balance: 0
    }
  }

  async disconnect() {
    await (window as any).solflare.disconnect()
  }
}

export const walletProviders: WalletProvider[] = [
  new PhantomWallet(),
  new SolflareWallet()
]

export const getWalletProvider = (name: string) => 
  walletProviders.find(p => p.name === name)