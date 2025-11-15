import express from 'express';
import multer from 'multer';
import IPFSService from '../services/ipfsService.js';
import { verifyWalletSignature } from '../middleware/auth.js';

const router = express.Router();
const ipfsService = new IPFSService();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed',
      'text/plain'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  }
});

// Upload single file to IPFS
router.post('/upload', verifyWalletSignature, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided'
      });
    }
    
    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        error: 'File size exceeds 100MB limit'
      });
    }
    
    const result = await ipfsService.uploadFile(file);
    
    res.json({
      success: true,
      ipfsHash: result.ipfsHash,
      url: result.url,
      size: result.size,
      fileName: file.originalname,
      mimeType: file.mimetype,
      timestamp: result.timestamp
    });
  } catch (error) {
    console.error('IPFS upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Upload multiple files to IPFS
router.post('/upload-multiple', verifyWalletSignature, upload.array('files', 10), async (req, res) => {
  try {
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files provided'
      });
    }
    
    // Validate each file size
    for (const file of files) {
      if (file.size > 100 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          error: `File ${file.originalname} exceeds 100MB limit`
        });
      }
    }
    
    const result = await ipfsService.uploadMultipleFiles(files);
    
    res.json({
      success: true,
      files: result.files.map((f, i) => ({
        ipfsHash: f.ipfsHash,
        url: f.url,
        size: f.size,
        fileName: files[i].originalname,
        mimeType: files[i].mimetype,
        timestamp: f.timestamp
      })),
      count: result.count
    });
  } catch (error) {
    console.error('IPFS multiple upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get file from IPFS
router.get('/file/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    
    if (!hash) {
      return res.status(400).json({
        success: false,
        error: 'IPFS hash is required'
      });
    }
    
    const result = await ipfsService.getFile(hash);
    
    res.json({
      success: true,
      data: result.data,
      ipfsHash: hash
    });
  } catch (error) {
    console.error('IPFS retrieval error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Upload JSON data to IPFS
router.post('/upload-json', verifyWalletSignature, async (req, res) => {
  try {
    const data = req.body;
    
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No data provided'
      });
    }
    
    const result = await ipfsService.uploadJSON(data);
    
    res.json({
      success: true,
      ipfsHash: result.ipfsHash,
      url: result.url
    });
  } catch (error) {
    console.error('IPFS JSON upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Pin existing IPFS hash
router.post('/pin/:hash', verifyWalletSignature, async (req, res) => {
  try {
    const { hash } = req.params;
    
    if (!hash) {
      return res.status(400).json({
        success: false,
        error: 'IPFS hash is required'
      });
    }
    
    const result = await ipfsService.pinByHash(hash);
    
    res.json({
      success: true,
      ipfsHash: result.ipfsHash,
      message: 'Hash pinned successfully'
    });
  } catch (error) {
    console.error('IPFS pinning error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Unpin file from IPFS
router.delete('/unpin/:hash', verifyWalletSignature, async (req, res) => {
  try {
    const { hash } = req.params;
    
    if (!hash) {
      return res.status(400).json({
        success: false,
        error: 'IPFS hash is required'
      });
    }
    
    const result = await ipfsService.unpinFile(hash);
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('IPFS unpinning error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
