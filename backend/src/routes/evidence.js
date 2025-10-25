import express from 'express';
import multer from 'multer';
import { Web3Storage } from 'web3.storage';
import { generateEvidenceHash } from '../utils/crypto.js';
import crypto from 'crypto';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per request
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types for evidence
    const allowedTypes = [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/json',
      'video/mp4',
      'video/webm'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`), false);
    }
  }
});

// Initialize Web3.Storage client
let web3StorageClient = null;

function getWeb3StorageClient() {
  if (!web3StorageClient && process.env.WEB3_STORAGE_TOKEN) {
    web3StorageClient = new Web3Storage({ 
      token: process.env.WEB3_STORAGE_TOKEN 
    });
  }
  return web3StorageClient;
}

/**
 * Create a File object from buffer data
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - Original filename
 * @param {string} mimetype - File MIME type
 * @returns {File} Web3.Storage compatible File object
 */
function createFileFromBuffer(buffer, filename, mimetype) {
  return new File([buffer], filename, { type: mimetype });
}

/**
 * POST /api/evidence/upload
 * Upload evidence files to IPFS and return content hashes
 */
router.post('/upload', upload.array('evidence', 10), async (req, res) => {
  try {
    const { escrow_id, description } = req.body;
    const files = req.files;

    if (!escrow_id) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required field: escrow_id',
          code: 'MISSING_ESCROW_ID'
        }
      });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No files provided for upload',
          code: 'NO_FILES_PROVIDED'
        }
      });
    }

    console.log(`📁 Uploading ${files.length} evidence files for escrow: ${escrow_id}`);

    const client = getWeb3StorageClient();
    if (!client && process.env.MOCK_IPFS_UPLOADS !== 'true') {
      return res.status(500).json({
        success: false,
        error: {
          message: 'IPFS storage not configured - missing WEB3_STORAGE_TOKEN',
          code: 'STORAGE_NOT_CONFIGURED'
        }
      });
    }

    // Process each file
    const evidenceItems = [];
    const web3Files = [];

    for (const file of files) {
      // Generate content hash
      const contentHash = generateEvidenceHash(file.buffer);
      
      // Create metadata
      const metadata = {
        escrow_id,
        original_filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        content_hash: contentHash,
        upload_timestamp: new Date().toISOString(),
        description: description || 'Evidence file'
      };

      // Create Web3.Storage compatible file
      const web3File = createFileFromBuffer(
        file.buffer, 
        `${escrow_id}_${contentHash.substring(0, 8)}_${file.originalname}`,
        file.mimetype
      );

      web3Files.push(web3File);

      evidenceItems.push({
        filename: file.originalname,
        size: file.size,
        type: file.mimetype,
        hash: contentHash,
        metadata
      });
    }

    // Upload to IPFS via Web3.Storage (or mock for demo)
    let cid;
    if (process.env.MOCK_IPFS_UPLOADS === 'true') {
      cid = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log(`📤 Demo mode: Mocking IPFS upload with CID: ${cid}`);
    } else {
      console.log('📤 Uploading files to IPFS...');
      cid = await client.put(web3Files, {
        name: `aetherlock-evidence-${escrow_id}`,
        maxRetries: 3
      });
      console.log(`✅ Files uploaded to IPFS with CID: ${cid}`);
    }

    // Generate combined evidence hash for all files
    const combinedData = evidenceItems.map(item => item.hash).sort().join('');
    const combinedHash = generateEvidenceHash(combinedData);

    // Prepare response
    const response = {
      success: true,
      data: {
        escrow_id,
        ipfs_cid: cid,
        evidence_hash: combinedHash,
        files: evidenceItems.map((item, index) => ({
          ...item,
          ipfs_url: `https://${cid}.ipfs.w3s.link/${web3Files[index].name}`,
          gateway_url: `https://ipfs.io/ipfs/${cid}/${web3Files[index].name}`
        })),
        upload_summary: {
          total_files: files.length,
          total_size: files.reduce((sum, file) => sum + file.size, 0),
          upload_timestamp: new Date().toISOString(),
          ipfs_gateway: `https://${cid}.ipfs.w3s.link/`
        }
      }
    };

    res.json(response);

  } catch (error) {
    console.error('❌ Evidence upload error:', error);
    
    // Handle specific multer errors
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'File size exceeds 10MB limit',
            code: 'FILE_TOO_LARGE'
          }
        });
      }
      if (error.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Too many files - maximum 10 files allowed',
            code: 'TOO_MANY_FILES'
          }
        });
      }
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Evidence upload failed',
        code: 'UPLOAD_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
});

/**
 * GET /api/evidence/:cid
 * Retrieve evidence metadata by IPFS CID
 */
router.get('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;

    if (!cid) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing IPFS CID parameter',
          code: 'MISSING_CID'
        }
      });
    }

    // Validate CID format (basic check)
    if (!/^[a-zA-Z0-9]+$/.test(cid) || cid.length < 10) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid IPFS CID format',
          code: 'INVALID_CID'
        }
      });
    }

    const client = getWeb3StorageClient();
    if (!client) {
      return res.status(500).json({
        success: false,
        error: {
          message: 'IPFS storage not configured',
          code: 'STORAGE_NOT_CONFIGURED'
        }
      });
    }

    // Get file information from Web3.Storage
    const status = await client.status(cid);
    
    if (!status) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Evidence not found on IPFS',
          code: 'EVIDENCE_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: {
        cid,
        status: status.pin?.status || 'unknown',
        created: status.created,
        size: status.dagSize,
        ipfs_url: `https://${cid}.ipfs.w3s.link/`,
        gateway_url: `https://ipfs.io/ipfs/${cid}/`,
        pins: status.pins || []
      }
    });

  } catch (error) {
    console.error('❌ Evidence retrieval error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve evidence',
        code: 'RETRIEVAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
});

/**
 * POST /api/evidence/validate
 * Validate evidence hash against stored IPFS content
 */
router.post('/validate', async (req, res) => {
  try {
    const { evidence_hash, ipfs_cid, expected_files = [] } = req.body;

    if (!evidence_hash || !ipfs_cid) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required fields: evidence_hash and ipfs_cid',
          code: 'MISSING_REQUIRED_FIELDS'
        }
      });
    }

    // This would typically fetch and validate the actual IPFS content
    // For now, return a basic validation response
    const isValid = evidence_hash.length === 64 && /^[a-f0-9]+$/.test(evidence_hash);

    res.json({
      success: true,
      data: {
        evidence_hash,
        ipfs_cid,
        is_valid: isValid,
        validation_timestamp: new Date().toISOString(),
        note: 'Full content validation not yet implemented - performing basic hash format check'
      }
    });

  } catch (error) {
    console.error('❌ Evidence validation error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Evidence validation failed',
        code: 'VALIDATION_ERROR'
      }
    });
  }
});

/**
 * GET /api/evidence/hash/:data
 * Generate evidence hash for given data (utility endpoint)
 */
router.post('/hash', (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing data field',
          code: 'MISSING_DATA'
        }
      });
    }

    const hash = generateEvidenceHash(JSON.stringify(data));

    res.json({
      success: true,
      data: {
        input_data: data,
        evidence_hash: hash,
        algorithm: 'SHA-256',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Hash generation error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Hash generation failed',
        code: 'HASH_ERROR'
      }
    });
  }
});

export default router;