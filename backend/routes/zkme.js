import express from 'express';
import ZkmeService from '../services/zkmeService.js';

const router = express.Router();
const zkmeService = new ZkmeService();

// Initialize zkMe verification
router.post('/initialize', async (req, res) => {
  try {
    const { userAddress, chain } = req.body;
    
    if (!userAddress || !chain) {
      return res.status(400).json({
        success: false,
        error: 'Missing userAddress or chain'
      });
    }

    const result = await zkmeService.initializeVerification(userAddress, chain);
    
    res.json({
      success: true,
      sessionId: result.sessionId,
      verificationUrl: result.verificationUrl,
      qrCode: result.qrCode
    });
  } catch (error) {
    console.error('zkMe initialization error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Check verification status
router.get('/status/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const status = await zkmeService.checkVerificationStatus(sessionId);
    
    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    console.error('zkMe status check error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Webhook endpoint for zkMe callbacks
router.post('/webhook', async (req, res) => {
  try {
    const webhookData = req.body;
    
    const result = await zkmeService.handleWebhook(webhookData);
    
    if (result.shouldUpdateOnChain) {
      console.log('Should update on-chain verification:', result.verificationData);
    }
    
    // Update user KYC status in database
    if (result.userAddress && result.verified !== undefined) {
      try {
        await global.prisma.user.upsert({
          where: { walletAddress: result.userAddress },
          update: {
            zkMeVerified: result.verified,
            zkMeSessionId: result.sessionId,
            zkMeProofHash: result.proofHash
          },
          create: {
            walletAddress: result.userAddress,
            zkMeVerified: result.verified,
            zkMeSessionId: result.sessionId,
            zkMeProofHash: result.proofHash,
            trustScore: 50
          }
        });
        
        // Notify user via WebSocket
        global.io.to(`user:${result.userAddress}`).emit('kyc_update', {
          verified: result.verified,
          status: result.verified ? 'verified' : 'rejected',
          message: result.verified ? 'KYC verification successful' : 'KYC verification failed'
        });
      } catch (dbError) {
        console.error('Database update error:', dbError);
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('zkMe webhook error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user KYC status by wallet address
router.get('/user/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    const user = await global.prisma.user.findUnique({
      where: { walletAddress },
      select: {
        zkMeVerified: true,
        zkMeSessionId: true,
        zkMeProofHash: true
      }
    });
    
    if (!user) {
      return res.json({
        success: true,
        verified: false,
        status: 'not_started'
      });
    }
    
    res.json({
      success: true,
      verified: user.zkMeVerified,
      status: user.zkMeVerified ? 'verified' : (user.zkMeSessionId ? 'pending' : 'not_started'),
      sessionId: user.zkMeSessionId,
      proofHash: user.zkMeProofHash
    });
  } catch (error) {
    console.error('Get KYC status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;