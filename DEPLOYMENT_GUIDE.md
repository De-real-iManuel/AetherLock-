# AetherLock Deployment Guide

## 🚀 Repository
**GitHub**: https://github.com/De-real-iManuel/AetherLock-

## 📦 Project Structure

```
AetherLock-/
├── backend/              # Express + Socket.io API server
├── contracts/            # ZetaChain smart contracts (Solidity)
├── frontend/             # React + Vite + TypeScript UI
├── solana-program/       # Solana escrow program (Rust/Anchor)
└── docs/                 # Documentation
```

## 🔧 Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure environment variables
npm start
```

**Backend runs on**: http://localhost:4001

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Configure environment variables
npm run dev
```

**Frontend runs on**: http://localhost:3000

### 3. Smart Contracts

#### ZetaChain Contracts
```bash
cd contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network zetachain-testnet
```

#### Solana Program
```bash
cd solana-program
anchor build
anchor deploy --provider.cluster devnet
```

## 🔑 Environment Variables

### Backend (.env)
```env
# Pinata IPFS
PINATA_API_KEY=5e3eab331e704fb728d7
PINATA_API_SECRET=your_secret
PINATA_GATEWAY=fuchsia-worrying-chickadee-416.mypinata.cloud

# zkMe KYC
ZKME_API_KEY=your_zkme_api_key
ZKME_APP_ID=M202510180319727898435789743751

# AI Services
GEMINI_API_KEY=your_gemini_key
ANTHROPIC_API_KEY=your_claude_key
OPENAI_API_KEY=your_openai_key

# Blockchain
SOLANA_RPC_URL=https://api.devnet.solana.com
ZETACHAIN_RPC_URL=https://zetachain-athens-evm.blockpi.network/v1/rpc/public
SOLANA_PROGRAM_ID=AetherLockEscrow11111111111111111111111111

# Server
PORT=4001
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:4001
VITE_ZKME_APP_ID=M202510180319727898435789743751
VITE_ZKME_API_KEY=your_zkme_api_key
VITE_SOLANA_PROGRAM_ID=AetherLockEscrow11111111111111111111111111
VITE_ZETACHAIN_GATEWAY=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
VITE_IPFS_GATEWAY=https://fuchsia-worrying-chickadee-416.mypinata.cloud
```

## 🎯 Key Features Implemented

### ✅ Cross-Chain Escrow
- ZetaChain gateway for universal connectivity
- Solana program for on-chain escrow logic
- 10% protocol fee mechanism

### ✅ AI Verification
- Multi-provider fallback: Gemini → Claude → OpenAI
- Evidence analysis and confidence scoring
- Automated dispute resolution

### ✅ zkMe KYC Integration
- Real-time identity verification
- Multi-chain support (Solana, ZetaChain, Sui, TON)
- Zero-knowledge proofs for privacy

### ✅ Chainlink Oracles
- Price feeds for accurate valuations
- Off-chain computation for verification
- Automated escrow triggers

### ✅ Mobile Responsive UI
- Neon cyberpunk design
- Framer Motion animations
- Responsive breakpoints (mobile → tablet → desktop)

## 📱 Pages & Routes

- `/` - Landing page with hero and features
- `/auth` - Wallet connection + KYC + role selection
- `/dashboard` - Main dashboard (client/freelancer)
- `/ai` - AI verification interface
- `/marketplace` - Job marketplace
- `/disputes` - Dispute resolution center
- `/transactions` - Transaction history
- `/profile` - User profile and trust score

## 🛠️ Tech Stack

### Frontend
- React 19.1.1
- Vite 7.1.7
- TypeScript
- Tailwind CSS 4.1.14
- Framer Motion
- React Router DOM
- Zustand (state management)

### Backend
- Node.js + Express
- Socket.io (WebSocket)
- Prisma (database ORM)
- AWS SDK (Bedrock AI)
- Solana Web3.js

### Smart Contracts
- Solidity (ZetaChain)
- Rust + Anchor (Solana)
- Hardhat (deployment)

## 🔐 Security Features

- Multi-signature wallet support
- Automated fund release mechanisms
- AI-powered fraud detection
- zkMe identity verification
- Chainlink oracle data validation

## 📊 Protocol Economics

- **Protocol Fee**: 10% on all escrow transactions
- **Treasury Wallet**: Collects protocol fees
- **Automated Release**: Based on AI verification + Chainlink data
- **Dispute Resolution**: AI-assisted with human override

## 🚢 Deployment Checklist

- [x] Backend API server configured
- [x] Frontend UI built and responsive
- [x] ZetaChain contracts compiled
- [x] Solana program source ready
- [x] Environment variables documented
- [x] IPFS integration (Pinata)
- [x] zkMe KYC widget integrated
- [x] AI services configured
- [x] WebSocket real-time updates
- [x] Mobile responsive design
- [x] Git repository cleaned up
- [x] Code pushed to GitHub

## 🎬 Next Steps

1. **Deploy Backend**: Railway, Render, or AWS
2. **Deploy Frontend**: Vercel, Netlify, or Cloudflare Pages
3. **Deploy Contracts**: ZetaChain testnet → mainnet
4. **Build Solana Program**: Requires Anchor CLI
5. **Configure DNS**: Custom domain setup
6. **Enable Monitoring**: Error tracking and analytics
7. **Security Audit**: Smart contract audit
8. **User Testing**: Beta testing phase

## 📞 Support

- **GitHub Issues**: https://github.com/De-real-iManuel/AetherLock-/issues
- **Documentation**: See `/docs` folder
- **README**: See main README.md for detailed information

---

**Built for ZetaChain Universal App Bounty** 🏆
