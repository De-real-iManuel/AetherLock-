import * as React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useWallet } from '../../context/WalletContext'
import { useUser } from '../../context/UserContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireKyc?: boolean
  requireRole?: 'client' | 'freelancer'
}

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication, KYC verification, or specific roles
 * Redirects to appropriate pages if requirements are not met
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireKyc = false,
  requireRole
}) => {
  const { isConnected } = useWallet()
  const { user } = useUser()
  const location = useLocation()

  // Check if wallet is connected
  if (requireAuth && !isConnected) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  // Check if KYC is verified
  if (requireKyc && user?.kycStatus !== 'verified') {
    return <Navigate to="/auth" state={{ from: location, needsKyc: true }} replace />
  }

  // Check if user has required role
  if (requireRole && user?.role !== requireRole) {
    // If user has no role, redirect to auth for role selection
    if (!user?.role) {
      return <Navigate to="/auth" state={{ from: location, needsRole: true }} replace />
    }
    // If user has wrong role, redirect to their appropriate dashboard
    return <Navigate to={user.role === 'client' ? '/client/dashboard' : '/freelancer/dashboard'} replace />
  }

  return <>{children}</>
}
