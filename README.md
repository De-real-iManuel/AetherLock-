# 🌌 AetherLock Universal Protocol

> **AI-driven, trustless, and agentic escrow & verification protocol**  
> Combining **Blockchain**, **AI Agents**, **zkMe KYC**, **Chainlink Oracles**, and **ZetaChain Universal Connectivity** to power the next evolution of secure cross-chain P2P transactions.

## 🏆 ZetaChain Universal App Bounty

This project implements a **Universal App** that seamlessly connects **Solana**, **Sui**, and **TON** ecosystems through ZetaChain's omnichain infrastructure with meaningful business logic including:

- ✅ **onCall**: Cross-chain escrow initiation and verification completion
- ✅ **onRevert**: Automatic refund handling for failed transactions  
- ✅ **onAbort**: Transaction cleanup and error recovery
- ✅ **Real zkMe KYC**: Live identity verification (no mockups)
- ✅ **Chainlink Integration**: Price feeds and off-chain computation
- ✅ **AI Verification**: AWS Bedrock-powered task validation
- ✅ **Live MVP**: Deployed on testnet with full functionality

---

## 🚀 Quick Start

### Prerequisites
```bash
# Required API Keys & Configurations
ZKME_API_KEY=your_zkme_api_key
ZKME_APP_ID=your_zkme_app_id
ZETACHAIN_RPC_URL=https://zetachain-athens-evm.blockpi.network/v1/rpc/public
CHAINLINK_FUNCTIONS_ROUTER=
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
```

### 1. Smart Contracts (Solana)
```bash
cd solana-program
anchor build
anchor deploy --provider.cluster devnet
```

### 2. Backend Services
```bash
cd backend
npm install
npm start
```

### 3. Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```

---

## 🏗️ Universal Architecture

### Cross-Chain Flow
```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Solana    │◄──►│  ZetaChain   │◄──►│ Sui/TON     │
│   Program   │    │   Gateway    │    │ Contracts   │
└─────────────┘    └──────────────┘    └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│ onCall()    │    │ Cross-chain  │    │ onRevert()  │
│ onRevert()  │    │ Messaging    │    │ onAbort()   │
│ onAbort()   │    │              │    │             │
└─────────────┘    └──────────────┘    └─────────────┘
```

### Key Components

#### 1. Universal Smart Contract Functions
```rust
// Solana Program - universal.rs
pub fn on_call(ctx: Context<OnCall>, message: CrossChainMessage) -> Result<()>
pub fn on_revert(ctx: Context<OnRevert>, revert_context: RevertContext) -> Result<()>  
pub fn on_abort(ctx: Context<OnAbort>, abort_context: AbortContext) -> Result<()>
```

#### 2. zkMe KYC Integration
```typescript
// Real-time verification with zkMe API
const zkmeService = new ZkmeService();
await zkmeService.initializeVerification(userAddress, chain);
```

#### 3. Chainlink Oracle Integration
```javascript
// Price feeds and off-chain computation
const chainlinkService = new ChainlinkService();
const priceData = await chainlinkService.getPrice('SOL/USD', provider);
```

#### 4. ZetaChain Cross-Chain Messaging
```javascript
// Universal connectivity
const zetaService = new ZetaChainService();
await zetaService.initiateCrossChainEscrow(escrowData);
```

---

## 🎯 Core Features

### 🔐 **zkMe KYC Verification**
- **Real-time identity verification** (no mockups)
- **Multi-chain support** (Solana, ZetaChain, Sui, TON)
- **Zero-knowledge proofs** for privacy
- **Webhook integration** for instant updates

### 🤖 **AI-Powered Verification**
- **AWS Bedrock integration** for intelligent task analysis
- **Risk assessment** with confidence scoring
- **Evidence processing** with IPFS storage
- **Automated dispute resolution**

### ⛓️ **Universal Cross-Chain**
- **ZetaChain gateway** for omnichain connectivity
- **Seamless asset transfers** between chains
- **Unified user experience** across ecosystems
- **Automatic failover** with onRevert/onAbort

### 📊 **Chainlink Oracles**
- **Real-time price feeds** for accurate valuations
- **Off-chain computation** for complex verification
- **Decentralized data** for trust and reliability
- **Automated triggers** for escrow releases

---

## 🎨 Frontend Architecture

### Role-Based Dashboard
```
├── Landing Page (Hero + Features)
├── Auth Flow (Wallet + KYC + Role Selection)
├── Client Dashboard (Create Escrows + Manage)
├── Freelancer Dashboard (Browse + Submit Work)
├── AI Verification Tab (Dual Chat + Evidence Upload)
├── Profile Page (Trust Score + Achievements)
├── Transactions (Cross-chain History)
└── Dispute Center (AI-Assisted Resolution)
```

