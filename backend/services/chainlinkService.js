import { ethers } from 'ethers';
import { analyzeEscrowRisk } from './aws.js';

// Chainlink Price Feed ABI (minimal)
const PRICE_FEED_ABI = [
  "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)"
];

// Chainlink Functions ABI (minimal)
const FUNCTIONS_ABI = [
  "function sendRequest(bytes32 donId, bytes calldata source, bytes calldata secrets, string[] calldata args, uint64 subscriptionId, uint32 gasLimit) external returns (bytes32 requestId)"
];

class ChainlinkService {
  constructor() {
    this.priceFeeds = {
      // Ethereum Mainnet Price Feeds
      'ETH/USD': '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
      'BTC/USD': '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
      'SOL/USD': '0x4ffC43a60e009B551865A93d232E33Fce9f01507',
      'USDC/USD': '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6'
    };
    
    this.functionsRouter = '0x65C939B26b8b2A8b8C8b8b8b8b8b8b8b8b8b8b8b'; // Functions Router address
    this.donId = '0x66756e2d657468657265756d2d6d61696e6e65742d3100000000000000000000'; // DON ID
  }

  /**
   * Get current price from Chainlink Data Feed
   */
  async getPrice(pair, provider) {
    try {
      const feedAddress = this.priceFeeds[pair];
      if (!feedAddress) {
        throw new Error(`Price feed not available for ${pair}`);
      }

      const priceFeed = new ethers.Contract(feedAddress, PRICE_FEED_ABI, provider);
      const roundData = await priceFeed.latestRoundData();
      
      // Price feeds return price with 8 decimals
      const price = Number(roundData.answer) / 1e8;
      const timestamp = Number(roundData.updatedAt);
      
      return {
        price,
        timestamp,
        roundId: roundData.roundId.toString()
      };
    } catch (error) {
      console.error(`Failed to get ${pair} price:`, error);
      throw error;
    }
  }

  /**
   * Calculate USD value of escrow amount
   */
  async calculateUSDValue(amount, tokenSymbol, provider) {
    const pair = `${tokenSymbol}/USD`;
    const priceData = await this.getPrice(pair, provider);
    
    return {
      usdValue: amount * priceData.price,
      price: priceData.price,
      timestamp: priceData.timestamp
    };
  }

  /**
   * Create Chainlink Functions source code for AI verification
   */
  createVerificationSource() {
    return `
      // Chainlink Functions source code for AI verification
      const escrowId = args[0];
      const buyerOffer = args[1];
      const sellerHandle = args[2];
      const amount = args[3];
      
      // Call AetherLock AI service
      const aiRequest = Functions.makeHttpRequest({
        url: "https://api.aetherlock.com/verify",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": secrets.apiKey
        },
        data: {
          escrowId,
          buyerOffer,
          sellerHandle,
          amount
        }
      });
      
      const aiResponse = await aiRequest;
      
      if (aiResponse.error) {
        throw Error("AI verification failed");
      }
      
      const result = aiResponse.data;
      
      // Return verification result and risk score
      return Functions.encodeUint256(
        result.verified ? 1 : 0,
        Math.floor(result.riskScore)
      );
    `;
  }

  /**
   * Submit verification request to Chainlink Functions
   */
  async submitVerificationRequest(escrowData, signer, subscriptionId) {
    try {
      const functionsContract = new ethers.Contract(
        this.functionsRouter,
        FUNCTIONS_ABI,
        signer
      );

      const source = this.createVerificationSource();
      const args = [
        escrowData.escrowId,
        escrowData.buyerOffer,
        escrowData.sellerHandle,
        escrowData.amount.toString()
      ];

      const secrets = ethers.utils.toUtf8Bytes(JSON.stringify({
        apiKey: process.env.AETHERLOCK_API_KEY
      }));

      const gasLimit = 300000;

      const tx = await functionsContract.sendRequest(
        this.donId,
        ethers.utils.toUtf8Bytes(source),
        secrets,
        args,
        subscriptionId,
        gasLimit
      );

      const receipt = await tx.wait();
      
      // Extract request ID from logs
      const requestId = receipt.logs[0].topics[1];
      
      return {
        requestId,
        transactionHash: tx.hash
      };
    } catch (error) {
      console.error('Failed to submit verification request:', error);
      throw error;
    }
  }

  /**
   * Create automation-compatible condition checker
   */
  createAutomationCondition(escrowAddress, escrowId) {
    return {
      target: escrowAddress,
      checkData: ethers.utils.defaultAbiCoder.encode(
        ['bytes32'],
        [escrowId]
      ),
      performData: ethers.utils.defaultAbiCoder.encode(
        ['bytes32', 'bool'],
        [escrowId, true] // Auto-release flag
      )
    };
  }

  /**
   * Risk assessment with price volatility
   */
  async assessRiskWithPrice(escrowData, provider) {
    try {
      // Get current price and calculate USD value
      const usdData = await this.calculateUSDValue(
        escrowData.amount,
        escrowData.tokenSymbol,
        provider
      );

      // Enhanced risk analysis with price data
      const riskFactors = {
        usdValue: usdData.usdValue,
        priceVolatility: await this.calculateVolatility(escrowData.tokenSymbol, provider),
        ...escrowData
      };

      // Use existing AWS Bedrock analysis with price context
      const aiAnalysis = await analyzeEscrowRisk(riskFactors);

      return {
        ...aiAnalysis,
        usdValue: usdData.usdValue,
        tokenPrice: usdData.price,
        priceTimestamp: usdData.timestamp,
        volatilityScore: riskFactors.priceVolatility
      };
    } catch (error) {
      console.error('Risk assessment failed:', error);
      throw error;
    }
  }

  /**
   * Calculate price volatility (simplified)
   */
  async calculateVolatility(tokenSymbol, provider) {
    try {
      // Get multiple price points (simplified - in production, use historical data)
      const currentPrice = await this.getPrice(`${tokenSymbol}/USD`, provider);
      
      // Return volatility score (0-100)
      // In production, calculate from historical price data
      return Math.min(100, Math.abs(currentPrice.price * 0.1));
    } catch (error) {
      console.error('Volatility calculation failed:', error);
      return 50; // Default moderate volatility
    }
  }
}

export default ChainlinkService;