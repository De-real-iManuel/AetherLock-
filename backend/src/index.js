const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const AIVerificationService = require('./services/aiVerification.js');

dotenv.config();

// Initialize Prisma client
const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;
const upload = multer({ storage: multer.memoryStorage() });

// Initialize AI service
const aiService = new AIVerificationService();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.get('/api/keys/public', (req, res) => {
  try {
    const publicKey = aiService.getPublicKey();
    res.json({ publicKey });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/verification/process', upload.array('evidence'), async (req, res) => {
  try {
    const { escrowId, taskDescription } = req.body;
    const evidenceFiles = req.files || [];

    if (!escrowId || !taskDescription) {
      return res.status(400).json({ error: 'Missing escrowId or taskDescription' });
    }

    const result = await aiService.processVerification(
      escrowId,
      taskDescription,
      evidenceFiles
    );

    res.json(result);
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/evidence/upload', upload.array('files'), async (req, res) => {
  try {
    const files = req.files || [];
    const result = await aiService.uploadEvidence(files);
    res.json(result);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      services: {
        ai: 'ready',
        ipfs: 'ready',
        database: 'connected'
      }
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      timestamp: new Date().toISOString(),
      services: {
        ai: 'ready',
        ipfs: 'ready',
        database: 'disconnected'
      },
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(PORT, () => {
  console.log(`🤖 AetherLock AI Agent running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 Public key: http://localhost:${PORT}/api/keys/public`);
});

module.exports = app;