### Component Structure
```typescript
// Multi-chain wallet connector
<WalletConnector supportedWallets={['phantom', 'metamask', 'sui', 'ton']} />

// Real zkMe KYC widget
<KYCVerification userAddress={address} chain={chain} />

// AI verification interface
<AIVerificationInterface escrowId={id} onComplete={handleResult} />

// Universal dashboard
<UniversalDashboard userRole={role} chain={chain} />
```

---

## 🔧 API Endpoints

### zkMe Integration
```
POST /api/zkme/initialize     # Start KYC process
GET  /api/zkme/status/:id     # Check verification status  
POST /api/zkme/webhook        # Handle verification callbacks
```

### Cross-Chain Escrow
```
POST /api/escrow/create       # Create universal escrow
POST /api/escrow/:id/verify   # Submit for AI verification
POST /api/escrow/:id/release  # Release funds cross-chain
GET  /api/escrow/:id/status   # Get transaction status
```

### Chainlink Integration
```
GET  /api/chainlink/price/:pair    # Get price feed data
POST /api/chainlink/functions      # Submit off-chain request
GET  /api/chainlink/status/:id     # Check request status
```

---

## 🌐 Live Deployment

### Testnet Addresses
```
Solana Program: Yb1FFbcd45RRTh1CmQ1P9aGtCgBd56ewdfJbTa4uEHo
ZetaChain Gateway: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
Frontend URL: https://aetherlock.vercel.app
Backend API: https://api.aetherlock.app
```

### Demo Flow
1. **Connect Wallet** → Multi-chain support (Phantom, MetaMask, etc.)
2. **Complete KYC** → Real zkMe verification with live API
3. **Select Role** → Client or Freelancer dashboard
4. **Create Escrow** → Cross-chain with Chainlink price feeds
5. **AI Verification** → Upload evidence, get AI analysis
6. **Cross-Chain Release** → Automatic via ZetaChain gateway

---

## 🏅 Bounty Compliance

### ✅ Universal App Requirements
- [x] **Connects multiple ecosystems** (Solana + Sui + TON)
- [x] **ZetaChain omnichain infrastructure** integration
- [x] **Meaningful business logic** (escrow + verification)
- [x] **onCall implementation** for cross-chain initiation
- [x] **onRevert implementation** for failed transaction handling
- [x] **onAbort implementation** for transaction cleanup
- [x] **True universal connectivity** across chains

### ✅ Additional Integrations
- [x] **Real zkMe KYC** (no mockups, live API integration)
- [x] **Chainlink Oracles** (price feeds + functions)
- [x] **AI Verification** (AWS Bedrock integration)
- [x] **Live MVP** (deployed on testnet)
- [x] **Production-ready** architecture

---

## 📋 Environment Setup

### Required API Keys
```bash
# zkMe KYC (get from zkMe dashboard)
ZKME_API_KEY=your_zkme_api_key
ZKME_APP_ID=your_zkme_app_id

# AWS Bedrock (for AI verification)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# ZetaChain (testnet configuration)
ZETACHAIN_RPC_URL=https://zetachain-athens-evm.blockpi.network/v1/rpc/public
ZETACHAIN_PRIVATE_KEY=your_zetachain_private_key

# Chainlink (mainnet/testnet addresses)
CHAINLINK_FUNCTIONS_ROUTER=
```

### Development Commands
```bash
# Install all dependencies
npm run install:all

# Start development environment
npm run dev:all

# Deploy smart contracts
npm run deploy:contracts

# Run tests
npm run test:all

# Build for production
npm run build:all
```

---

## 🎯 Demo Script

### Judge Evaluation Checklist
1. **Universal Connectivity** ✅
   - Multi-chain wallet connection
   - Cross-chain escrow creation
   - ZetaChain gateway integration

2. **onCall/onRevert/onAbort** ✅
   - Demonstrate cross-chain message handling
   - Show revert scenario with automatic refund
   - Trigger abort with cleanup process

3. **Real zkMe Integration** ✅
   - Live KYC verification process
   - Multi-chain identity support
   - Webhook-based status updates

4. **Chainlink Oracles** ✅
   - Real-time price feed integration
   - Off-chain computation for verification
   - Automated escrow triggers

5. **AI Verification** ✅
   - Evidence upload and analysis
   - AWS Bedrock integration
   - Confidence scoring and feedback

---

## 🚀 Next Steps

### Phase 1: Core Universal App ✅
- [x] Cross-chain smart contracts
- [x] ZetaChain integration
- [x] onCall/onRevert/onAbort functions

### Phase 2: Enhanced Features ✅
- [x] zkMe KYC integration
- [x] Chainlink oracle integration
- [x] AI verification system

### Phase 3: Production Deployment 🔄
- [ ] Mainnet deployment
- [ ] Security audits
- [ ] Performance optimization
- [ ] User onboarding

---

## 📞 Support & Documentation

- **Demo Video**: [YouTube Link]
- **Live App**: https://aetherlock-universal.vercel.app
- **Documentation**: https://aetherlockprotocol.mintlify.app/
- **GitHub**: https://github.com/aetherlock/universal-protocol

- **Scaling my Startup**
