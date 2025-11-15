# 🌌 AetherLock Frontend - Next.js 14

Production-ready, animated frontend for AetherLock escrow protocol.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
frontend-next/
├── app/
│   ├── page.tsx              # Landing page
│   ├── auth/page.tsx         # Wallet + KYC + Role
│   ├── dashboard/page.tsx    # Main dashboard
│   ├── ai/page.tsx           # AI verification
│   ├── profile/page.tsx      # User profile
│   ├── transactions/page.tsx # Transaction history
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   └── ParticleBackground.tsx
├── public/images/
│   ├── logo.png
│   └── partners/
│       ├── zkme.png
│       ├── zetachain.png
│       └── aws.png
└── package.json
```

## 🎨 Features

### Landing Page
- Animated particle background
- Neon glow effects
- Partner credits (zkMe, ZetaChain, AWS)
- Live stats counter
- Smooth transitions

### Auth Flow
- Multi-wallet connection (Phantom, MetaMask, TON)
- zkMe KYC integration
- Role selection (Client/Freelancer)
- Animated progress

### Dashboard
- Role-based views
- Escrow cards with status
- Create escrow modal
- Real-time stats
- Animated counters

### AI Verification
- Dual chat interface
- Evidence upload
- Confidence scoring
- Neural pulse animation

### Profile
- Trust score meter
- Achievement badges
- Statistics grid
- zkMe verification badge

### Transactions
- Searchable table
- Status filters
- Chain filters
- Export to CSV

## 🎯 Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons

## 🔑 Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4001
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
NEXT_PUBLIC_ZETACHAIN_RPC=https://zetachain-athens-evm.blockpi.network/v1/rpc/public
NEXT_PUBLIC_ZKME_APP_ID=M202510180319727898435789743751
NEXT_PUBLIC_IPFS_GATEWAY=https://fuchsia-worrying-chickadee-416.mypinata.cloud
```

## 🎨 Design System

### Colors
- **Neon Blue**: `#00f0ff`
- **Neon Purple**: `#b000ff`
- **Neon Pink**: `#ff00ff`

### Animations
- Glow effects
- Particle background
- Smooth transitions
- Hover effects
- Loading states

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables on Vercel
Add all `NEXT_PUBLIC_*` variables in Vercel dashboard.

## 📦 Build

```bash
npm run build
```

Output in `.next/` directory.

## 🧪 Development

```bash
npm run dev
```

Hot reload enabled at `http://localhost:3000`

## 🎯 Pages

- `/` - Landing page
- `/auth` - Authentication flow
- `/dashboard` - Main dashboard
- `/ai` - AI verification
- `/profile` - User profile
- `/transactions` - Transaction history

## 🔗 API Integration

API calls to `http://localhost:4001`:
- `POST /api/escrow/create`
- `POST /api/escrow/verify`
- `POST /api/crosschain/create`
- `GET /api/crosschain/status/:id`

## 🎨 Partner Integration

Logos in `/public/images/partners/`:
- zkMe KYC
- ZetaChain
- AWS Activate

Displayed on landing page and footer.

## ✨ Features

- ✅ Responsive design
- ✅ Dark mode (neon theme)
- ✅ Animated transitions
- ✅ Real-time updates
- ✅ Role-based access
- ✅ Multi-chain support
- ✅ IPFS integration
- ✅ zkMe KYC ready

## 📞 Support

Built for AetherLock Protocol - Trustless AI Escrow
