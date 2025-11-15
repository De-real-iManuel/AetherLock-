import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useKycStore } from '@/stores/kycStore';
import { useWalletStore } from '@/stores/walletStore';
import { useUserStore } from '@/stores/userStore';
import { useNotification } from '@/hooks/useNotification';
import { Shield, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ZkMeKYCWidgetProps {
  userAddress: string;
  chain: string;
  onComplete?: (status: 'verified' | 'rejected') => void;
  onClose?: () => void;
}

/**
 * ZkMe KYC Widget Component
 * Integrates with @zkmelabs/widget for identity verification
 * Auto-triggers after wallet connection if not verified
 */
export const ZkMeKYCWidget: React.FC<ZkMeKYCWidgetProps> = ({
  userAddress,
  chain,
  onComplete,
  onClose
}) => {
  const [isInitializing, setIsInitializing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const widgetContainerRef = React.useRef<HTMLDivElement>(null);
  
  const { status, initializeKyc, handleCompletion, setError: setKycError } = useKycStore();
  const { updateKycStatus } = useUserStore();
  const notification = useNotification();

  // Initialize zkMe widget
  React.useEffect(() => {
    if (!userAddress || !widgetContainerRef.current) return;

    const initializeWidget = async () => {
      setIsInitializing(true);
      setError(null);

      try {
        // Generate session ID
        const sessionId = `zkme_${userAddress}_${Date.now()}`;
        
        // Initialize KYC in store
        initializeKyc(sessionId);

        // TODO: Integrate actual @zkmelabs/widget
        // For now, we'll simulate the widget initialization
        // In production, this would be:
        // import { ZkMeWidget } from '@zkmelabs/widget';
        // const widget = new ZkMeWidget({
        //   appId: process.env.VITE_ZKME_APP_ID,
        //   apiKey: process.env.VITE_ZKME_API_KEY,
        //   userAddress,
        //   chain,
        //   onSuccess: handleSuccess,
        //   onError: handleError,
        //   onClose: handleClose
        // });
        // widget.mount(widgetContainerRef.current);

        console.log('zkMe KYC widget initialized', { sessionId, userAddress, chain });
        
        // Simulate widget loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setIsInitializing(false);
      } catch (err) {
        console.error('Failed to initialize zkMe widget:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize KYC verification';
        setError(errorMessage);
        setKycError(errorMessage);
        setIsInitializing(false);
      }
    };

    initializeWidget();
  }, [userAddress, chain, initializeKyc, setKycError]);

  const handleSuccess = React.useCallback((verificationData?: any) => {
    // Handle successful verification
    handleCompletion(true, {
      level: verificationData?.level || 1,
      verifiedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    });

    // Update user store
    updateKycStatus('verified', verificationData?.level || 1);

    // Show success notification
    notification.success(
      'KYC Verified',
      'Your identity has been successfully verified!'
    );

    // Call completion callback
    onComplete?.('verified');
  }, [handleCompletion, updateKycStatus, notification, onComplete]);

  const handleError = React.useCallback((errorMessage: string) => {
    // Handle verification failure
    handleCompletion(false);
    setError(errorMessage);
    
    // Show error notification
    notification.error(
      'KYC Failed',
      errorMessage || 'Identity verification was rejected'
    );

    // Call completion callback
    onComplete?.('rejected');
  }, [handleCompletion, notification, onComplete]);

  const handleClose = React.useCallback(() => {
    onClose?.();
  }, [onClose]);

  const handleRetry = () => {
    setError(null);
    setIsInitializing(true);
    // Re-initialize widget
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <div className="flex items-center space-x-3 p-4 rounded-lg bg-primary-card/50 border border-accent-electric/30">
        <Shield className="h-6 w-6 text-accent-electric" />
        <div>
          <h3 className="text-white font-semibold">Identity Verification</h3>
          <p className="text-slate-400 text-sm">
            Verify your identity with zkMe to access platform features
          </p>
        </div>
      </div>

      {/* Widget Container */}
      <div className="relative min-h-[400px] rounded-lg border-2 border-accent-electric/30 bg-primary-card/30 overflow-hidden">
        {/* Loading State */}
        <AnimatePresence>
          {isInitializing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-primary-card/95 backdrop-blur-sm z-10"
            >
              <Loader2 className="h-12 w-12 text-accent-electric animate-spin mb-4" />
              <p className="text-white font-semibold">Initializing verification...</p>
              <p className="text-slate-400 text-sm mt-2">Please wait</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        <AnimatePresence>
          {error && !isInitializing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-primary-card/95 backdrop-blur-sm z-10 p-6"
            >
              <XCircle className="h-16 w-16 text-status-failed mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">Verification Failed</h3>
              <p className="text-slate-400 text-center mb-6 max-w-md">{error}</p>
              <Button onClick={handleRetry} variant="primary">
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success State */}
        <AnimatePresence>
          {status === 'verified' && !isInitializing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-primary-card/95 backdrop-blur-sm z-10 p-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2, duration: 0.6, bounce: 0.5 }}
              >
                <CheckCircle className="h-20 w-20 text-status-verified mb-4" />
              </motion.div>
              <h3 className="text-white font-semibold text-xl mb-2">Verification Complete!</h3>
              <p className="text-slate-400 text-center mb-6 max-w-md">
                Your identity has been successfully verified. You can now access all platform features.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Widget iframe/container */}
        <div 
          ref={widgetContainerRef} 
          className="w-full h-full min-h-[400px]"
          id="zkme-widget-container"
        >
          {/* zkMe widget will be mounted here */}
          {!isInitializing && !error && status !== 'verified' && (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <AlertCircle className="h-12 w-12 text-accent-cyan mb-4" />
              <p className="text-slate-300 mb-2">
                The zkMe verification widget will appear here
              </p>
              <p className="text-slate-500 text-sm">
                Follow the on-screen instructions to complete your identity verification
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30">
        <h4 className="text-accent-cyan font-semibold text-sm mb-2">Why verify your identity?</h4>
        <ul className="text-slate-300 text-sm space-y-1">
          <li>• Enhanced security for your transactions</li>
          <li>• Access to higher transaction limits</li>
          <li>• Increased trust score on the platform</li>
          <li>• Compliance with regulatory requirements</li>
        </ul>
      </div>

      {/* Privacy Notice */}
      <p className="text-slate-500 text-xs text-center">
        Your personal information is encrypted and securely stored. We use zkMe's zero-knowledge
        proof technology to verify your identity without exposing sensitive data.
      </p>
    </div>
  );
};

/**
 * Auto-trigger KYC Widget Modal
 * Shows modal automatically after wallet connection if user is not verified
 */
export const AutoKYCModal: React.FC = () => {
  const { showWidget, setShowWidget, status } = useKycStore();
  const { address, chain, isConnected } = useWalletStore();

  // Auto-show widget after wallet connection
  React.useEffect(() => {
    if (isConnected && status === 'not_started' && !showWidget) {
      // Delay to allow wallet connection to complete
      const timer = setTimeout(() => {
        setShowWidget(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isConnected, status, showWidget, setShowWidget]);

  const handleClose = () => {
    setShowWidget(false);
  };

  const handleComplete = (verificationStatus: 'verified' | 'rejected') => {
    console.log('KYC completed with status:', verificationStatus);
    // Modal will close automatically after completion
    setTimeout(() => {
      setShowWidget(false);
    }, 2000);
  };

  if (!address || !chain) return null;

  return (
    <Modal
      isOpen={showWidget}
      onClose={handleClose}
      title="Complete Identity Verification"
      size="lg"
      closeOnBackdropClick={false}
    >
      <ZkMeKYCWidget
        userAddress={address}
        chain={chain}
        onComplete={handleComplete}
        onClose={handleClose}
      />
    </Modal>
  );
};
