import * as React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface KYCVerificationProps {
  userAddress: string;
  chain: string;
  onVerificationComplete: (verified: boolean) => void;
}

const KYCVerification = React.forwardRef<HTMLDivElement, KYCVerificationProps>(
  ({ userAddress, chain, onVerificationComplete }, ref) => {
    const [status, setStatus] = React.useState<'idle' | 'loading' | 'verifying' | 'completed' | 'failed'>('idle');
    const [verificationUrl, setVerificationUrl] = React.useState<string>('');
    const [sessionId, setSessionId] = React.useState<string>('');

    const initializeVerification = async () => {
      setStatus('loading');
      
      try {
        const response = await fetch('/api/zkme/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userAddress, chain })
        });
        
        const data = await response.json();
        
        if (data.success) {
          setVerificationUrl(data.verificationUrl);
          setSessionId(data.sessionId);
          setStatus('verifying');
          
          // Open zkMe widget
          window.open(data.verificationUrl, 'zkme-verification', 'width=400,height=600');
          
          // Poll for verification status
          pollVerificationStatus(data.sessionId);
        } else {
          setStatus('failed');
        }
      } catch (error) {
        console.error('KYC initialization failed:', error);
        setStatus('failed');
      }
    };

    const pollVerificationStatus = async (sessionId: string) => {
      const maxAttempts = 60; // 5 minutes
      let attempts = 0;
      
      const poll = async () => {
        try {
          const response = await fetch(`/api/zkme/status/${sessionId}`);
          const data = await response.json();
          
          if (data.status === 'verified') {
            setStatus('completed');
            onVerificationComplete(true);
            return;
          } else if (data.status === 'rejected') {
            setStatus('failed');
            onVerificationComplete(false);
            return;
          }
          
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(poll, 5000); // Poll every 5 seconds
          } else {
            setStatus('failed');
            onVerificationComplete(false);
          }
        } catch (error) {
          console.error('Status polling failed:', error);
          setStatus('failed');
          onVerificationComplete(false);
        }
      };
      
      poll();
    };

    const getStatusDisplay = () => {
      switch (status) {
        case 'idle':
          return {
            icon: '🔐',
            title: 'Identity Verification Required',
            description: 'Complete zkMe KYC to access AetherLock features',
            action: 'Start Verification'
          };
        case 'loading':
          return {
            icon: '⏳',
            title: 'Initializing Verification',
            description: 'Setting up your verification session...',
            action: null
          };
        case 'verifying':
          return {
            icon: '🔍',
            title: 'Verification in Progress',
            description: 'Complete the verification in the popup window',
            action: null
          };
        case 'completed':
          return {
            icon: '✅',
            title: 'Verification Complete',
            description: 'Your identity has been successfully verified',
            action: null
          };
        case 'failed':
          return {
            icon: '❌',
            title: 'Verification Failed',
            description: 'Please try again or contact support',
            action: 'Retry Verification'
          };
      }
    };

    const statusDisplay = getStatusDisplay();

    return (
      <div ref={ref} className="max-w-md mx-auto">
        <Card className="p-6 border-slate-700 bg-slate-900/50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <motion.div
              animate={{ 
                scale: status === 'loading' || status === 'verifying' ? [1, 1.1, 1] : 1,
                rotate: status === 'loading' ? 360 : 0
              }}
              transition={{ 
                scale: { repeat: Infinity, duration: 2 },
                rotate: { repeat: Infinity, duration: 2, ease: 'linear' }
              }}
              className="text-4xl"
            >
              {statusDisplay.icon}
            </motion.div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {statusDisplay.title}
              </h3>
              <p className="text-sm text-slate-400">
                {statusDisplay.description}
              </p>
            </div>

            {status === 'verifying' && (
              <div className="space-y-2">
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <motion.div
                    className="bg-cyan-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 30, ease: 'linear' }}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Verification timeout in 5 minutes
                </p>
              </div>
            )}

            {statusDisplay.action && (
              <Button
                onClick={initializeVerification}
                disabled={status === 'loading' || status === 'verifying'}
                className="w-full bg-cyan-600 hover:bg-cyan-700"
              >
                {statusDisplay.action}
              </Button>
            )}

            <div className="text-xs text-slate-500 space-y-1">
              <p>Chain: <span className="text-cyan-400 capitalize">{chain}</span></p>
              <p>Address: <span className="text-cyan-400 font-mono text-xs">{userAddress.slice(0, 8)}...{userAddress.slice(-8)}</span></p>
            </div>
          </motion.div>
        </Card>
      </div>
    );
  }
);

KYCVerification.displayName = 'KYCVerification';

export { KYCVerification };