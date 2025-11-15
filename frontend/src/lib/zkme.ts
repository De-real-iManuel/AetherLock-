import { ethers } from 'ethers';

export const ZKME_CONFIG = {
  appId: 'M202510180319727898435789743751',
  apiKey: 'd7fc9c16.c430cee37dede15168a9308ea64c77fd',
  baseUrl: 'https://nest-api.zk.me',
  
  // Multi-chain contract addresses
  contracts: {
    ethereum: '0x0BA819C2ca7a7bE0F1Fa8d0F0F0F0F0F0F0F0F0F',
    polygon: '0x0BA819C2ca7a7bE0F1Fa8d0F0F0F0F0F0F0F0F0F',
    bsc: '0x0BA819C2ca7a7bE0F1Fa8d0F0F0F0F0F0F0F0F0F',
    arbitrum: '0x0BA819C2ca7a7bE0F1Fa8d0F0F0F0F0F0F0F0F0F',
    optimism: '0x0BA819C2ca7a7bE0F1Fa8d0F0F0F0F0F0F0F0F0F',
    base: '0x0BA819C2ca7a7bE0F1Fa8d0F0F0F0F0F0F0F0F0F',
    zetachain: '0x0BA819C2ca7a7bE0F1Fa8d0F0F0F0F0F0F0F0F0F'
  }
};

export class ZkMeSDK {
  private appId: string;
  private provider: any;

  constructor(appId: string = ZKME_CONFIG.appId) {
    this.appId = appId;
  }

  /**
   * Initialize zkMe widget
   */
  async initWidget(userAddress: string, chain: string) {
    try {
      const response = await fetch('/api/zkme/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAddress, chain })
      });

      const data = await response.json();
      
      if (data.success) {
        return {
          sessionId: data.sessionId,
          verificationUrl: data.verificationUrl,
          qrCode: data.qrCode
        };
      }
      
      throw new Error('Failed to initialize zkMe widget');
    } catch (error) {
      console.error('zkMe widget initialization failed:', error);
      throw error;
    }
  }

  /**
   * Check verification status
   */
  async checkStatus(sessionId: string) {
    try {
      const response = await fetch(`/api/zkme/status/${sessionId}`);
      const data = await response.json();
      
      return {
        status: data.status,
        verificationLevel: data.verificationLevel,
        timestamp: data.timestamp
      };
    } catch (error) {
      console.error('Status check failed:', error);
      throw error;
    }
  }

  /**
   * Verify on-chain using zkMe smart contract
   */
  async verifyOnChain(userAddress: string, chain: string, provider: any) {
    try {
      const contractAddress = ZKME_CONFIG.contracts[chain];
      if (!contractAddress) {
        throw new Error(`Chain ${chain} not supported`);
      }

      const zkMeABI = [
        'function isVerified(address user) external view returns (bool)',
        'function getVerificationLevel(address user) external view returns (uint256)'
      ];

      const contract = new ethers.Contract(contractAddress, zkMeABI, provider);
      const isVerified = await contract.isVerified(userAddress);
      
      let verificationLevel = 0;
      if (isVerified) {
        verificationLevel = await contract.getVerificationLevel(userAddress);
      }

      return {
        isVerified,
        verificationLevel: verificationLevel.toNumber(),
        chain,
        contractAddress
      };
    } catch (error) {
      console.error('On-chain verification failed:', error);
      return {
        isVerified: false,
        verificationLevel: 0,
        error: error.message
      };
    }
  }

  /**
   * Get user verification data
   */
  async getUserData(userAddress: string) {
    try {
      const response = await fetch(`/api/zkme/user/${userAddress}`);
      const data = await response.json();
      
      return {
        isVerified: data.isVerified,
        verificationLevel: data.verificationLevel,
        supportedChains: data.supportedChains,
        attributes: data.attributes
      };
    } catch (error) {
      console.error('Failed to get user data:', error);
      return {
        isVerified: false,
        verificationLevel: 0,
        supportedChains: [],
        attributes: {}
      };
    }
  }

  /**
   * Open zkMe verification modal
   */
  openVerificationModal(verificationUrl: string) {
    const width = 400;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    return window.open(
      verificationUrl,
      'zkme-verification',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  }
}

export default ZkMeSDK;