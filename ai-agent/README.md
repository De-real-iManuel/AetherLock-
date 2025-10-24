# AetherLock AI Agent Service

AI-powered verification service for the AetherLock Protocol. This service provides automated task completion verification using AWS Bedrock AI, Ed25519 cryptographic signatures, and IPFS evidence storage.

## Features

- 🤖 **AI-Powered Verification**: Uses AWS Bedrock (Claude 3 Sonnet) for intelligent task completion analysis
- 🔐 **Cryptographic Signatures**: Ed25519 signature generation and verification for blockchain integration
- 📁 **IPFS Evidence Storage**: Decentralized evidence storage using Web3.Storage
- 🛡️ **Security**: Secure key management with file-based and environment variable storage
- 🚀 **RESTful API**: Clean REST endpoints for integration with frontend and smart contracts

## Quick Start

### Prerequisites

- Node.js 18+ 
- AWS Account with Bedrock access
- Web3.Storage account and API token

### Installation

1. **Clone and setup**:
```bash
cd ai-agent
npm install
```

2. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start the service**:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The service will start on `http://localhost:3001`

## Configuration

### Environment Variables

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# AWS Configuration (for Bedrock AI)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Web3.Storage Configuration (for IPFS)
WEB3_STORAGE_TOKEN=your_web3_storage_token

# AI Agent Configuration
AI_AGENT_PRIVATE_KEY=your_ed25519_private_key_base58
VERIFICATION_CONFIDENCE_THRESHOLD=0.8

# Security
CORS_ORIGIN=http://localhost:5173
```

### Key Management

The service supports two methods for Ed25519 key management:

1. **Environment Variable**: Set `AI_AGENT_PRIVATE_KEY` with a base58-encoded private key
2. **File Storage**: Keys are automatically generated and stored in `keys/agent_private_key.json`

## API Endpoints

### Health Check
```http
GET /health
```

### Key Management
```http
GET /api/keys/public          # Get AI agent public key
GET /api/keys/info           # Get key information
POST /api/keys/regenerate    # Regenerate keys (dev only)
```

### Verification
```http
POST /api/verification/verify    # Main verification endpoint
POST /api/verification/mock      # Mock verification (dev only)
GET /api/verification/status/:escrow_id
```

### Evidence Storage
```http
POST /api/evidence/upload        # Upload evidence to IPFS
GET /api/evidence/:cid          # Get evidence by IPFS CID
POST /api/evidence/validate     # Validate evidence hash
POST /api/evidence/hash         # Generate evidence hash
```

## Usage Examples

### 1. Get AI Agent Public Key

```javascript
const response = await fetch('http://localhost:3001/api/keys/public');
const { data } = await response.json();
console.log('Public Key:', data.publicKey);
```

### 2. Upload Evidence

```javascript
const formData = new FormData();
formData.append('escrow_id', 'escrow_123');
formData.append('description', 'Task completion screenshots');
formData.append('evidence', file1);
formData.append('evidence', file2);

const response = await fetch('http://localhost:3001/api/evidence/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('IPFS CID:', result.data.ipfs_cid);
console.log('Evidence Hash:', result.data.evidence_hash);
```

### 3. Request Verification

```javascript
const verificationRequest = {
  escrow_id: 'escrow_123',
  task_description: 'Create a React component with login functionality',
  evidence: [
    {
      type: 'image/png',
      filename: 'screenshot.png',
      hash: 'abc123...',
      description: 'Screenshot of working login form'
    }
  ]
};

const response = await fetch('http://localhost:3001/api/verification/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(verificationRequest)
});

const result = await response.json();
console.log('Verification Result:', result.data.verification.result);
console.log('Signature:', result.data.signature);
```

## AI Verification Process

1. **Evidence Analysis**: AI analyzes uploaded evidence against task description
2. **Confidence Scoring**: AI provides confidence score (0.0 - 1.0)
3. **Threshold Check**: Result must meet confidence threshold (default: 0.8)
4. **Signature Generation**: Verification payload is signed with Ed25519 private key
5. **Blockchain Submission**: Signed verification can be submitted to smart contract

## Security Features

- **Ed25519 Signatures**: Cryptographically secure message signing
- **File Type Validation**: Only allowed file types for evidence upload
- **Size Limits**: 10MB per file, 10 files maximum per upload
- **CORS Protection**: Configurable CORS origins
- **Environment Separation**: Production restrictions on sensitive endpoints
- **Secure Key Storage**: Private keys stored with restricted file permissions

## Integration with AetherLock Protocol

The AI agent integrates with the AetherLock ecosystem:

1. **Smart Contract**: Public key registered in Solana escrow contract
2. **Frontend**: Evidence upload and verification request interface  
3. **IPFS**: Decentralized evidence storage and retrieval
4. **Blockchain**: Signed verification results submitted on-chain

## Development

### Running Tests
```bash
npm test
```

### Mock Verification (Development)
```bash
curl -X POST http://localhost:3001/api/verification/mock \
  -H "Content-Type: application/json" \
  -d '{"escrow_id": "test_123", "result": true, "confidence": 0.95}'
```

### Key Regeneration (Development)
```bash
curl -X POST http://localhost:3001/api/keys/regenerate
```

## Deployment

### AWS Lambda Deployment
The service is designed for serverless deployment on AWS Lambda:

1. Package the application
2. Configure AWS credentials and environment variables
3. Deploy using AWS CLI or Serverless Framework
4. Update CORS origins for production domain

### Docker Deployment
```bash
# Build Docker image
docker build -t aetherlock-ai-agent .

# Run container
docker run -p 3001:3001 --env-file .env aetherlock-ai-agent
```

## Troubleshooting

### Common Issues

1. **AWS Bedrock Access**: Ensure your AWS account has Bedrock model access enabled
2. **Web3.Storage Token**: Verify your Web3.Storage API token is valid
3. **Key Generation**: Check file permissions for key storage directory
4. **CORS Errors**: Update `CORS_ORIGIN` environment variable

### Logs

The service provides detailed logging for debugging:
- Key generation and loading
- AI verification requests and responses  
- IPFS upload status
- Signature generation and validation

## License

MIT License - see LICENSE file for details.