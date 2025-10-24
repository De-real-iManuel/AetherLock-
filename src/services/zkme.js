/**
 * zkMe SDK Integration for Zeta Chain Testnet
 * This service handles KYC verification using zkMe's zero-knowledge proofs
 */

import { ethers } from 'ethers';
import kycValidationService from './kycValidation';

// zkMe configuration for Zeta Chain testnet
const ZKME_CONFIG = {
  apiUrl: 'https://api.zkme.org/v1',
  zetaChainRpc: 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public',
  chainId: 7001, // Zeta Chain Athens testnet
  contractAddress: '0x1234567890123456789012345678901234567890', // Mock contract address
};

class ZkMeService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.isInitialized = false;
  }

  /**
   * Initialize zkMe service with wallet connection
   */
  async initialize(walletProvider) {
    try {
      if (!walletProvider) {
        throw new Error('Wallet provider is required');
      }

      this.provider = new ethers.providers.Web3Provider(walletProvider);
      this.signer = this.provider.getSigner();
      
      // Switch to Zeta Chain testnet if needed
      await this.switchToZetaChain();
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize zkMe service:', error);
      this.isInitialized = false;
      throw new Error(`zkMe initialization failed: ${error.message}`);
    }
  }

  /**
   * Switch wallet to Zeta Chain testnet
   */
  async switchToZetaChain() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${ZKME_CONFIG.chainId.toString(16)}` }],
      });
    } catch (switchError) {
      // Chain not added, try to add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${ZKME_CONFIG.chainId.toString(16)}`,
            chainName: 'Zeta Chain Athens Testnet',
            nativeCurrency: {
              name: 'ZETA',
              symbol: 'ZETA',
              decimals: 18,
            },
            rpcUrls: [ZKME_CONFIG.zetaChainRpc],
            blockExplorerUrls: ['https://zetachain-athens-3.blockscout.com/'],
          }],
        });
      } else {
        throw switchError;
      }
    }
  }

  /**
   * Start KYC verification process
   */
  async startKycVerification(userAddress) {
    if (!this.isInitialized) {
      throw new Error('zkMe service not initialized');
    }

    try {
      // Mock KYC verification flow
      const verificationSession = {
        sessionId: this.generateSessionId(),
        userAddress,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      // In real implementation, this would redirect to zkMe's KYC interface
      console.log('Starting KYC verification for:', userAddress);
      
      return verificationSession;
    } catch (error) {
      console.error('KYC verification failed:', error);
      throw new Error('Failed to start KYC verification');
    }
  }

  /**
   * Generate zero-knowledge proof for KYC
   */
  async generateKycProof(sessionId, kycData) {
    try {
      // Mock proof generation - in real implementation this would use zkMe's SDK
      const proof = {
        sessionId,
        proofHash: this.generateProofHash(kycData),
        zkProof: this.generateMockZkProof(),
        timestamp: Date.now(),
        isValid: true,
      };

      return proof;
    } catch (error) {
      console.error('Proof generation failed:', error);
      throw new Error('Failed to generate KYC proof');
    }
  }

  /**
   * Store proof hash on Zeta Chain
   */
  async storeProofOnChain(proof, userAddress) {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected');
      }

      // Initialize validation service if needed
      if (!kycValidationService.provider) {
        await kycValidationService.initialize();
      }

      // Use the validation service to store proof on Zeta Chain
      const tx = await kycValidationService.storeProofOnZetaChain(userAddress, proof, this.signer);
      
      // Store user metadata
      kycValidationService.storeUserKycMetadata(userAddress, {
        sessionId: proof.sessionId,
        verificationMethod: 'zkMe',
        proofType: 'zero-knowledge',
      });

      console.log('Storing proof on Zeta Chain:', tx);
      
      return tx;
    } catch (error) {
      console.error('Failed to store proof on chain:', error);
      throw new Error(`Failed to store proof on Zeta Chain: ${error.message}`);
    }
  }

  /**
   * Verify KYC status for a user
   */
  async verifyKycStatus(userAddress) {
    try {
      // Use the validation service to get KYC status from Zeta Chain
      const chainStatus = await kycValidationService.getKycStatusFromChain(userAddress);
      
      // Get additional metadata
      const userProfile = kycValidationService.getUserKycProfile(userAddress);
      
      return {
        userAddress,
        isVerified: chainStatus.isVerified,
        proofHash: chainStatus.proofHash,
        verifiedAt: chainStatus.verifiedAt,
        expiresAt: chainStatus.expiresAt,
        transactionHash: chainStatus.transactionHash,
        blockNumber: chainStatus.blockNumber,
        metadata: userProfile,
      };
    } catch (error) {
      console.error('KYC status verification failed:', error);
      throw new Error('Failed to verify KYC status');
    }
  }

  /**
   * Get KYC verification URL for redirect
   */
  getKycVerificationUrl(sessionId, returnUrl) {
    // Mock URL - in real implementation this would be zkMe's verification URL
    return `https://kyc.zkme.org/verify?session=${sessionId}&return=${encodeURIComponent(returnUrl)}`;
  }

  // Helper methods
  generateSessionId() {
    return 'zkme_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  generateProofHash(data) {
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(JSON.stringify(data)));
  }

  generateMockZkProof() {
    return {
      a: [Math.random().toString(), Math.random().toString()],
      b: [[Math.random().toString(), Math.random().toString()], [Math.random().toString(), Math.random().toString()]],
      c: [Math.random().toString(), Math.random().toString()],
    };
  }

  generateTxHash() {
    return '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }
}

export default new ZkMeService();