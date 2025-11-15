# 🤖 AetherLock AI Agent Backend

Node.js service for AI-powered escrow verification using AWS Bedrock.

## 🚀 Quick Start

```bash
npm install
npm start
```

## 🎯 Features

- **AI Verification** - AWS Bedrock Claude integration
- **Cryptographic Signatures** - Ed25519 signature generation
- **IPFS Integration** - Evidence storage and retrieval
- **Solana Integration** - Smart contract interaction

## 🔧 Environment Variables

Create `.env` file:
```bash
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PROGRAM_ID=your_program_id
AI_AGENT_PRIVATE_KEY=your_ed25519_private_key
WEB3_STORAGE_TOKEN=your_token
PORT=3001
```

## 📦 Tech Stack

- Node.js + Express
- AWS Bedrock SDK
- Solana Web3.js
- Ed25519 cryptography
- Web3.Storage for IPFS