import { getAddress, parseEther } from 'ethers'
import { ZetaChainClient } from '@zetachain/toolkit'

// ZetaChain configuration for testnet
const ZETACHAIN_CONFIG = {
  network: 'testnet',
  rpcUrl: 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public',
  chainId: 7001,
  gatewayAddress: '0x6c533f7fe93fae114d0954697069df33c9b74fd7',
  tssAddress: '0x70e967acFcC17c3941E87562161406d41676FD83'
}

// Universal App contract addresses (deployed on ZetaChain testnet)
const UNIVERSAL_CONTRACTS = {
  escrow: '0x1234567890123456789012345678901234567890', // Placeholder - deploy actual contract
  kyc: '0x2345678901234567890123456789012345678901'     // Placeholder - deploy actual contract
}

export class ZetaChainService {
  private client: ZetaChainClient
  private isInitialized = false

  constructor() {
    this.client = new ZetaChainClient({
      network: ZETACHAIN_CONFIG.network
    })
  }

  /**
   * Initialize ZetaChain connection
   */
  async initialize(): Promise<void> {
    try {
      await this.client.initialize()
      this.isInitialized = true
      console.log('✅ ZetaChain service initialized')
    } catch (error) {
      console.error('❌ Failed to initialize ZetaChain service:', error)
      throw error
    }
  }

