import express from 'express';
import ZetaChainService from '../services/zetachainService.js';
import ChainlinkService from '../services/chainlinkService.js';
import SolanaService from '../services/solanaService.js';
import AIService from '../services/aiService.js';
import IPFSService from '../services/ipfsService.js';

const router = express.Router();
const zetaService = new ZetaChainService();
const chainlinkService = new ChainlinkService();
const solanaService = new SolanaService();
const aiService = new AIService();
const ipfsService = new IPFSService();

router.post('/escrow/create', async (req, res) => {
  try {
    const { buyer, seller, amount, requirements, expiry } = req.body;
    
    const metadata = { requirements, timestamp: Date.now() };
    const ipfsResult = await ipfsService.uploadJSON(metadata);
    const escrowId = Buffer.from(Date.now().toString() + buyer).toString('hex').slice(0, 64);
    
    const solanaResult = await solanaService.createEscrow({
      escrowId,
      buyer,
      seller,
      amount,
      expiry,
      metadataHash: ipfsResult.ipfsHash,
      aiAgentPubkey: process.env.AI_AGENT_PUBKEY
    });

    res.json({ success: true, escrowId, ipfsHash: ipfsResult.ipfsHash, ...solanaResult });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/escrow/verify', async (req, res) => {
  try {
    const { escrowId, evidence, requirements } = req.body;
    
    const evidenceData = { evidence, timestamp: Date.now() };
    const ipfsResult = await ipfsService.uploadJSON(evidenceData);
    const aiResult = await aiService.verifyDeliverable(requirements, evidence);
    
    res.json({ success: true, escrowId, evidenceCID: ipfsResult.ipfsHash, ...aiResult });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/escrow/release', async (req, res) => {
  try {
    const { escrowId, buyer } = req.body;
    
    const result = await solanaService.releaseFunds(escrowId, buyer);
    
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/crosschain/create', async (req, res) => {
  try {
    const { escrowId, amount, buyerAddress, sellerAddress, destinationChain } = req.body;
    
    const result = await zetaService.initiateCrossChainEscrow({
      escrowId,
      amount,
      buyerAddress,
      sellerAddress,
      destinationChain
    });
    
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/crosschain/release', async (req, res) => {
  try {
    const { escrowId, amount, recipientAddress, destinationChain } = req.body;
    
    const result = await zetaService.releaseFundsCrossChain(escrowId, amount, recipientAddress, destinationChain);
    
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/crosschain/status/:id', async (req, res) => {
  try {
    const status = await zetaService.getCrossChainStatus(req.params.id);
    res.json({ success: true, ...status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
