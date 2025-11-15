import express from 'express';
import ZetaChainService from '../services/zetachainService.js';
import ChainlinkService from '../services/chainlinkService.js';
import IPFSService from '../services/ipfsService.js';
import { analyzeEscrowRisk } from '../services/aws.js';
import { verifyWalletSignature, optionalAuth } from '../middleware/auth.js';

const router = express.Router();
const zetaChainService = new ZetaChainService();
const chainlinkService = new ChainlinkService();
const ipfsService = new IPFSService();

// Create cross-chain escrow
router.post('/create', async (req, res) => {
  try {
    const { 
      title, 
      description, 
      amount, 
      tokenSymbol,
      deadline, 
      sellerAddress, 
      sourceChain, 
      destinationChain 
    } = req.body;

    // Generate escrow ID
    const escrowId = Buffer.from(Date.now().toString() + Math.random().toString()).slice(0, 32);

    // Get price data from Chainlink
    const priceData = await chainlinkService.calculateUSDValue(amount, tokenSymbol, null);

    // AI risk assessment
    const riskAssessment = await analyzeEscrowRisk({
      title,
      description,
      amount,
      usdValue: priceData.usdValue,
      sellerAddress
    });

    // Initiate cross-chain escrow via ZetaChain
    const crossChainTx = await zetaChainService.initiateCrossChainEscrow({
      escrowId,
      amount,
      buyerAddress: req.user?.address,
      sellerAddress,
      destinationChain
    });

    res.json({
      success: true,
      escrowId: escrowId.toString('hex'),
      transactionHash: crossChainTx.transactionHash,
      riskScore: riskAssessment.riskScore,
      usdValue: priceData.usdValue
    });
  } catch (error) {
    console.error('Escrow creation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Submit evidence for AI verification
router.post('/:escrowId/evidence', async (req, res) => {
  try {
    const { escrowId } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No evidence files provided'
      });
    }

    // Upload files to IPFS
    const ipfsUploads = await ipfsService.uploadMultipleFiles(files);
    
    // Store metadata on IPFS
    const metadata = {
      escrowId,
      files: ipfsUploads.files.map(f => ({
        ipfsHash: f.ipfsHash,
        url: f.url,
        size: f.size
      })),
      timestamp: Date.now()
    };
    
    const metadataUpload = await ipfsService.uploadJSON(metadata);

    res.json({
      success: true,
      evidenceHashes: ipfsUploads.files.map(f => f.ipfsHash),
      metadataHash: metadataUpload.ipfsHash,
      metadataUrl: metadataUpload.url,
      message: 'Evidence uploaded to IPFS successfully'
    });
  } catch (error) {
    console.error('Evidence upload failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Request AI verification
router.post('/:escrowId/verify', async (req, res) => {
  try {
    const { escrowId } = req.params;
    const { evidenceHashes, clientReview } = req.body;

    // AI verification process
    const verificationResult = await analyzeEscrowRisk({
      escrowId,
      evidenceHashes,
      clientReview,
      timestamp: Date.now()
    });

    const passed = verificationResult.riskScore < 30; // Low risk threshold

    // Submit to Chainlink Functions for on-chain verification
    const chainlinkRequest = await chainlinkService.submitVerificationRequest({
      escrowId,
      verificationResult: passed,
      riskScore: verificationResult.riskScore
    });

    res.json({
      success: true,
      passed,
      confidence: 100 - verificationResult.riskScore,
      feedback: verificationResult.analysis,
      chainlinkRequestId: chainlinkRequest.requestId
    });
  } catch (error) {
    console.error('Verification failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Release funds cross-chain
router.post('/:escrowId/release', async (req, res) => {
  try {
    const { escrowId } = req.params;
    const { amount, recipientAddress, destinationChain } = req.body;

    const tx = await zetaChainService.releaseFundsCrossChain(
      escrowId,
      amount,
      recipientAddress,
      destinationChain
    );

    res.json({
      success: true,
      transactionHash: tx.transactionHash,
      status: 'released'
    });
  } catch (error) {
    console.error('Fund release failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get escrow status
router.get('/:escrowId/status', async (req, res) => {
  try {
    const { escrowId } = req.params;

    // Get cross-chain status
    const status = await zetaChainService.getCrossChainStatus(escrowId);

    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    console.error('Status check failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get single escrow by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const escrow = await global.prisma.escrow.findUnique({
      where: { id },
      include: {
        buyer: {
          select: {
            id: true,
            walletAddress: true,
            trustScore: true,
            zkMeVerified: true
          }
        },
        seller: {
          select: {
            id: true,
            walletAddress: true,
            trustScore: true,
            zkMeVerified: true
          }
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });
    
    if (!escrow) {
      return res.status(404).json({
        success: false,
        error: 'Escrow not found'
      });
    }
    
    res.json({
      success: true,
      escrow: {
        id: escrow.id,
        escrowId: escrow.escrowId,
        title: escrow.title,
        description: escrow.description,
        amount: escrow.amount,
        feeAmount: escrow.feeAmount,
        status: escrow.status,
        clientAddress: escrow.buyer.walletAddress,
        freelancerAddress: escrow.seller.walletAddress,
        clientTrustScore: escrow.buyer.trustScore,
        freelancerTrustScore: escrow.seller.trustScore,
        createdAt: escrow.createdAt,
        expiresAt: escrow.expiresAt,
        sourceChain: escrow.sourceChain,
        destinationChain: escrow.destinationChain,
        evidenceIpfsHash: escrow.evidenceIpfsHash,
        aiVerificationHash: escrow.aiVerificationHash,
        verificationResult: escrow.verificationResult,
        disputeRaised: escrow.disputeRaised,
        transactions: escrow.transactions
      }
    });
  } catch (error) {
    console.error('Get escrow error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get list of escrows with filtering and pagination
router.get('/list', optionalAuth, async (req, res) => {
  try {
    const {
      status,
      clientAddress,
      freelancerAddress,
      minAmount,
      maxAmount,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    
    // Build where clause
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (clientAddress) {
      const buyer = await global.prisma.user.findUnique({
        where: { walletAddress: clientAddress }
      });
      if (buyer) {
        where.buyerId = buyer.id;
      }
    }
    
    if (freelancerAddress) {
      const seller = await global.prisma.user.findUnique({
        where: { walletAddress: freelancerAddress }
      });
      if (seller) {
        where.sellerId = seller.id;
      }
    }
    
    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) where.amount.gte = parseFloat(minAmount);
      if (maxAmount) where.amount.lte = parseFloat(maxAmount);
    }
    
    // Get total count
    const total = await global.prisma.escrow.count({ where });
    
    // Get escrows
    const escrows = await global.prisma.escrow.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
      include: {
        buyer: {
          select: {
            walletAddress: true,
            trustScore: true,
            zkMeVerified: true
          }
        },
        seller: {
          select: {
            walletAddress: true,
            trustScore: true,
            zkMeVerified: true
          }
        }
      }
    });
    
    res.json({
      success: true,
      escrows: escrows.map(e => ({
        id: e.id,
        escrowId: e.escrowId,
        title: e.title,
        description: e.description,
        amount: e.amount,
        status: e.status,
        clientAddress: e.buyer.walletAddress,
        freelancerAddress: e.seller.walletAddress,
        clientTrustScore: e.buyer.trustScore,
        freelancerTrustScore: e.seller.trustScore,
        createdAt: e.createdAt,
        expiresAt: e.expiresAt,
        sourceChain: e.sourceChain
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('List escrows error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Accept escrow (freelancer accepts the job)
router.put('/:id/accept', verifyWalletSignature, async (req, res) => {
  try {
    const { id } = req.params;
    const { walletAddress } = req.user;
    
    const escrow = await global.prisma.escrow.findUnique({
      where: { id },
      include: { seller: true }
    });
    
    if (!escrow) {
      return res.status(404).json({
        success: false,
        error: 'Escrow not found'
      });
    }
    
    if (escrow.seller.walletAddress !== walletAddress) {
      return res.status(403).json({
        success: false,
        error: 'Only the assigned freelancer can accept this escrow'
      });
    }
    
    if (escrow.status !== 'CREATED') {
      return res.status(400).json({
        success: false,
        error: 'Escrow cannot be accepted in current status'
      });
    }
    
    const updatedEscrow = await global.prisma.escrow.update({
      where: { id },
      data: { status: 'ACTIVE' }
    });
    
    // Notify via WebSocket
    global.io.to(`escrow_${escrow.escrowId}`).emit('escrow_update', {
      escrowId: escrow.escrowId,
      status: 'ACTIVE',
      message: 'Escrow accepted by freelancer'
    });
    
    res.json({
      success: true,
      escrow: {
        id: updatedEscrow.id,
        status: updatedEscrow.status,
        updatedAt: updatedEscrow.updatedAt
      }
    });
  } catch (error) {
    console.error('Accept escrow error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Submit work for escrow
router.post('/:id/submit', verifyWalletSignature, async (req, res) => {
  try {
    const { id } = req.params;
    const { walletAddress } = req.user;
    const { description, evidenceHashes } = req.body;
    
    if (!description || !evidenceHashes || evidenceHashes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Description and evidence are required'
      });
    }
    
    const escrow = await global.prisma.escrow.findUnique({
      where: { id },
      include: { seller: true }
    });
    
    if (!escrow) {
      return res.status(404).json({
        success: false,
        error: 'Escrow not found'
      });
    }
    
    if (escrow.seller.walletAddress !== walletAddress) {
      return res.status(403).json({
        success: false,
        error: 'Only the freelancer can submit work'
      });
    }
    
    if (escrow.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        error: 'Escrow must be active to submit work'
      });
    }
    
    // Store evidence metadata
    const metadata = {
      escrowId: escrow.escrowId,
      description,
      evidenceHashes,
      submittedAt: new Date().toISOString()
    };
    
    const metadataUpload = await ipfsService.uploadJSON(metadata);
    
    const updatedEscrow = await global.prisma.escrow.update({
      where: { id },
      data: {
        status: 'AI_REVIEWING',
        evidenceIpfsHash: metadataUpload.ipfsHash
      }
    });
    
    // Notify via WebSocket
    global.io.to(`escrow_${escrow.escrowId}`).emit('escrow_update', {
      escrowId: escrow.escrowId,
      status: 'AI_REVIEWING',
      message: 'Work submitted for AI verification'
    });
    
    res.json({
      success: true,
      escrow: {
        id: updatedEscrow.id,
        status: updatedEscrow.status,
        evidenceIpfsHash: updatedEscrow.evidenceIpfsHash,
        updatedAt: updatedEscrow.updatedAt
      }
    });
  } catch (error) {
    console.error('Submit work error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Release funds
router.post('/:id/release', verifyWalletSignature, async (req, res) => {
  try {
    const { id } = req.params;
    const { walletAddress } = req.user;
    
    const escrow = await global.prisma.escrow.findUnique({
      where: { id },
      include: { buyer: true, seller: true }
    });
    
    if (!escrow) {
      return res.status(404).json({
        success: false,
        error: 'Escrow not found'
      });
    }
    
    if (escrow.buyer.walletAddress !== walletAddress) {
      return res.status(403).json({
        success: false,
        error: 'Only the client can release funds'
      });
    }
    
    if (!['AI_REVIEWING', 'VERIFIED'].includes(escrow.status)) {
      return res.status(400).json({
        success: false,
        error: 'Escrow must be verified before releasing funds'
      });
    }
    
    // Release funds via blockchain
    const tx = await zetaChainService.releaseFundsCrossChain(
      escrow.escrowId,
      escrow.amount,
      escrow.seller.walletAddress,
      escrow.destinationChain
    );
    
    const updatedEscrow = await global.prisma.escrow.update({
      where: { id },
      data: { status: 'COMPLETED' }
    });
    
    // Create transaction record
    await global.prisma.transaction.create({
      data: {
        escrowId: id,
        txHash: tx.transactionHash,
        chain: escrow.destinationChain || escrow.sourceChain,
        type: 'RELEASE',
        amount: escrow.amount,
        status: 'COMPLETED'
      }
    });
    
    // Notify via WebSocket
    global.io.to(`escrow_${escrow.escrowId}`).emit('escrow_update', {
      escrowId: escrow.escrowId,
      status: 'COMPLETED',
      message: 'Funds released to freelancer'
    });
    
    res.json({
      success: true,
      escrow: {
        id: updatedEscrow.id,
        status: updatedEscrow.status,
        transactionHash: tx.transactionHash
      }
    });
  } catch (error) {
    console.error('Release funds error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Open dispute
router.post('/:id/dispute', verifyWalletSignature, async (req, res) => {
  try {
    const { id } = req.params;
    const { walletAddress } = req.user;
    const { reason, evidenceHashes } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Dispute reason is required'
      });
    }
    
    const escrow = await global.prisma.escrow.findUnique({
      where: { id },
      include: { buyer: true, seller: true }
    });
    
    if (!escrow) {
      return res.status(404).json({
        success: false,
        error: 'Escrow not found'
      });
    }
    
    const isClient = escrow.buyer.walletAddress === walletAddress;
    const isFreelancer = escrow.seller.walletAddress === walletAddress;
    
    if (!isClient && !isFreelancer) {
      return res.status(403).json({
        success: false,
        error: 'Only parties involved can open a dispute'
      });
    }
    
    if (!['AI_REVIEWING', 'VERIFIED'].includes(escrow.status)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot dispute escrow in current status'
      });
    }
    
    // Store dispute evidence
    const disputeData = {
      escrowId: escrow.escrowId,
      initiatedBy: isClient ? 'client' : 'freelancer',
      reason,
      evidenceHashes: evidenceHashes || [],
      timestamp: new Date().toISOString()
    };
    
    const disputeUpload = await ipfsService.uploadJSON(disputeData);
    
    const updatedEscrow = await global.prisma.escrow.update({
      where: { id },
      data: {
        status: 'DISPUTED',
        disputeRaised: true
      }
    });
    
    // Notify via WebSocket
    global.io.to(`escrow_${escrow.escrowId}`).emit('escrow_update', {
      escrowId: escrow.escrowId,
      status: 'DISPUTED',
      message: 'Dispute opened',
      disputeIpfsHash: disputeUpload.ipfsHash
    });
    
    res.json({
      success: true,
      escrow: {
        id: updatedEscrow.id,
        status: updatedEscrow.status,
        disputeIpfsHash: disputeUpload.ipfsHash
      }
    });
  } catch (error) {
    console.error('Open dispute error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;