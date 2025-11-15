import { BrowserRouter } from 'react-router-dom'

interface AppProvidersProps {
  children: React.ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  )
}