  /**
   * Create cross-chain escrow that syncs across Solana, Sui, and TON
   */
  async createUniversalEscrow(params: {
    escrowId: string
    buyer: string
    seller: string
    amount: string
    originChain: 'solana' | 'sui' | 'ton'
    targetChains: Array<'solana' | 'sui' | 'ton'>
    metadata: {
      taskDescription: string
      expiry: number
      aiAgentPubkey: string
    }
  }): Promise<{
    success: boolean
    txHash?: string
    universalEscrowId?: string
    error?: string
  }> {
    try {
      if (!this.isInitialized) {
        await this.initialize()
      }

      console.log('🌐 Creating universal escrow:', params.escrowId)

      // Prepare cross-chain message for escrow creation
      const crossChainMessage = {
        messageType: 'CREATE_ESCROW',
        escrowId: params.escrowId,
        buyer: params.buyer,
        seller: params.seller,
        amount: params.amount,
        originChain: params.originChain,
        targetChains: params.targetChains,
        metadata: params.metadata,
        timestamp: Math.floor(Date.now() / 1000)
      }

      // Call Universal App contract on ZetaChain
      const tx = await this.client.call({\n        contractAddress: UNIVERSAL_CONTRACTS.escrow,\n        functionName: 'createUniversalEscrow',\n        args: [\n          params.escrowId,\n          params.buyer,\n          params.seller,\n          parseEther(params.amount),\n          params.originChain,\n          params.targetChains,\n          JSON.stringify(params.metadata)\n        ],\n        gasLimit: 500000\n      })\n\n      console.log('✅ Universal escrow created:', tx.hash)\n\n      return {\n        success: true,\n        txHash: tx.hash,\n        universalEscrowId: params.escrowId\n      }\n\n    } catch (error) {\n      console.error('❌ Failed to create universal escrow:', error)\n      return {\n        success: false,\n        error: error instanceof Error ? error.message : 'Unknown error'\n      }\n    }\n  }\n\n  /**\n   * Broadcast escrow state change across all connected chains\n   */\n  async broadcastEscrowStateChange(params: {\n    escrowId: string\n    newState: 'funded' | 'verified' | 'disputed' | 'released' | 'refunded'\n    originChain: string\n    evidence?: {\n      hash: string\n      ipfsCid: string\n      aiVerificationResult: boolean\n    }\n  }): Promise<{\n    success: boolean\n    broadcastTxHash?: string\n    error?: string\n  }> {\n    try {\n      console.log('📡 Broadcasting escrow state change:', params)\n\n      const stateMessage = {\n        messageType: 'STATE_CHANGE',\n        escrowId: params.escrowId,\n        newState: params.newState,\n        originChain: params.originChain,\n        evidence: params.evidence,\n        timestamp: Math.floor(Date.now() / 1000)\n      }\n\n      // Broadcast to all connected chains via ZetaChain Gateway\n      const tx = await this.client.call({\n        contractAddress: UNIVERSAL_CONTRACTS.escrow,\n        functionName: 'broadcastStateChange',\n        args: [\n          params.escrowId,\n          params.newState,\n          params.originChain,\n          JSON.stringify(params.evidence || {})\n        ],\n        gasLimit: 300000\n      })\n\n      console.log('✅ State change broadcasted:', tx.hash)\n\n      return {\n        success: true,\n        broadcastTxHash: tx.hash\n      }\n\n    } catch (error) {\n      console.error('❌ Failed to broadcast state change:', error)\n      return {\n        success: false,\n        error: error instanceof Error ? error.message : 'Broadcast failed'\n      }\n    }\n  }\n\n  /**\n   * Store universal KYC proof on ZetaChain for cross-chain access\n   */\n  async storeUniversalKYC(params: {\n    userAddress: string\n    kycProofHash: string\n    zkProofData: string\n    validChains: Array<'solana' | 'sui' | 'ton' | 'zetachain'>\n  }): Promise<{\n    success: boolean\n    kycTxHash?: string\n    universalKycId?: string\n    error?: string\n  }> {\n    try {\n      console.log('🔐 Storing universal KYC proof for:', params.userAddress)\n\n      const kycData = {\n        userAddress: params.userAddress,\n        proofHash: params.kycProofHash,\n        zkProofData: params.zkProofData,\n        validChains: params.validChains,\n        timestamp: Math.floor(Date.now() / 1000),\n        expiryTimestamp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year\n      }\n\n      const tx = await this.client.call({\n        contractAddress: UNIVERSAL_CONTRACTS.kyc,\n        functionName: 'storeUniversalKYC',\n        args: [\n          params.userAddress,\n          params.kycProofHash,\n          params.zkProofData,\n          params.validChains\n        ],\n        gasLimit: 200000\n      })\n\n      const universalKycId = `zkkyc_${params.userAddress}_${Date.now()}`\n\n      console.log('✅ Universal KYC stored:', tx.hash)\n\n      return {\n        success: true,\n        kycTxHash: tx.hash,\n        universalKycId\n      }\n\n    } catch (error) {\n      console.error('❌ Failed to store universal KYC:', error)\n      return {\n        success: false,\n        error: error instanceof Error ? error.message : 'KYC storage failed'\n      }\n    }\n  }\n\n  /**\n   * Verify KYC status across all chains\n   */\n  async verifyUniversalKYC(userAddress: string): Promise<{\n    isVerified: boolean\n    validChains: string[]\n    expiryTimestamp?: number\n    error?: string\n  }> {\n    try {\n      console.log('🔍 Verifying universal KYC for:', userAddress)\n\n      const result = await this.client.view({\n        contractAddress: UNIVERSAL_CONTRACTS.kyc,\n        functionName: 'getKYCStatus',\n        args: [userAddress]\n      })\n\n      return {\n        isVerified: result.isVerified,\n        validChains: result.validChains,\n        expiryTimestamp: result.expiryTimestamp\n      }\n\n    } catch (error) {\n      console.error('❌ Failed to verify universal KYC:', error)\n      return {\n        isVerified: false,\n        validChains: [],\n        error: error instanceof Error ? error.message : 'KYC verification failed'\n      }\n    }\n  }\n\n  /**\n   * Get cross-chain escrow status\n   */\n  async getUniversalEscrowStatus(escrowId: string): Promise<{\n    exists: boolean\n    state: string\n    originChain: string\n    connectedChains: string[]\n    lastUpdate: number\n    error?: string\n  }> {\n    try {\n      console.log('📊 Getting universal escrow status:', escrowId)\n\n      const result = await this.client.view({\n        contractAddress: UNIVERSAL_CONTRACTS.escrow,\n        functionName: 'getEscrowStatus',\n        args: [escrowId]\n      })\n\n      return {\n        exists: result.exists,\n        state: result.state,\n        originChain: result.originChain,\n        connectedChains: result.connectedChains,\n        lastUpdate: result.lastUpdate\n      }\n\n    } catch (error) {\n      console.error('❌ Failed to get escrow status:', error)\n      return {\n        exists: false,\n        state: 'unknown',\n        originChain: '',\n        connectedChains: [],\n        lastUpdate: 0,\n        error: error instanceof Error ? error.message : 'Status check failed'\n      }\n    }\n  }\n\n  /**\n   * Listen for cross-chain events\n   */\n  subscribeToUniversalEvents(callback: (event: {\n    type: 'escrow_created' | 'state_changed' | 'kyc_updated'\n    data: any\n    timestamp: number\n  }) => void): () => void {\n    console.log('👂 Subscribing to universal events')\n\n    // Set up event listeners for cross-chain events\n    const eventFilter = {\n      address: UNIVERSAL_CONTRACTS.escrow,\n      topics: ['UniversalEscrowEvent']\n    }\n\n    const handleEvent = (log: any) => {\n      try {\n        const decoded = this.client.decodeEventLog(log)\n        callback({\n          type: decoded.eventType,\n          data: decoded.data,\n          timestamp: decoded.timestamp\n        })\n      } catch (error) {\n        console.error('Failed to decode event:', error)\n      }\n    }\n\n    // Start listening\n    this.client.on(eventFilter, handleEvent)\n\n    // Return cleanup function\n    return () => {\n      this.client.off(eventFilter, handleEvent)\n      console.log('🔇 Unsubscribed from universal events')\n    }\n  }\n\n  /**\n   * Get network statistics\n   */\n  async getNetworkStats(): Promise<{\n    totalEscrows: number\n    activeChains: string[]\n    totalVolume: string\n    successRate: number\n  }> {\n    try {\n      const stats = await this.client.view({\n        contractAddress: UNIVERSAL_CONTRACTS.escrow,\n        functionName: 'getNetworkStats',\n        args: []\n      })\n\n      return {\n        totalEscrows: stats.totalEscrows,\n        activeChains: stats.activeChains,\n        totalVolume: stats.totalVolume,\n        successRate: stats.successRate\n      }\n\n    } catch (error) {\n      console.error('❌ Failed to get network stats:', error)\n      return {\n        totalEscrows: 0,\n        activeChains: [],\n        totalVolume: '0',\n        successRate: 0\n      }\n    }\n  }\n}\n\n// Export singleton instance\nexport const zetaChainService = new ZetaChainService()\n\n// Export types\nexport interface UniversalEscrowEvent {\n  escrowId: string\n  eventType: 'created' | 'funded' | 'verified' | 'disputed' | 'released' | 'refunded'\n  originChain: string\n  timestamp: number\n  data: any\n}\n\nexport interface CrossChainStatus {\n  solana: 'connected' | 'disconnected' | 'syncing'\n  sui: 'connected' | 'disconnected' | 'syncing'\n  ton: 'connected' | 'disconnected' | 'syncing'\n  zetachain: 'connected' | 'disconnected' | 'syncing'\n}