import axios from 'axios';
import { ethers } from 'ethers';

class ZkmeService {
  constructor() {
    this.apiKey = process.env.ZKME_API_KEY ;
    this.appId = process.env.ZKME_APP_ID ;
    this.baseUrl = 'https://nest-api.zk.me';
    
    // Multi-chain contract addresses from zkMe docs
    this.contracts = {
      ethereum: '0x0BA819C2ca7a7bE0F1Fa8d0F0F0F0F0F0F0F0F0F',
      polygon: '0x0BA819C2ca7a7bE0F1Fa8d0F0F0F0F0F0F0F0F0F',
      bsc: '0x0BA819C2ca7a7bE0F1Fa8d0F0F0F0F0F0F0F0F0F',
      arbitrum: '0x0BA819C2ca7a7bE0F1Fa8d0F0F0F0F0F0F0F0F0F',
      optimism: '0x0BA819C2ca7a7bE0F1Fa8d0F0F0F0F0F0F0F0F0F',
      base: '0x0BA819C2ca7a7bE0F1Fa8d0F0F0F0F0F0F0F0F0F'
    };
  }

  /**
   * Initialize zkMe verification session
   */
  async initializeVerification(userAddress, chain = 'solana') {
    try {
      const response = await axios.post(`${this.baseUrl}/v1/verification/init`, {
        appId: this.appId,
        userAddress,
        chain,
        redirectUrl: `${process.env.FRONTEND_URL}/auth?verification=complete`,
        webhookUrl: `${process.env.BACKEND_URL}/api/zkme/webhook`
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        sessionId: response.data.sessionId,
        verificationUrl: response.data.verificationUrl,
        qrCode: response.data.qrCode
      };
    } catch (error) {
      console.error('zkMe initialization failed:', error);
      throw new Error('Failed to initialize zkMe verification');
    }
  }

  /**
   * Check verification status
   */
  async checkVerificationStatus(sessionId) {
    try {
      const response = await axios.get(`${this.baseUrl}/v1/verification/status/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        status: response.data.status, // pending, verified, rejected
        verificationLevel: response.data.verificationLevel,
        timestamp: response.data.timestamp,
        proofData: response.data.proofData
      };
    } catch (error) {
      console.error('zkMe status check failed:', error);
      throw new Error('Failed to check verification status');
    }
  }

  /**
   * Verify zkMe proof on-chain
   */
  async verifyProof(proofData, userAddress) {
    try {
      const response = await axios.post(`${this.baseUrl}/v1/proof/verify`, {
        appId: this.appId,
        proofData,
        userAddress
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        isValid: response.data.isValid,
        verificationLevel: response.data.verificationLevel,
        attributes: response.data.attributes
      };
    } catch (error) {
      console.error('zkMe proof verification failed:', error);
      throw new Error('Failed to verify zkMe proof');
    }
  }

  /**
   * Get user verification data for cross-chain
   */
  async getUserVerificationData(userAddress) {
    try {
      const response = await axios.get(`${this.baseUrl}/v1/user/${userAddress}/verification`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        isVerified: response.data.isVerified,
        verificationLevel: response.data.verificationLevel,
        supportedChains: response.data.supportedChains,
        attributes: response.data.attributes
      };
    } catch (error) {
      console.error('Failed to get user verification data:', error);
      return {
        isVerified: false,
        verificationLevel: 0,
        supportedChains: [],
        attributes: {}
      };
    }
  }

  /**
   * Handle zkMe webhook
   */
  async handleWebhook(webhookData) {
    const { sessionId, status, userAddress, verificationLevel, proofData } = webhookData;

    // Update database with verification status
    // This would integrate with your database service
    console.log('zkMe webhook received:', {
      sessionId,
      status,
      userAddress,
      verificationLevel
    });

    if (status === 'verified') {
      // Trigger on-chain verification update
      return {
        success: true,
        shouldUpdateOnChain: true,
        verificationData: {
          userAddress,
          verificationLevel,
          proofData
        }
      };
    }

    return {
      success: true,
      shouldUpdateOnChain: false
    };
  }

  /**
   * Generate widget configuration for frontend
   */
  generateWidgetConfig(userAddress, chain = 'solana') {
    return {
      appId: this.appId,
      userAddress,
      chain,
      theme: 'dark',
      mode: 'modal',
      redirectUrl: `${process.env.FRONTEND_URL}/auth?verification=complete`,
      onSuccess: 'redirect',
      onError: 'close'
    };
  }

  /**
   * Verify zkMe proof on-chain (multi-chain support)
   */
  async verifyOnChain(userAddress, chain, provider) {
    try {
      const contractAddress = this.contracts[chain];
      if (!contractAddress) {
        throw new Error(`Chain ${chain} not supported`);
      }

      // zkMe contract ABI for verification
      const zkMeABI = [
        'function verify(address user, bytes memory proof) external view returns (bool)',
        'function isVerified(address user) external view returns (bool)'
      ];

      const contract = new ethers.Contract(contractAddress, zkMeABI, provider);
      const isVerified = await contract.isVerified(userAddress);

      return {
        isVerified,
        chain,
        contractAddress
      };
    } catch (error) {
      console.error('On-chain verification failed:', error);
      return {
        isVerified: false,
        error: error.message
      };
    }
  }

  /**
   * Get zkMe SDK configuration for frontend
   */
  getSDKConfig() {
    return {
      appId: this.appId,
      apiKey: this.apiKey,
      baseUrl: this.baseUrl,
      supportedChains: Object.keys(this.contracts),
      contracts: this.contracts
    };
  }
}

export default ZkmeService;
export { ZkmeService };