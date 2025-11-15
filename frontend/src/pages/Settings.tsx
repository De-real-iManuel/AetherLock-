import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useWalletStore } from '@/stores/walletStore'
import { useUserStore } from '@/stores/userStore'
import { useThemeStore } from '@/stores/themeStore'
import { useKycStore } from '@/stores/kycStore'
import { api } from '@/services/api'
import { toast } from 'sonner'

/**
 * Settings Page Component
 * Allows users to manage wallet connections, KYC status, notification preferences, and theme
 */
const Settings: React.FC = () => {
  const { address, chain, walletType, disconnect } = useWalletStore()
  const { user, settings, updateSettings } = useUserStore()
  const { theme, toggleTheme } = useThemeStore()
  const { status: kycStatus, setShowWidget } = useKycStore()
  
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Handle notification preference changes
  const handleNotificationChange = async (type: 'email' | 'push' | 'inApp', value: boolean) => {
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [type]: value
      }
    }
    
    // Update local state immediately for responsive UI
    updateSettings(newSettings)
    
    // Save to backend
    try {
      await api.put('/api/user/settings', { settings: newSettings })
      toast.success('Notification preferences updated')
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Failed to save settings')
      // Revert on error
      updateSettings(settings)
    }
  }

  // Handle theme toggle
  const handleThemeToggle = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    
    // Update theme store (persists to localStorage automatically)
    toggleTheme()
    
    // Save to backend
    try {
      await api.put('/api/user/settings', { 
        settings: { 
          ...settings, 
          theme: newTheme 
        } 
      })
      toast.success(`Switched to ${newTheme} theme`)
    } catch (error) {
      console.error('Failed to save theme:', error)
      // Theme is already updated locally, just log the error
    }
  }

  // Handle wallet disconnection
  const handleDisconnect = () => {
    disconnect()
    toast.success('Wallet disconnected')
  }

  // Handle KYC re-verification
  const handleReVerifyKYC = () => {
    setShowWidget(true)
    toast.info('Opening KYC verification widget')
  }

  // Handle account deletion
  const handleDeleteAccount = async () => {
    setIsSaving(true)
    try {
      await api.delete('/api/user/account')
      toast.success('Account deleted successfully')
      // Clear all local data
      disconnect()
      window.location.href = '/'
    } catch (error) {
      console.error('Failed to delete account:', error)
      toast.error('Failed to delete account')
    } finally {
      setIsSaving(false)
      setShowDeleteConfirm(false)
    }
  }

  // Get KYC status badge
  const getKycStatusBadge = () => {
    const statusConfig = {
      verified: { text: 'Verified', color: 'bg-green-500/20 text-green-400 border-green-500' },
      pending: { text: 'Pending', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500' },
      rejected: { text: 'Rejected', color: 'bg-red-500/20 text-red-400 border-red-500' },
      not_started: { text: 'Not Started', color: 'bg-gray-500/20 text-gray-400 border-gray-500' }
    }
    
    const config = statusConfig[kycStatus]
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.text}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-primary-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-electric to-accent-cyan mb-2">
            Settings
          </h1>
          <p className="text-slate-400">
            Manage your account preferences and security settings
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Wallet Management Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-electric" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Wallet Management
              </CardTitle>
              <CardDescription>
                Manage your connected blockchain wallets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {address ? (
                <div className="flex items-center justify-between p-4 rounded-lg bg-primary-bg/50 border border-primary-border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white capitalize">{walletType}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent-electric/20 text-accent-electric border border-accent-electric/30 capitalize">
                        {chain}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 font-mono">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisconnect}
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <p>No wallet connected</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* KYC Status Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Identity Verification (KYC)
              </CardTitle>
              <CardDescription>
                Your identity verification status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-primary-bg/50 border border-primary-border">
                <div>
                  <p className="text-sm font-medium text-white mb-1">Verification Status</p>
                  {getKycStatusBadge()}
                </div>
                {(kycStatus === 'rejected' || kycStatus === 'not_started') && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleReVerifyKYC}
                  >
                    {kycStatus === 'rejected' ? 'Re-verify' : 'Start Verification'}
                  </Button>
                )}
              </div>
              {kycStatus === 'verified' && user?.kycLevel && (
                <div className="text-sm text-slate-400">
                  <p>Verification Level: <span className="text-accent-electric font-medium">{user.kycLevel}</span></p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notification Preferences Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {/* Email Notifications */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-primary-bg/50 border border-primary-border">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white mb-1">Email Notifications</p>
                    <p className="text-xs text-slate-400">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                  />
                </div>

                {/* Push Notifications */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-primary-bg/50 border border-primary-border">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white mb-1">Push Notifications</p>
                    <p className="text-xs text-slate-400">Receive browser push notifications</p>
                  </div>
                  <Switch
                    checked={settings.notifications.push}
                    onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                  />
                </div>

                {/* In-App Notifications */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-primary-bg/50 border border-primary-border">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white mb-1">In-App Notifications</p>
                    <p className="text-xs text-slate-400">Show notifications within the app</p>
                  </div>
                  <Switch
                    checked={settings.notifications.inApp}
                    onCheckedChange={(checked) => handleNotificationChange('inApp', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-electric" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and feel of the interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg bg-primary-bg/50 border border-primary-border">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white mb-1">Theme</p>
                  <p className="text-xs text-slate-400">
                    Current: <span className="capitalize text-accent-electric">{theme}</span> Neon
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleThemeToggle}
                  className="gap-2"
                >
                  {theme === 'dark' ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Light
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      Dark
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone Section */}
          <Card className="border-red-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions that affect your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showDeleteConfirm ? (
                <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/5 border border-red-500/30">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white mb-1">Delete Account</p>
                    <p className="text-xs text-slate-400">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Delete Account
                  </Button>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/50 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-red-400 mb-2">
                      Are you absolutely sure?
                    </p>
                    <p className="text-xs text-slate-400">
                      This action cannot be undone. This will permanently delete your account,
                      remove all your data, and disconnect your wallet.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteAccount}
                      loading={isSaving}
                    >
                      Yes, Delete My Account
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Settings
