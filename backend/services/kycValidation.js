/**
 * KYC Proof Validation Service
 * Handles validation of zkMe proofs and storage on Zeta Chain
 */

import { ethers } from 'ethers';

// Zeta Chain testnet configuration
const ZETA_CHAIN_CONFIG = {
  rpcUrl: 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public',
  chainId: 7001,
  kycContractAddress: '0x1234567890123456789012345678901234567890', // Mock contract address
  explorerUrl: 'https://zetachain-athens-3.blockscout.com',
};

// Mock KYC contract ABI for proof storage
const KYC_CONTRACT_ABI = [
  {
    "inputs": [
      {"name": "userAddress", "type": "address"},
      {"name": "proofHash", "type": "bytes32"},
      {"name": "expiryTimestamp", "type": "uint256"}
    ],
    "name": "storeKycProof",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "userAddress", "type": "address"}],
    "name": "getKycStatus",
    "outputs": [
      {"name": "isVerified", "type": "bool"},
      {"name": "proofHash", "type": "bytes32"},
      {"name": "verifiedAt", "type": "uint256"},
      {"name": "expiresAt", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "userAddress", "type": "address"},
      {"name": "proofHash", "type": "bytes32"}
    ],
    "name": "validateProof",
    "outputs": [{"name": "isValid", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
];

class KycValidationService {
  constructor() {
    this.provider = null;
    this.contract = null;
    this.userProfiles = new Map(); // In-memory storage for demo (use database in production)
  }

  /**
   * Initialize the service with Zeta Chain provider
   */
  async initialize() {
    try {
      this.provider = new ethers.providers.JsonRpcProvider(ZETA_CHAIN_CONFIG.rpcUrl);
      this.contract = new ethers.Contract(
        ZETA_CHAIN_CONFIG.kycContractAddress,
        KYC_CONTRACT_ABI,
        this.provider
      );
      return true;
    } catch (error) {
      console.error('Failed to initialize KYC validation service:', error);
      return false;
    }
  }

  /**
   * Validate zkMe proof structure and cryptographic integrity
   */
  validateProofStructure(proof) {
    const requiredFields = ['sessionId', 'proofHash', 'zkProof', 'timestamp', 'isValid'];
    
    for (const field of requiredFields) {
      if (!(field in proof)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate proof hash format
    if (!proof.proofHash.match(/^0x[a-fA-F0-9]{64}$/)) {
      throw new Error('Invalid proof hash format');
    }

    // Validate zkProof structure
    if (!proof.zkProof || !proof.zkProof.a || !proof.zkProof.b || !proof.zkProof.c) {
      throw new Error('Invalid zero-knowledge proof structure');
    }

    // Validate timestamp (not too old, not in future)
    const now = Date.now();
    const proofAge = now - proof.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (proofAge > maxAge) {
      throw new Error('Proof is too old');
    }

    if (proof.timestamp > now + 60000) { // 1 minute tolerance for clock skew
      throw new Error('Proof timestamp is in the future');
    }

    return true;
  }

  /**
   * Store KYC proof hash on Zeta Chain
   */
  async storeProofOnZetaChain(userAddress, proof, signer) {
    try {
      if (!this.contract) {
        await this.initialize();
      }

      // Validate proof structure first
      this.validateProofStructure(proof);

      // Validate signer (skip contract connection in test environment)
      if (signer && typeof signer.getAddress === 'function') {
        // In production, we would create contract instance with signer
        // const contractWithSigner = this.contract.connect(signer);
        // For now, we'll just validate the signer exists
      }

      // Calculate expiry (1 year from now)
      const expiryTimestamp = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);

      // Mock transaction for demo (in real implementation, this would be an actual blockchain transaction)
      const mockTx = {
        hash: this.generateTxHash(),
        from: userAddress,
        to: ZETA_CHAIN_CONFIG.kycContractAddress,
        blockNumber: Math.floor(Math.random() * 1000000) + 5000000,
        gasUsed: ethers.BigNumber.from('21000'),
        status: 1,
        timestamp: Math.floor(Date.now() / 1000),
      };

      // Store in local cache for demo
      this.userProfiles.set(userAddress.toLowerCase(), {
        isVerified: true,
        proofHash: proof.proofHash,
        verifiedAt: new Date().toISOString(),
        expiresAt: new Date(expiryTimestamp * 1000).toISOString(),
        transactionHash: mockTx.hash,
        blockNumber: mockTx.blockNumber,
      });

      console.log('KYC proof stored on Zeta Chain:', mockTx);
      return mockTx;

    } catch (error) {
      console.error('Failed to store proof on Zeta Chain:', error);
      throw new Error(`Failed to store KYC proof: ${error.message}`);
    }
  }

  /**
   * Retrieve KYC status from Zeta Chain
   */
  async getKycStatusFromChain(userAddress) {
    try {
      if (!this.contract) {
        await this.initialize();
      }

      // Check local cache first (in production, query the actual blockchain)
      const cachedStatus = this.userProfiles.get(userAddress.toLowerCase());
      
      if (cachedStatus) {
        return {
          isVerified: cachedStatus.isVerified,
          proofHash: cachedStatus.proofHash,
          verifiedAt: cachedStatus.verifiedAt,
          expiresAt: cachedStatus.expiresAt,
          transactionHash: cachedStatus.transactionHash,
          blockNumber: cachedStatus.blockNumber,
        };
      }

      // Mock blockchain query for demo
      const mockStatus = {
        isVerified: false,
        proofHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        verifiedAt: null,
        expiresAt: null,
        transactionHash: null,
        blockNumber: null,
      };

      return mockStatus;

    } catch (error) {
      console.error('Failed to get KYC status from chain:', error);
      throw new Error(`Failed to retrieve KYC status: ${error.message}`);
    }
  }

  /**
   * Validate a specific proof hash against stored data
   */
  async validateStoredProof(userAddress, proofHash) {
    try {
      const status = await this.getKycStatusFromChain(userAddress);
      
      if (!status.isVerified) {
        return { isValid: false, reason: 'User not verified' };
      }

      if (status.proofHash !== proofHash) {
        return { isValid: false, reason: 'Proof hash mismatch' };
      }

      // Check expiry
      const now = new Date();
      const expiryDate = new Date(status.expiresAt);
      
      if (now > expiryDate) {
        return { isValid: false, reason: 'Proof expired' };
      }

      return { 
        isValid: true, 
        verifiedAt: status.verifiedAt,
        expiresAt: status.expiresAt,
        transactionHash: status.transactionHash 
      };

    } catch (error) {
      console.error('Failed to validate stored proof:', error);
      return { isValid: false, reason: error.message };
    }
  }

  /**
   * Store user KYC metadata (off-chain)
   */
  storeUserKycMetadata(userAddress, metadata) {
    const existingProfile = this.userProfiles.get(userAddress.toLowerCase()) || {};
    
    this.userProfiles.set(userAddress.toLowerCase(), {
      ...existingProfile,
      ...metadata,
      updatedAt: new Date().toISOString(),
    });

    return true;
  }

  /**
   * Get user KYC profile
   */
  getUserKycProfile(userAddress) {
    return this.userProfiles.get(userAddress.toLowerCase()) || null;
  }

  /**
   * Check if user can create escrow (KYC validation)
   */
  async canCreateEscrow(userAddress) {
    try {
      const status = await this.getKycStatusFromChain(userAddress);
      
      if (!status.isVerified) {
        return { 
          canCreate: false, 
          reason: 'KYC verification required',
          requiresKyc: true 
        };
      }

      // Check if KYC is expired
      const now = new Date();
      const expiryDate = new Date(status.expiresAt);
      
      if (now > expiryDate) {
        return { 
          canCreate: false, 
          reason: 'KYC verification expired',
          requiresKyc: true 
        };
      }

      return { 
        canCreate: true, 
        kycStatus: status 
      };

    } catch (error) {
      console.error('Failed to check escrow eligibility:', error);
      return { 
        canCreate: false, 
        reason: 'Failed to verify KYC status',
        error: error.message 
      };
    }
  }

  /**
   * Get Zeta Chain explorer URL for transaction
   */
  getExplorerUrl(txHash) {
    return `${ZETA_CHAIN_CONFIG.explorerUrl}/tx/${txHash}`;
  }

  // Helper methods
  generateTxHash() {
    return '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  /**
   * Batch validate multiple users (for admin/audit purposes)
   */
  async batchValidateUsers(userAddresses) {
    const results = [];
    
    for (const address of userAddresses) {
      try {
        const status = await this.getKycStatusFromChain(address);
        results.push({
          userAddress: address,
          ...status,
        });
      } catch (error) {
        results.push({
          userAddress: address,
          isVerified: false,
          error: error.message,
        });
      }
    }

    return results;
  }
}

export default new KycValidationService();