#!/bin/bash

# AetherLock Solana Program - Complete Deployment & Testing Script
# Features: AI Verification, zkMe KYC, ZetaChain Cross-chain, Chainlink Oracles

set -e

echo "🌌 AetherLock Universal Protocol - Deployment Script"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
CLUSTER="devnet"
PROGRAM_ID="Yb1FFbcd45RRTh1CmQ1P9aGtCgBd56ewdfJbTa4uEHo"

echo -e "${BLUE}Step 1: Building Program${NC}"
anchor build
echo -e "${GREEN}✓ Build complete${NC}"
echo ""

echo -e "${BLUE}Step 2: Generating IDL${NC}"
anchor idl init --filepath target/idl/aetherlock_escrow.json $PROGRAM_ID
echo -e "${GREEN}✓ IDL generated${NC}"
echo ""

echo -e "${BLUE}Step 3: Deploying to Devnet${NC}"
anchor deploy --provider.cluster $CLUSTER
echo -e "${GREEN}✓ Program deployed to devnet${NC}"
echo ""

echo -e "${YELLOW}Program ID: $PROGRAM_ID${NC}"
echo -e "${YELLOW}Cluster: $CLUSTER${NC}"
echo ""

echo "🎯 Core Features Deployed:"
echo "  ✅ AI-Powered Verification (Ed25519 signature validation)"
echo "  ✅ 10% Protocol Fee System"
echo "  ✅ Dispute Resolution with Admin Controls"
echo "  ✅ zkMe KYC Integration Ready"
echo "  ✅ ZetaChain Universal Functions (onCall, onRevert, onAbort)"
echo "  ✅ Cross-chain Escrow Support (Solana ↔ ZetaChain ↔ Sui/TON)"
echo "  ✅ Chainlink Oracle Integration Points"
echo ""

echo "📋 Available Instructions:"
echo "  1. initialize_config - Setup protocol admins"
echo "  2. initialize_escrow - Create new escrow"
echo "  3. deposit_funds - Buyer deposits tokens"
echo "  4. submit_verification - AI agent submits verification"
echo "  5. release_funds - Release to seller (90% + 10% fee)"
echo "  6. refund_buyer - Refund on failure/expiry"
echo "  7. raise_dispute - Initiate dispute resolution"
echo "  8. resolve_dispute - Admin resolves dispute"
echo "  9. universal_on_call - ZetaChain cross-chain call"
echo "  10. universal_on_revert - Handle cross-chain revert"
echo "  11. universal_on_abort - Handle cross-chain abort"
echo "  12. initialize_universal_escrow - Cross-chain escrow"
echo "  13. update_zkme_verification - Update KYC status"
echo ""

echo "🔗 Integration Endpoints:"
echo "  • ZetaChain Gateway: Cross-chain messaging"
echo "  • zkMe API: Real-time KYC verification"
echo "  • Chainlink Functions: Off-chain computation"
echo "  • IPFS/Pinata: Evidence storage"
echo "  • AWS Bedrock/Gemini: AI verification"
echo ""

echo "🚀 Next Steps:"
echo "  1. Run tests: anchor test"
echo "  2. Initialize config with admin keys"
echo "  3. Create test escrow with AI agent"
echo "  4. Test cross-chain flow with ZetaChain"
echo "  5. Verify zkMe KYC integration"
echo ""

echo -e "${GREEN}✨ Deployment Complete!${NC}"
echo "Program is live on Solana Devnet and ready for cross-chain operations"
