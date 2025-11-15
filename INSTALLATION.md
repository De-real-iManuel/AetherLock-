# 🚀 AetherLock Installation Guide

## Quick Start

```bash
# Clone repository
git clone https://github.com/De-real-iManuel/AetherLock-.git
cd AetherLock-

# Install all dependencies
npm run install:all

# Setup environment variables
npm run setup:env

# Build smart contracts
cd solana-program && anchor build && cd ..
cd contracts && npx hardhat compile && cd ..

# Start development
npm run dev:all
```

## Detailed Setup

### 1. Install Dependencies

```bash
# Root dependencies
npm install

# Frontend dependencies
cd frontend
npm install
cd ..

# Backend dependencies
cd backend
npm install
cd ..

# Contracts dependencies
cd contracts
npm install
cd ..

# Solana program dependencies
cd solana-program
npm install
cd ..
```

### 2. Configure Environment Variables

#### Backend `.env`
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```
PORT=4001
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
ZETACHAIN_RPC_URL=https://zetachain-athens-evm.blockpi.network/v1/rpc/public
ZETACHAIN_PRIVATE_KEY=your_private_key_here
ZETACHAIN_GATEWAY_ADDRESS=deployed_gateway_address
CHAINLINK_FUNCTIONS_ROUTER=0xb83E47C2bC239B3bf370bc41e1459A34b41238D0
CHAINLINK_DON_ID=fun-ethereum-sepolia-1
GEMINI_API_KEY=your_gemini_key
CLAUDE_API_KEY=your_claude_key
OPENAI_API_KEY=your_openai_key
PINATA_API_KEY=your_pinata_key
PINATA_API_SECRET=your_pinata_secret
ZKME_API_KEY=your_zkme_key
ZKME_APP_ID=your_zkme_app_id
AI_AGENT_PUBKEY=your_agent_pubkey
FRONTEND_URL=http://localhost:5173
```

#### Frontend `.env`
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```
VITE_API_BASE_URL=http://localhost:4001
VITE_WEBSOCKET_URL=ws://localhost:4001
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_SOLANA_PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
VITE_ZETACHAIN_RPC_URL=https://zetachain-athens-evm.blockpi.network/v1/rpc/public
VITE_ZETACHAIN_GATEWAY_ADDRESS=deployed_gateway_address
VITE_ZKME_APP_ID=your_zkme_app_id
VITE_ZKME_API_KEY=your_zkme_key
VITE_IPFS_GATEWAY=https://ipfs.io/ipfs/
VITE_PROTOCOL_FEE_PERCENTAGE=10
VITE_TREASURY_WALLET=AetherLockTreasury11111111111111111111111111
```

### 3. Deploy Smart Contracts

#### Solana Program
```bash
cd solana-program

# Build program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Copy program ID to .env files
```

#### ZetaChain Contracts
```bash
cd contracts

# Compile contracts
npx hardhat compile

# Deploy to ZetaChain testnet
npx hardhat run scripts/deploy.js --network zetachain_testnet

# Copy deployed addresses to .env files
```

### 4. Start Development Servers

#### Option 1: All at once
```bash
npm run dev:all
```

#### Option 2: Separate terminals
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 5. Access Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:4001
- Health Check: http://localhost:4001/health

## API Keys Setup

### Gemini API
1. Visit https://ai.google.dev
2. Create API key
3. Add to `GEMINI_API_KEY`

### Claude API
1. Visit https://console.anthropic.com
2. Create API key
3. Add to `CLAUDE_API_KEY`

### OpenAI API
1. Visit https://platform.openai.com
2. Create API key
3. Add to `OPENAI_API_KEY`

### Pinata IPFS
1. Visit https://pinata.cloud
2. Create account and get API keys
3. Add to `PINATA_API_KEY` and `PINATA_API_SECRET`

### zkMe KYC
1. Visit https://zkme.com
2. Create application
3. Add to `ZKME_API_KEY` and `ZKME_APP_ID`

### Chainlink Functions
1. Visit https://functions.chain.link
2. Create subscription
3. Fund with LINK tokens
4. Add consumer contract

## Testing

```bash
# Run all tests
npm run test:all

# Test contracts
cd contracts
npx hardhat test

# Test Solana program
cd solana-program
anchor test

# Test backend
cd backend
npm test

# Test frontend
cd frontend
npm test
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 4001
lsof -ti:4001 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Solana CLI Not Found
```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Add to PATH
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

### Anchor Not Found
```bash
# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

### Node Version Issues
```bash
# Use Node 18+
nvm install 18
nvm use 18
```

## Production Build

```bash
# Build all components
npm run build:all

# Start production servers
npm run start:all
```

## Docker Setup (Optional)

```bash
# Build Docker images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

## Support

- Documentation: `/docs`
- Issues: https://github.com/De-real-iManuel/AetherLock-/issues
- Discord: [Join Community]
