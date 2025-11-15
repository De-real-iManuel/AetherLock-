import * as React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { WalletProvider } from './context/WalletContext'
import { UserProvider } from './context/UserContext'
import { EscrowProvider } from './context/EscrowContext'
import { ToastContainer } from './components/ui/toast'
import { ErrorBoundary } from './components/ui/error-boundary'
import { useThemeStore } from './store/themeStore'
import wsClient from './lib/websocket'
import { Navbar } from './components/layout/Navbar'
import { ProtectedRoute } from './components/routing/ProtectedRoute'

// Lazy-load page components
const LandingPage = React.lazy(() => import('./pages/Landing'))
const AuthPage = React.lazy(() => import('./pages/AuthPage'))
const ClientDashboard = React.lazy(() => import('./pages/ClientDashboard'))
const FreelancerDashboard = React.lazy(() => import('./pages/FreelancerDashboard'))
const Settings = React.lazy(() => import('./pages/Settings'))
const FAQ = React.lazy(() => import('./pages/FAQ'))
const Terms = React.lazy(() => import('./pages/Terms'))
const Privacy = React.lazy(() => import('./pages/Privacy'))
const Contact = React.lazy(() => import('./pages/Contact'))
const NotFound = React.lazy(() => import('./pages/NotFound'))

// Legacy pages (keeping for backward compatibility)
const Dashboard = React.lazy(() => import('./pages/DashboardPage'))
const AIPage = React.lazy(() => import('./pages/AIPage'))
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'))
const TransactionsPage = React.lazy(() => import('./pages/TransactionsPage'))
const DisputesPage = React.lazy(() => import('./pages/DisputesPage'))
const MarketplacePage = React.lazy(() => import('./pages/MarketplacePage'))
const DemoShowcase = React.lazy(() => import('./components/demo/demo-showcase'))
const WinningDemoShowcase = React.lazy(() => import('./components/demo/WinningDemoShowcase'))

function App() {
  const { isDark } = useThemeStore()
  
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    wsClient.connect()
    
    return () => {
      wsClient.disconnect()
    }
  }, [isDark])

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <WalletProvider>
          <UserProvider>
            <EscrowProvider>
              <div className="min-h-screen bg-black text-white">
                <Navbar />
                <React.Suspense fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                  </div>
                }>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/demo" element={<WinningDemoShowcase />} />
                    <Route path="/demo-showcase" element={<DemoShowcase />} />

                    {/* Protected routes - require authentication */}
                    <Route 
                      path="/settings" 
                      element={
                        <ProtectedRoute requireAuth={true}>
                          <Settings />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Role-based protected routes - Client */}
                    <Route 
                      path="/client/dashboard" 
                      element={
                        <ProtectedRoute requireAuth={true} requireKyc={true} requireRole="client">
                          <ClientDashboard />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Role-based protected routes - Freelancer */}
                    <Route 
                      path="/freelancer/dashboard" 
                      element={
                        <ProtectedRoute requireAuth={true} requireKyc={true} requireRole="freelancer">
                          <FreelancerDashboard />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Legacy routes - keeping for backward compatibility */}
                    <Route 
                      path="/dashboard" 
                      element={
                        <ProtectedRoute requireAuth={true}>
                          <Dashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/ai" 
                      element={
                        <ProtectedRoute requireAuth={true}>
                          <AIPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute requireAuth={true}>
                          <ProfilePage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/transactions" 
                      element={
                        <ProtectedRoute requireAuth={true}>
                          <TransactionsPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/disputes" 
                      element={
                        <ProtectedRoute requireAuth={true}>
                          <DisputesPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/marketplace" 
                      element={
                        <ProtectedRoute requireAuth={true}>
                          <MarketplacePage />
                        </ProtectedRoute>
                      } 
                    />

                    {/* 404 Not Found - catch all invalid routes */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </React.Suspense>
                <ToastContainer />
              </div>
            </EscrowProvider>
          </UserProvider>
        </WalletProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
