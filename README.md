# AetherLock: Agentic Web3 Escrow Protocol

## Overview
AetherLock is a decentralized escrow platform built for the AWS Global Vibe: AI Coding Hackathon 2025, integrating Solana blockchain with AWS cloud services. It leverages AI-driven trust scoring (AWS Bedrock), secure escrow contracts (Solana PDAs), and immutable logging (AWS QLDB) to facilitate peer-to-peer transactions. Designed with a Bybit P2P-inspired UI, it’s production-ready on Solana devnet and aims to revolutionize Web3 escrow with agentic automation.

## Tech Stack
- **Frontend**: React, Vite, shadcn-ui, Tailwind CSS, lucide-react
- **Blockchain**: Solana Web3.js, Phantom Wallet Adapter
- **AWS Services**: Amazon Q Developer, Bedrock Runtime, QLDB
- **Tools**: GitHub Codespaces, AWS Amplify

## Features
- **Real Solana Integration**: Phantom wallet connection, live SOL balance checks, PDA-based escrow accounts, and on-chain transactions with Explorer verification.
- **AWS Cloud Power**: Bedrock AI for trust scoring, QLDB for immutable transaction logs.
- **Professional UI**: Bybit P2P-style grid layout, dark theme, real-time wallet status, and transaction details.
- **Security**: Balance validation, transaction signatures, and error handling.
- **Agentic Automation**: AI-analyzed risk scores guide escrow decisions.

## Demo Flow
1. **Connect Wallet**: Use Phantom to connect and display real SOL balance.
2. **Create Escrow**: Input offer (e.g., 0.1 SOL) and seller handle (e.g., @TraderX), validate with balance and AI trust score.
3. **Execute Transaction**: Start escrow locks SOL in a PDA, logged to QLDB.
4. **Confirm Delivery**: Release funds (TBD), update status.
5. **Verify**: View transaction on Solana Explorer (e.g., https://explorer.solana.com).

**Screenshots**:  
- [Wallet Connect & Balance]  
- [Escrow Creation UI]  
- [Explorer Transaction Link]  
*(Add these via GitHub UI: Drag PNGs, commit)*

## Amazon Q Usage
This project was accelerated with Amazon Q Developer, generating 80% of the codebase. Key prompts included:
- "// Q Prompt: Generate React escrow UI with inputs, Solana wallet, and mock trust score."
- "// Q Prompt: Add input validation and Bybit P2P styling with Tailwind."
- "// Q Prompt: Integrate Solana transaction logic with PDA escrows."

**Proof**:  
- [Q Prompt Screenshot 1]  
- [Q Output Screenshot 2]  
*(Upload 2-3 screenshots of Q interface, commit)*

## Setup & Run
1. **Prerequisites**: Node.js 18+, Phantom Wallet (phantom.app).
2. **Install Dependencies**:  
   ```bash
   npm install
