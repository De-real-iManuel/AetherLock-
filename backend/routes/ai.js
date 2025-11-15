import express from 'express';
import AIAgentService from '../services/aiAgentService.js';
import MultiModalService from '../services/multiModalService.js';
import AIService from '../services/aiService.js';
import IPFSService from '../services/ipfsService.js';
import { verifyWalletSignature } from '../middleware/auth.js';

const router = express.Router();
const aiAgent = new AIAgentService();
const multiModal = new MultiModalService();
const aiService = new AIService();
const ipfsService = new IPFSService();

// Multi-agent dispute mediation
router.post('/mediate-dispute', async (req, res) => {
  try {
    const { dispute } = req.body;
    
    const mediation = await aiAgent.mediateDispute(dispute);
    
    res.json({
      success: true,
      mediation,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Mediation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Predictive risk scoring
router.post('/predict-risk', async (req, res) => {
  try {
    const { escrowData } = req.body;
    
    const prediction = await aiAgent.predictRisk(escrowData);
    
    res.json({
      success: true,
      prediction,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Risk prediction failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Smart contract auto-generation
router.post('/generate-contract', async (req, res) => {
  try {
    const { description } = req.body;
    
    const contract = await aiAgent.generateContract(description);
    
    res.json({
      success: true,
      contract,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Contract generation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Sentiment analysis
router.post('/analyze-sentiment', async (req, res) => {
  try {
    const { messages } = req.body;
    
    const sentiment = await aiAgent.analyzeSentiment(messages);
    
    res.json({
      success: true,
      sentiment,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Sentiment analysis failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Explainable AI decision
router.post('/explain-decision', async (req, res) => {
  try {
    const { verificationResult, evidence } = req.body;
    
    const explanation = await aiAgent.explainDecision(verificationResult, evidence);
    
    res.json({
      success: true,
      explanation,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Explanation generation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Multi-modal evidence analysis
router.post('/analyze-evidence', async (req, res) => {
  try {
    const files = req.files;
    const { context } = req.body;
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files provided'
      });
    }
    
    const analysis = await multiModal.analyzeAllEvidence(files, context);
    
    res.json({
      success: true,
      analysis,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Evidence analysis failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Analyze single image
router.post('/analyze-image', async (req, res) => {
  try {
    const file = req.file;
    const { context } = req.body;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No image provided'
      });
    }
    
    const analysis = await multiModal.analyzeImage(file.buffer, context);
    
    res.json({
      success: true,
      analysis,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Image analysis failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Verify work submission with AI
router.post('/verify', verifyWalletSignature, async (req, res) => {
  try {
    const { escrowId, evidenceHashes, requirements } = req.body;
    
    if (!escrowId || !evidenceHashes || !requirements) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: escrowId, evidenceHashes, requirements'
      });
    }
    
    // Get escrow from database
    const escrow = await global.prisma.escrow.findUnique({
      where: { escrowId },
      include: {
        buyer: true,
        seller: true
      }
    });
    
    if (!escrow) {
      return res.status(404).json({
        success: false,
        error: 'Escrow not found'
      });
    }
    
    // Notify verification started
    global.io.to(`escrow_${escrowId}`).emit('verification:progress', {
      status: 'started',
      message: 'AI verification in progress...'
    });
    
    // Retrieve evidence from IPFS
    const evidenceData = [];
    for (const hash of evidenceHashes) {
      try {
        const data = await ipfsService.getFile(hash);
        evidenceData.push({
          hash,
          data: data.data
        });
      } catch (error) {
        console.error(`Failed to retrieve evidence ${hash}:`, error);
      }
    }
    
    // Perform AI verification
    const verificationResult = await aiService.verifyDeliverable(
      requirements,
      evidenceData.map(e => e.data)
    );
    
    // Calculate confidence score (0-100)
    const confidence = verificationResult.confidence || 
      (verificationResult.passed ? 85 : 45);
    
    // Determine if passed (confidence > 70)
    const passed = confidence > 70;
    
    // Generate detailed analysis
    const analysisDetails = {
      qualityScore: Math.min(100, confidence + 5),
      completenessScore: Math.min(100, confidence),
      accuracyScore: Math.min(100, confidence + 3),
      suggestions: verificationResult.suggestions || []
    };
    
    // Store verification result
    const verificationData = {
      escrowId,
      passed,
      confidence,
      feedback: verificationResult.feedback || verificationResult.analysis || 'Work has been analyzed',
      timestamp: new Date().toISOString(),
      analysisDetails
    };
    
    const verificationUpload = await ipfsService.uploadJSON(verificationData);
    
    // Update escrow with verification result
    await global.prisma.escrow.update({
      where: { escrowId },
      data: {
        aiVerificationHash: verificationUpload.ipfsHash,
        verificationResult: passed,
        status: passed ? 'VERIFIED' : 'AI_REVIEWING'
      }
    });
    
    // Notify both parties
    global.io.to(`escrow_${escrowId}`).emit('verification:complete', {
      escrowId,
      passed,
      confidence,
      feedback: verificationData.feedback
    });
    
    // Send notifications to client and freelancer
    global.io.to(`user:${escrow.buyer.walletAddress}`).emit('notification', {
      type: 'ai_verified',
      title: 'AI Verification Complete',
      message: `Work for escrow ${escrow.title} has been ${passed ? 'approved' : 'rejected'} by AI`,
      escrowId
    });
    
    global.io.to(`user:${escrow.seller.walletAddress}`).emit('notification', {
      type: 'ai_verified',
      title: 'AI Verification Complete',
      message: `Your work for escrow ${escrow.title} has been ${passed ? 'approved' : 'rejected'} by AI`,
      escrowId
    });
    
    res.json({
      success: true,
      passed,
      confidence,
      feedback: verificationData.feedback,
      analysisDetails,
      verificationHash: verificationUpload.ipfsHash,
      timestamp: verificationData.timestamp
    });
  } catch (error) {
    console.error('AI verification failed:', error);
    
    // Notify error
    if (req.body.escrowId) {
      global.io.to(`escrow_${req.body.escrowId}`).emit('verification:error', {
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;