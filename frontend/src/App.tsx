import * as React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppProviders } from './providers/AppProviders'
import { LandingPage } from './components/landing/landing-page'
import { Dashboard } from './components/dashboard/dashboard'
import { EnhancedDashboard } from './components/dashboard/enhanced-dashboard'
import { UniversalDashboard } from './components/dashboard/universal-dashboard'
import { DemoShowcase } from './components/demo/demo-showcase'
import { NotificationContainer } from './components/ui/notification'
import { ErrorBoundary } from './components/ui/error-boundary'
import { useThemeStore } from './store/themeStore'

function App() {
  const { isDark } = useThemeStore()
  
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  return (
    <ErrorBoundary>
      <AppProviders>
        <div className="min-h-screen bg-black text-white">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/enhanced" element={<EnhancedDashboard />} />
            <Route path="/universal" element={<UniversalDashboard />} />
            <Route path="/demo" element={<DemoShowcase />} />
          </Routes>
          <NotificationContainer />
        </div>
      </AppProviders>
    </ErrorBoundary>
  )
}

export default App
