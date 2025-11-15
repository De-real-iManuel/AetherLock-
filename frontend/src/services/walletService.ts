// Minimal wallet providers stub for local dev
type Provider = {
  name: string
  isInstalled: () => boolean
}

export const walletProviders: Provider[] = [
  {
    name: 'Phantom',
    isInstalled: () => false,
  },
  {
    name: 'Solflare',
    isInstalled: () => false,
  },
]
