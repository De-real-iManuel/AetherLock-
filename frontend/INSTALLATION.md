# 🚀 AetherLock Frontend Installation

## Quick Install

```bash
cd frontend-next
npm install
npm run dev
```

Open http://localhost:3000

## Full Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your values.

### 3. Run Development
```bash
npm run dev
```

### 4. Build Production
```bash
npm run build
npm start
```

## Pages Created

- `/` - Landing (animated hero, stats, partners)
- `/auth` - Wallet + KYC + Role selection
- `/dashboard` - Escrow management
- `/ai` - AI verification interface
- `/profile` - User profile with trust score
- `/transactions` - Transaction history

## Features

✅ Particle background animation
✅ Neon glow effects
✅ Framer Motion transitions
✅ Role-based dashboards
✅ AI chat interface
✅ Trust score meter
✅ Searchable transactions
✅ Partner integration (zkMe, ZetaChain, AWS)

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide Icons

## Deployment

### Vercel
```bash
vercel --prod
```

### Environment Variables
Set in Vercel dashboard:
- NEXT_PUBLIC_API_URL
- NEXT_PUBLIC_SOLANA_RPC
- NEXT_PUBLIC_ZETACHAIN_RPC
- NEXT_PUBLIC_ZKME_APP_ID
- NEXT_PUBLIC_IPFS_GATEWAY

## Ready to Launch! 🎉
