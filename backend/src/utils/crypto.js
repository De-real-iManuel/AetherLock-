import nacl from 'tweetnacl';
import bs58 from 'bs58';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Key storage path
const KEY_STORAGE_PATH = path.join(__dirname, '..', '..', 'keys');
const PRIVATE_KEY_FILE = path.join(KEY_STORAGE_PATH, 'agent_private_key.json');

/**
 * Generate a new Ed25519 key pair
 * @returns {Object} Key pair with publicKey and secretKey as Uint8Arrays
 */
export function generateKeyPair() {
  return nacl.sign.keyPair();
}

/**
 * Convert Uint8Array to base58 string
 * @param {Uint8Array} key - Key as Uint8Array
 * @returns {string} Base58 encoded key
 */
export function keyToBase58(key) {
  return bs58.encode(key);
}

/**
 * Convert base58 string to Uint8Array
 * @param {string} keyString - Base58 encoded key
 * @returns {Uint8Array} Key as Uint8Array
 */
export function keyFromBase58(keyString) {
  return bs58.decode(keyString);
}

/**
 * Save key pair to secure storage
 * @param {Object} keyPair - Key pair object
 */
export function saveKeyPair(keyPair) {
  // Ensure keys directory exists
  if (!fs.existsSync(KEY_STORAGE_PATH)) {
    fs.mkdirSync(KEY_STORAGE_PATH, { recursive: true });
  }

  const keyData = {
    publicKey: keyToBase58(keyPair.publicKey),
    secretKey: keyToBase58(keyPair.secretKey),
    created: new Date().toISOString(),
    version: '1.0.0'
  };

  // Write with restricted permissions (owner read/write only)
  fs.writeFileSync(PRIVATE_KEY_FILE, JSON.stringify(keyData, null, 2), { mode: 0o600 });
  console.log('🔐 Key pair saved securely to:', PRIVATE_KEY_FILE);
}

/**
 * Load key pair from storage or environment
 * @returns {Object|null} Key pair object or null if not found
 */
export function loadKeyPair() {
  // First try to load from environment variable
  const envPrivateKey = process.env.AI_AGENT_PRIVATE_KEY;
  if (envPrivateKey) {
    try {
      const secretKey = keyFromBase58(envPrivateKey);
      const keyPair = nacl.sign.keyPair.fromSecretKey(secretKey);
      return keyPair;
    } catch (error) {
      console.error('❌ Invalid private key in environment variable:', error.message);
    }
  }

  // Try to load from file
  if (fs.existsSync(PRIVATE_KEY_FILE)) {
    try {
      const keyData = JSON.parse(fs.readFileSync(PRIVATE_KEY_FILE, 'utf8'));
      const secretKey = keyFromBase58(keyData.secretKey);
      const keyPair = nacl.sign.keyPair.fromSecretKey(secretKey);
      return keyPair;
    } catch (error) {
      console.error('❌ Error loading key pair from file:', error.message);
    }
  }

  return null;
}

/**
 * Get or generate AI agent key pair
 * @returns {Object} Key pair object
 */
export function getOrGenerateKeyPair() {
  let keyPair = loadKeyPair();
  
  if (!keyPair) {
    console.log('🔑 Generating new Ed25519 key pair...');
    keyPair = generateKeyPair();
    saveKeyPair(keyPair);
    console.log('✅ New key pair generated and saved');
  } else {
    console.log('🔑 Loaded existing key pair');
  }

  return keyPair;
}

/**
 * Sign a message with the AI agent's private key
 * @param {Object} payload - Payload to sign
 * @param {Uint8Array} secretKey - Private key for signing
 * @returns {Object} Signature and payload data
 */
export function signVerificationPayload(payload, secretKey) {
  // Create deterministic message for signing
  const message = JSON.stringify({
    escrow_id: payload.escrow_id,
    result: payload.result,
    evidence_hash: payload.evidence_hash,
    timestamp: payload.timestamp,
    agent_version: payload.agent_version || '1.0.0'
  });

  const messageBytes = new TextEncoder().encode(message);
  const signature = nacl.sign.detached(messageBytes, secretKey);

  return {
    payload,
    signature: keyToBase58(signature),
    message,
    messageHash: crypto.createHash('sha256').update(message).digest('hex')
  };
}

/**
 * Verify a signature against a message and public key
 * @param {string} signature - Base58 encoded signature
 * @param {string} message - Original message that was signed
 * @param {Uint8Array} publicKey - Public key to verify against
 * @returns {boolean} True if signature is valid
 */
export function verifySignature(signature, message, publicKey) {
  try {
    const signatureBytes = keyFromBase58(signature);
    const messageBytes = new TextEncoder().encode(message);
    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKey);
  } catch (error) {
    console.error('❌ Signature verification error:', error.message);
    return false;
  }
}

/**
 * Generate a secure random hash for evidence
 * @param {Buffer|string} data - Data to hash
 * @returns {string} Hex encoded hash
 */
export function generateEvidenceHash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Create verification payload structure
 * @param {string} escrowId - Escrow identifier
 * @param {boolean} result - Verification result
 * @param {string} evidenceHash - Hash of evidence data
 * @param {number} confidenceScore - AI confidence score (0-1)
 * @returns {Object} Structured verification payload
 */
export function createVerificationPayload(escrowId, result, evidenceHash, confidenceScore = 1.0) {
  return {
    escrow_id: escrowId,
    result: Boolean(result),
    evidence_hash: evidenceHash,
    confidence_score: Math.min(Math.max(confidenceScore, 0), 1), // Clamp between 0-1
    timestamp: Math.floor(Date.now() / 1000), // Unix timestamp
    agent_version: '1.0.0',
    agent_id: 'aetherlock-ai-agent'
  };
}