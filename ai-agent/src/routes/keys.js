import express from 'express';
import { getOrGenerateKeyPair, keyToBase58 } from '../utils/crypto.js';

const router = express.Router();

// Global key pair - initialized once when server starts
let agentKeyPair = null;

/**
 * Initialize the agent key pair
 */
function initializeKeyPair() {
  if (!agentKeyPair) {
    agentKeyPair = getOrGenerateKeyPair();
    console.log('🔑 AI Agent Public Key:', keyToBase58(agentKeyPair.publicKey));
  }
  return agentKeyPair;
}

/**
 * GET /api/keys/public
 * Returns the AI agent's public key for smart contract registration
 */
router.get('/public', (req, res) => {
  try {
    const keyPair = initializeKeyPair();
    const publicKeyBase58 = keyToBase58(keyPair.publicKey);

    res.json({
      success: true,
      data: {
        publicKey: publicKeyBase58,
        keyType: 'Ed25519',
        usage: 'verification_signing',
        created: new Date().toISOString(),
        agent: {
          id: 'aetherlock-ai-agent',
          version: '1.0.0',
          description: 'AetherLock Protocol AI Verification Agent'
        }
      }
    });
  } catch (error) {
    console.error('❌ Error retrieving public key:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve public key',
        code: 'KEY_RETRIEVAL_ERROR'
      }
    });
  }
});

/**
 * GET /api/keys/info
 * Returns information about the key pair without exposing private data
 */
router.get('/info', (req, res) => {
  try {
    const keyPair = initializeKeyPair();
    const publicKeyBase58 = keyToBase58(keyPair.publicKey);

    res.json({
      success: true,
      data: {
        hasKeyPair: true,
        publicKey: publicKeyBase58,
        keyType: 'Ed25519',
        keyLength: keyPair.publicKey.length,
        algorithm: 'EdDSA',
        curve: 'Ed25519',
        capabilities: [
          'message_signing',
          'verification_payload_signing',
          'evidence_attestation'
        ],
        security: {
          keyGeneration: 'cryptographically_secure_random',
          storage: 'file_system_with_restricted_permissions',
          environmentSupport: true
        }
      }
    });
  } catch (error) {
    console.error('❌ Error retrieving key info:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve key information',
        code: 'KEY_INFO_ERROR'
      }
    });
  }
});

/**
 * POST /api/keys/regenerate
 * Regenerates the key pair (use with caution)
 */
router.post('/regenerate', (req, res) => {
  try {
    // Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Key regeneration not allowed in production',
          code: 'PRODUCTION_RESTRICTION'
        }
      });
    }

    // Generate new key pair
    agentKeyPair = getOrGenerateKeyPair();
    const publicKeyBase58 = keyToBase58(agentKeyPair.publicKey);

    console.log('🔄 Key pair regenerated');
    console.log('🔑 New Public Key:', publicKeyBase58);

    res.json({
      success: true,
      data: {
        message: 'Key pair regenerated successfully',
        publicKey: publicKeyBase58,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error regenerating keys:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to regenerate key pair',
        code: 'KEY_REGENERATION_ERROR'
      }
    });
  }
});

// Export the router and key pair getter
export default router;
export { initializeKeyPair };