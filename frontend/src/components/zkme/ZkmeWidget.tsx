import * as React from 'react';
import { ZkMeWidget } from '@zkmelabs/widget';
import { zkmeAPI } from '@/lib/api';

interface ZkmeWidgetProps {
  userAddress: string;
  onComplete: (verified: boolean) => void;
}

export default function ZkmeWidgetWrapper({ userAddress, onComplete }: ZkmeWidgetProps) {
  const [loading, setLoading] = React.useState(false);

  const handleVerified = async (result: any) => {
    setLoading(true);
    try {
      await zkmeAPI.initialize({
        userAddress,
        chain: 'solana',
        verificationData: result,
      });
      onComplete(true);
    } catch (error) {
      console.error('zkMe verification failed:', error);
      onComplete(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 glow-border rounded-xl bg-slate-900/50">
      <h3 className="text-xl font-bold mb-4">zkMe KYC Verification</h3>
      
      <ZkMeWidget
        appId={import.meta.env.VITE_ZKME_APP_ID}
        apiKey={import.meta.env.VITE_ZKME_API_KEY}
        onVerified={handleVerified}
        lv="MeID"
        mode="wallet"
      />
      
      {loading && (
        <div className="mt-4 text-center text-neon-blue animate-pulse">
          Processing verification...
        </div>
      )}
    </div>
  );
}
