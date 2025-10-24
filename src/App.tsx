import * as React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppProviders } from './providers/AppProviders'
import { LandingPage } from './components/landing/landing-page'
import { Dashboard } from './components/dashboard/dashboard'
import { NotificationContainer } from './components/ui/notification'
import { useThemeStore } from './store/themeStore'

function App() {
  const { isDark } = useThemeStore()
  
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  return (
    <AppProviders>
      <div className="min-h-screen bg-black text-white">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        <NotificationContainer />
      </div>
    </AppProviders>
  )
}

export default App
