import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Lock, Unlock, Shield, Database } from 'lucide-react';
import { analyzeEscrowRisk, resolveDispute } from '../services/aws';
import { logEscrowTransaction, queryEscrowHistory } from '../services/qldb';
import { createEscrowAccount } from '../services/solana';
import kycValidationService from '../services/kycValidation';
import KycVerification from './KycVerification';
import KycStatusIndicator from './KycStatusIndicator';
import WalletConnectionButton from './WalletConnectionButton';
import { useWalletConnection } from '../hooks/useWalletConnection';

const AetherLockEscrow = () => {
  const {
    connected,
    publicKey,
    balance,
    connectionState
  } = useWalletConnection();

  const [buyerOffer, setBuyerOffer] = useState('');
  const [sellerHandle, setSellerHandle] = useState('');
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [qldbRecord, setQldbRecord] = useState(null);
  const [solanaTransaction, setSolanaTransaction] = useState(null);
  const [kycStatus, setKycStatus] = useState(null);
  const [showKycModal, setShowKycModal] = useState(false);

  const generateRandomHash = (length = 64) => {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };



  const generateSolanaTransactionId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 88; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const validateInputs = () => {
    const newErrors = {};
    
    if (!connected || !publicKey) {
      newErrors.wallet = 'Please connect your Solana wallet first';
    }
    
    if (!kycStatus?.isVerified) {
      newErrors.kyc = 'KYC verification required to create escrow';
    }
    
    const offerNum = parseFloat(buyerOffer);
    if (!buyerOffer || isNaN(offerNum) || offerNum <= 0) {
      newErrors.buyerOffer = 'Offer must be a number greater than 0';
    }
    
    if (connected && offerNum > balance) {
      newErrors.buyerOffer = `Insufficient balance. You have ${balance.toFixed(4)} SOL`;
    }
    
    if (!sellerHandle || !sellerHandle.startsWith('@') || sellerHandle.length < 3) {
      newErrors.sellerHandle = 'Handle must start with @ and be at least 3 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleKycStatusChange = (status) => {
    setKycStatus(status);
  };

  const startEscrow = async () => {
    if (!validateInputs()) return;
    
    setIsLoading(true);
    
    try {
      // Step 0: Verify KYC eligibility
      const kycEligibility = await kycValidationService.canCreateEscrow(publicKey.toString());
      if (!kycEligibility.canCreate) {
        throw new Error(kycEligibility.reason);
      }

      // Step 1: AI Risk Analysis with AWS Bedrock
      const riskAnalysis = await analyzeEscrowRisk({
        buyerOffer,
        sellerHandle,
        amount: parseFloat(buyerOffer)
      });
      setAiAnalysis(riskAnalysis);
      
      // Step 2: Create real Solana escrow transaction
      const sellerPublicKey = 'SellerWalletAddressHere'; // In production, resolve from handle
      const escrowResult = await createEscrowAccount(
        publicKey,
        sellerPublicKey,
        parseFloat(buyerOffer)
      );
      
      if (!escrowResult.success) {
        throw new Error(escrowResult.error);
      }
      
      setSolanaTransaction(escrowResult);
      
      // Step 3: Log to QLDB for immutable record
      const transactionData = {
        transactionId: `escrow_${Date.now()}`,
        buyerAddress: publicKey.toString(),
        sellerAddress: sellerPublicKey,
        amount: parseFloat(buyerOffer),
        status: 'active',
        solanaTransactionId: escrowResult.signature,
        escrowAddress: escrowResult.escrowAddress,
        riskScore: riskAnalysis.riskScore,
        buyerOffer,
        sellerHandle,
        aiAnalysis: riskAnalysis.analysis,
        kycStatus: kycEligibility.kycStatus
      };
      
      const qldbResult = await logEscrowTransaction(transactionData);
      setQldbRecord(qldbResult);
      
      setStatus({
        trustScore: riskAnalysis.riskScore,
        solanaTransactionId: escrowResult.signature,
        escrowAddress: escrowResult.escrowAddress,
        qldbHash: qldbResult.hash,
        isActive: true,
        aiRecommendation: riskAnalysis.recommendation,
        amount: parseFloat(buyerOffer)
      });
      
      // Balance will be updated automatically by the hook
      
    } catch (error) {
      console.error('Escrow creation failed:', error);
      setErrors({ general: 'Failed to create escrow. Please try again.' });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex items-center justify-center">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Lock className="h-6 w-6" />
              AetherLock Escrow
            </div>
            <WalletConnectionButton />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* KYC Status Indicator */}
          <KycStatusIndicator kycStatus={kycStatus} />
          
          {/* KYC Verification Modal */}
          {showKycModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">KYC Verification</h3>
                  <button
                    onClick={() => setShowKycModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <KycVerification 
                  walletAddress={publicKey?.toString()} 
                  onKycStatusChange={handleKycStatusChange}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: form */}
            <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">
              Buyer Offer (SOL)
            </label>
            <Input
              placeholder="e.g., 0.1 SOL for logo design"
              value={buyerOffer}
              onChange={(e) => setBuyerOffer(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              type="number"
              step="0.001"
            />
            {connected && (
              <p className="text-slate-400 text-xs mt-1">
                Available: {balance.toFixed(4)} SOL
              </p>
            )}
            {errors.buyerOffer && (
              <p className="text-red-400 text-sm mt-1">{errors.buyerOffer}</p>
            )}
          </div>
            {/* Right: seller input & actions (stacked on mobile) */}
            <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">
              Seller Handle
            </label>
            <Input
              placeholder="e.g., @XUser"
              value={sellerHandle}
              onChange={(e) => setSellerHandle(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            />
            {errors.sellerHandle && (
              <p className="text-red-400 text-sm mt-1">{errors.sellerHandle}</p>
            )}
          </div>
          </div>

          {errors.general && (
            <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
              <p className="text-red-400 text-sm">{errors.general}</p>
            </div>
          )}

          {errors.kyc && (
            <div className="p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
              <p className="text-yellow-400 text-sm">{errors.kyc}</p>
              <button
                onClick={() => setShowKycModal(true)}
                className="text-yellow-300 hover:text-yellow-200 text-sm underline mt-1"
              >
                Complete KYC Verification →
              </button>
            </div>
          )}

          <Button
            onClick={startEscrow}
            disabled={isLoading || !connected || !kycStatus?.isVerified}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            {isLoading ? 'Creating Escrow...' : 
             !connected ? 'Connect Wallet First' : 
             !kycStatus?.isVerified ? 'Complete KYC First' : 
             'Start Escrow'}
          </Button>

          {!kycStatus?.isVerified && connected && (
            <Button
              onClick={() => setShowKycModal(true)}
              variant="outline"
              className="w-full border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
            >
              <Shield className="w-4 h-4 mr-2" />
              Complete KYC Verification
            </Button>
          )}
          
          {aiAnalysis && (
            <div className="mt-4 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-blue-400" />
                <span className="font-medium text-blue-400">AI Risk Analysis</span>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Risk Score:</span>
                  <span className={`font-mono ${aiAnalysis.riskScore > 70 ? 'text-red-400' : aiAnalysis.riskScore > 40 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {aiAnalysis.riskScore}/100
                  </span>
                </div>
                <p className="text-slate-300 text-xs">{aiAnalysis.analysis}</p>
                <p className="text-blue-300 text-xs font-medium">{aiAnalysis.recommendation}</p>
              </div>
            </div>
          )}
          
          {status && (
            <div className="mt-6 p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Unlock className="h-5 w-5 text-green-400" />
                <span className="font-medium text-green-400">Escrow Active</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-400">AI Trust Score:</span>
                  <span className={`ml-2 font-mono ${status.trustScore > 70 ? 'text-red-400' : status.trustScore > 40 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {status.trustScore}/100
                  </span>
                </div>
                
                <div>
                  <span className="text-slate-400">Solana TX:</span>
                  <div className="mt-1 font-mono text-xs text-white break-all bg-slate-800 p-2 rounded">
                    {status.solanaTransactionId}
                  </div>
                  <a 
                    href={`https://explorer.solana.com/tx/${status.solanaTransactionId}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 text-xs hover:underline"
                  >
                    View on Solana Explorer →
                  </a>
                </div>
                
                <div>
                  <span className="text-slate-400">Escrow Address:</span>
                  <div className="mt-1 font-mono text-xs text-green-300 break-all bg-slate-800 p-2 rounded">
                    {status.escrowAddress}
                  </div>
                </div>
                
                <div>
                  <span className="text-slate-400">Amount Locked:</span>
                  <span className="ml-2 font-mono text-yellow-300">{status.amount} SOL</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-purple-400" />
                  <span className="text-slate-400">QLDB Record:</span>
                </div>
                <div className="mt-1 font-mono text-xs text-purple-300 break-all bg-slate-800 p-2 rounded">
                  {status.qldbHash}
                </div>
                
                {status.aiRecommendation && (
                  <div className="mt-3 p-2 bg-blue-900/20 border border-blue-800 rounded">
                    <span className="text-blue-300 text-xs font-medium">AI Recommendation:</span>
                    <p className="text-blue-200 text-xs mt-1">{status.aiRecommendation}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {qldbRecord && (
            <div className="mt-4 p-3 bg-purple-900/20 border border-purple-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-purple-400" />
                <span className="font-medium text-purple-400">Immutable Ledger</span>
              </div>
              <div className="text-xs text-purple-300">
                <div>Document ID: {qldbRecord.documentId}</div>
                <div>Revision: {qldbRecord.revision}</div>
                <div className="text-green-400">✓ Cryptographically verified</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AetherLockEscrow;