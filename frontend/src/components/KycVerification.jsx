import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader2, Shield, ExternalLink } from 'lucide-react';
import zkMeService from '../services/zkme';

const KycVerification = ({ walletAddress, onKycStatusChange }) => {
  const [kycStatus, setKycStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verificationSession, setVerificationSession] = useState(null);

  useEffect(() => {
    if (walletAddress) {
      checkKycStatus();
    }
  }, [walletAddress]);

  const checkKycStatus = async () => {
    if (!walletAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      const status = await zkMeService.verifyKycStatus(walletAddress);
      setKycStatus(status);
      onKycStatusChange?.(status);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const startKycVerification = async () => {
    if (!walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Initialize zkMe service with wallet provider
      await zkMeService.initialize(window.ethereum);
      
      // Start KYC verification
      const session = await zkMeService.startKycVerification(walletAddress);
      setVerificationSession(session);

      // In a real implementation, this would redirect to zkMe's KYC interface
      // For demo purposes, we'll simulate the verification process
      setTimeout(async () => {
        try {
          // Generate mock KYC proof
          const proof = await zkMeService.generateKycProof(session.sessionId, {
            address: walletAddress,
            timestamp: Date.now(),
          });

          // Store proof on Zeta Chain
          await zkMeService.storeProofOnChain(proof, walletAddress);

          // Refresh KYC status
          await checkKycStatus();
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }, 3000); // Simulate 3-second verification process

    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />;
    if (kycStatus?.isVerified) return <CheckCircle className="w-6 h-6 text-green-400" />;
    if (error) return <AlertCircle className="w-6 h-6 text-red-400" />;
    return <Shield className="w-6 h-6 text-gray-400" />;
  };

  const getStatusText = () => {
    if (isLoading) return 'Checking KYC status...';
    if (kycStatus?.isVerified) return 'KYC Verified';
    if (error) return 'Verification Error';
    return 'KYC Required';
  };

  const getStatusColor = () => {
    if (isLoading) return 'text-cyan-400';
    if (kycStatus?.isVerified) return 'text-green-400';
    if (error) return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-lg font-semibold text-white">zkMe KYC Verification</h3>
            <p className={`text-sm ${getStatusColor()}`}>{getStatusText()}</p>
          </div>
        </div>
        
        {kycStatus?.isVerified && (
          <div className="flex items-center space-x-2 text-green-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Verified</span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-300 text-sm">{error}</span>
          </div>
        </div>
      )}

      {kycStatus?.isVerified ? (
        <div className="space-y-3">
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 font-medium">Identity Verified</p>
                <p className="text-green-400/70 text-sm">
                  Verified on {new Date(kycStatus.verifiedAt).toLocaleDateString()}
                </p>
              </div>
              <Shield className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Proof Hash</p>
              <p className="text-white font-mono text-xs break-all">
                {kycStatus.proofHash.slice(0, 20)}...
              </p>
            </div>
            <div>
              <p className="text-gray-400">Expires</p>
              <p className="text-white">
                {new Date(kycStatus.expiresAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-purple-400 mt-1" />
              <div>
                <h4 className="text-purple-300 font-medium mb-2">Zero-Knowledge KYC</h4>
                <p className="text-gray-300 text-sm mb-3">
                  Complete identity verification using zkMe's privacy-preserving protocol on Zeta Chain. 
                  Your personal information remains private while proving your identity.
                </p>
                <ul className="text-gray-400 text-xs space-y-1">
                  <li>• Zero-knowledge proof generation</li>
                  <li>• Stored on Zeta Chain testnet</li>
                  <li>• Required for escrow participation</li>
                </ul>
              </div>
            </div>
          </div>

          {verificationSession && (
            <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span className="text-cyan-300 font-medium">Verification in Progress</span>
              </div>
              <p className="text-gray-300 text-sm">
                Session ID: {verificationSession.sessionId}
              </p>
            </div>
          )}

          <button
            onClick={startKycVerification}
            disabled={isLoading || !walletAddress}
            className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                <span>Start KYC Verification</span>
              </>
            )}
          </button>

          {!walletAddress && (
            <p className="text-gray-400 text-sm text-center">
              Connect your wallet to begin KYC verification
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default KycVerification;