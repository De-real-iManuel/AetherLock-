import { ethers } from 'ethers';

class ZetaChainService {
  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(process.env.ZETACHAIN_RPC_URL || 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public');
    
    const privateKey = process.env.ZETACHAIN_PRIVATE_KEY;
    if (privateKey && privateKey !== 'your_zetachain_private_key') {
      this.wallet = new ethers.Wallet(privateKey, this.provider);
    } else {
      console.warn('ZetaChain private key not configured - running in read-only mode');
      this.wallet = null;
    }
    
    this.gatewayAddress = process.env.ZETACHAIN_GATEWAY_ADDRESS;
    
    // Gateway ABI for cross-chain calls
    this.gatewayABI = [
      "function call(bytes memory receiver, address zrc20, bytes calldata message, (uint256 gasLimit, bool isArbitraryCall) calldata callOptions, (address revertAddress, bool callOnRevert, bytes abortAddress, bytes revertMessage, uint256 onRevertGasLimit) calldata revertOptions) external",
      "function deposit(address receiver, uint256 amount, address asset, (address revertAddress, bool callOnRevert, bytes abortAddress, bytes revertMessage, uint256 onRevertGasLimit) calldata revertOptions) external",
      "function withdraw(bytes memory receiver, uint256 amount, address zrc20, (address revertAddress, bool callOnRevert, bytes abortAddress, bytes revertMessage, uint256 onRevertGasLimit) calldata revertOptions) external"
    ];
    
    this.gateway = this.wallet ? new ethers.Contract(this.gatewayAddress, this.gatewayABI, this.wallet) : null;
  }

  /**
   * Initiate cross-chain escrow from ZetaChain to Solana
   */
  async initiateCrossChainEscrow(escrowData) {
    if (!this.wallet || !this.gateway) {
      throw new Error('ZetaChain wallet not configured');
    }
    try {
      const { escrowId, amount, buyerAddress, sellerAddress, destinationChain } = escrowData;
      
      // Encode cross-chain message
      const message = ethers.utils.defaultAbiCoder.encode(
        ['bytes32', 'string', 'string', 'bytes32', 'uint8', 'uint256', 'bytes32'],
        [
          escrowId,
          'zetachain',
          destinationChain,
          ethers.utils.hexZeroPad(buyerAddress, 32),
          0, // InitiateEscrow action
          amount,
          ethers.utils.hexZeroPad(sellerAddress, 32)
        ]
      );

      // Solana program address (as bytes)
      const solanaReceiver = ethers.utils.arrayify(process.env.SOLANA_PROGRAM_ID);
      
      const callOptions = {
        gasLimit: 500000,
        isArbitraryCall: true
      };

      const revertOptions = {
        revertAddress: this.wallet.address,
        callOnRevert: true,
        abortAddress: ethers.utils.arrayify(this.wallet.address),
        revertMessage: ethers.utils.toUtf8Bytes("Escrow initiation failed"),
        onRevertGasLimit: 100000
      };

      const tx = await this.gateway.call(
        solanaReceiver,
        process.env.ZETACHAIN_ZRC20_ADDRESS, // ZRC20 token address
        message,
        callOptions,
        revertOptions
      );

      const receipt = await tx.wait();
      
      return {
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Cross-chain escrow initiation failed:', error);
      throw error;
    }
  }

  /**
   * Release funds cross-chain
   */
  async releaseFundsCrossChain(escrowId, amount, recipientAddress, destinationChain) {
    try {
      const message = ethers.utils.defaultAbiCoder.encode(
        ['bytes32', 'string', 'string', 'bytes32', 'uint8', 'uint256', 'bytes32'],
        [
          escrowId,
          'zetachain',
          destinationChain,
          ethers.utils.hexZeroPad(recipientAddress, 32),
          1, // ReleaseEscrow action
          amount,
          ethers.utils.hexZeroPad(recipientAddress, 32)
        ]
      );

      const destinationReceiver = this.getDestinationReceiver(destinationChain);
      
      const callOptions = {
        gasLimit: 300000,
        isArbitraryCall: true
      };

      const revertOptions = {
        revertAddress: this.wallet.address,
        callOnRevert: true,
        abortAddress: ethers.utils.arrayify(this.wallet.address),
        revertMessage: ethers.utils.toUtf8Bytes("Fund release failed"),
        onRevertGasLimit: 100000
      };

      const tx = await this.gateway.call(
        destinationReceiver,
        process.env.ZETACHAIN_ZRC20_ADDRESS,
        message,
        callOptions,
        revertOptions
      );

      return await tx.wait();
    } catch (error) {
      console.error('Cross-chain fund release failed:', error);
      throw error;
    }
  }

  /**
   * Handle cross-chain refund
   */
  async refundCrossChain(escrowId, amount, buyerAddress, destinationChain) {
    try {
      const message = ethers.utils.defaultAbiCoder.encode(
        ['bytes32', 'string', 'string', 'bytes32', 'uint8', 'uint256', 'bytes32'],
        [
          escrowId,
          'zetachain',
          destinationChain,
          ethers.utils.hexZeroPad(buyerAddress, 32),
          2, // RefundEscrow action
          amount,
          ethers.utils.hexZeroPad(buyerAddress, 32)
        ]
      );

      const destinationReceiver = this.getDestinationReceiver(destinationChain);
      
      const callOptions = {
        gasLimit: 300000,
        isArbitraryCall: true
      };

      const revertOptions = {
        revertAddress: this.wallet.address,
        callOnRevert: true,
        abortAddress: ethers.utils.arrayify(this.wallet.address),
        revertMessage: ethers.utils.toUtf8Bytes("Refund failed"),
        onRevertGasLimit: 100000
      };

      const tx = await this.gateway.call(
        destinationReceiver,
        process.env.ZETACHAIN_ZRC20_ADDRESS,
        message,
        callOptions,
        revertOptions
      );

      return await tx.wait();
    } catch (error) {
      console.error('Cross-chain refund failed:', error);
      throw error;
    }
  }

  /**
   * Get destination chain receiver address
   */
  getDestinationReceiver(chain) {
    const receivers = {
      'solana': ethers.utils.arrayify(process.env.SOLANA_PROGRAM_ID),
      'sui': ethers.utils.arrayify(process.env.SUI_PACKAGE_ID),
      'ton': ethers.utils.arrayify(process.env.TON_CONTRACT_ADDRESS)
    };
    
    return receivers[chain] || receivers['solana'];
  }

  /**
   * Listen for cross-chain events
   */
  async listenForCrossChainEvents(callback) {
    const filter = {
      address: this.gatewayAddress,
      topics: [
        ethers.utils.id("Call(address,bytes,bytes)")
      ]
    };

    this.provider.on(filter, (log) => {
      try {
        const decoded = ethers.utils.defaultAbiCoder.decode(
          ['address', 'bytes', 'bytes'],
          log.data
        );
        
        callback({
          type: 'cross_chain_call',
          receiver: decoded[0],
          message: decoded[2],
          transactionHash: log.transactionHash,
          blockNumber: log.blockNumber
        });
      } catch (error) {
        console.error('Failed to decode cross-chain event:', error);
      }
    });
  }

  /**
   * Get cross-chain transaction status
   */
  async getCrossChainStatus(txHash) {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return { status: 'pending' };
      }

      const success = receipt.status === 1;
      
      return {
        status: success ? 'completed' : 'failed',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        logs: receipt.logs
      };
    } catch (error) {
      console.error('Failed to get cross-chain status:', error);
      return { status: 'error', error: error.message };
    }
  }
}

export default ZetaChainService;