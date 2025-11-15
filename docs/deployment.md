# AetherLock Deployment Guide

## Prerequisites

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
cd ../contracts && npm install
cd ../solana-program && npm install
```

## 1. ZetaChain Gateway Deployment

### Setup Environment
```bash
export ZETACHAIN_PRIVATE_KEY=your_private_key
export ZETACHAIN_RPC_URL=https://zetachain-athens-evm.blockpi.network/v1/rpc/public
export TREASURY_WALLET=your_treasury_address
```

### Deploy Contracts
```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network zetachain_testnet
```

### Expected Output
```
ZetaEscrowGateway: 0x...
ChainlinkVerifier: 0x...
```

Update `.env` files with deployed addresses.

## 2. Chainlink Functions Setup

### Get DON ID and Router
- Visit: https://docs.chain.link/chainlink-functions
- Testnet Router: `0xb83E47C2bC239B3bf370bc41e1459A34b41238D0`
- DON ID: `fun-ethereum-sepolia-1`

### Create Subscription
```bash
# Visit Chainlink Functions UI
# Create subscription and fund with LINK
# Add ChainlinkVerifier contract as consumer
```

## 3. Solana Program Deployment

```bash
cd solana-program
anchor build
anchor deploy --provider.cluster devnet
```

### Update Program ID
Copy program ID to:
- `solana-program/Anchor.toml`
- `backend/.env` → `SOLANA_PROGRAM_ID`
- `frontend/.env` → `VITE_SOLANA_PROGRAM_ID`

## 4. Backend Setup

```bash
cd backend
cp .env.example .env
# Configure all API keys
npm run dev
```

### Required Keys
- `GEMINI_API_KEY` - Get from https://ai.google.dev
- `CLAUDE_API_KEY` - Get from https://console.anthropic.com
- `OPENAI_API_KEY` - Get from https://platform.openai.com
- `PINATA_API_KEY` - Get from https://pinata.cloud
- `ZKME_API_KEY` - Get from https://zkme.com

## 5. Frontend Deployment

```bash
cd frontend
npm run build
npm run preview
```

### Deploy to Vercel
```bash
vercel --prod
```

## Testing Full Flow

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Run tests
cd tests && npm test
```

## Environment Variables Summary

### Backend (.env)
```
PORT=4001
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PROGRAM_ID=<deployed_program_id>
ZETACHAIN_RPC_URL=https://zetachain-athens-evm.blockpi.network/v1/rpc/public
ZETACHAIN_PRIVATE_KEY=<your_key>
ZETACHAIN_GATEWAY_ADDRESS=<deployed_gateway>
CHAINLINK_FUNCTIONS_ROUTER=0xb83E47C2bC239B3bf370bc41e1459A34b41238D0
CHAINLINK_DON_ID=fun-ethereum-sepolia-1
GEMINI_API_KEY=<your_key>
CLAUDE_API_KEY=<your_key>
OPENAI_API_KEY=<your_key>
PINATA_API_KEY=<your_key>
PINATA_API_SECRET=<your_secret>
ZKME_API_KEY=<your_key>
ZKME_APP_ID=<your_app_id>
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:4001
VITE_WEBSOCKET_URL=ws://localhost:4001
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_SOLANA_PROGRAM_ID=<deployed_program_id>
VITE_ZETACHAIN_RPC_URL=https://zetachain-athens-evm.blockpi.network/v1/rpc/public
VITE_ZETACHAIN_GATEWAY_ADDRESS=<deployed_gateway>
VITE_ZKME_APP_ID=<your_app_id>
VITE_ZKME_API_KEY=<your_key>
VITE_IPFS_GATEWAY=https://ipfs.io/ipfs/
VITE_PROTOCOL_FEE_PERCENTAGE=10
VITE_TREASURY_WALLET=<treasury_address>
```

## Verification

1. Connect wallet (Phantom/MetaMask)
2. Complete zkMe KYC
3. Create escrow as Client
4. Submit deliverable as Freelancer
5. AI verification triggers
6. Funds release with 10% fee

## Troubleshooting

### ZetaChain Connection Issues
- Verify RPC URL is accessible
- Check private key has testnet ZETA
- Ensure gateway address is correct

### Chainlink Functions Errors
- Verify subscription is funded
- Check consumer is added
- Confirm DON ID matches network

### Solana Deployment Fails
- Run `solana-keygen new` if no wallet
- Airdrop devnet SOL: `solana airdrop 2`
- Check Anchor version: `anchor --version`

## Production Checklist

- [ ] All contracts audited
- [ ] Mainnet RPC endpoints configured
- [ ] API keys secured in vault
- [ ] Rate limiting enabled
- [ ] Monitoring setup
- [ ] Backup treasury keys
- [ ] Test full escrow flow
- [ ] Load testing completed
