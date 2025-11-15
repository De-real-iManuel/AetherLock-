import * as React from 'react'
import { Navigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import { useWallet } from '../../context/WalletContext'

/**
 * RoleBasedRedirect Component
 * Redirects users to their appropriate dashboard based on their role
 * Used after wallet connection and KYC verification
 */
export const RoleBasedRedirect: React.FC = () => {
  const { user } = useUser()
  const { isConnected } = useWallet()

  // If not connected, stay on auth page
  if (!isConnected) {
    return null
  }

  // If user has a role, redirect to appropriate dashboard
  if (user?.role === 'client') {
    return <Navigate to="/client/dashboard" replace />
  }

  if (user?.role === 'freelancer') {
    return <Navigate to="/freelancer/dashboard" replace />
  }

  // If no role yet, stay on auth page for role selection
  return null
}
