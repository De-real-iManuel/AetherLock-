# ⚙️ AetherLock Frontend Architecture & Implementation Guide

---

## 🎯 1. Core Feature Summary

### 🪩 Landing Page
- **Hero Section**: Dynamic gradient background with interactive particle effects
- **Value Propositions**: Three-column layout highlighting:
  - 🤖 AI Verification
  - 🔐 zkKYC Security
  - 🔗 Cross-chain Settlement
- **Live Stats**: Real-time metrics for active escrows, verified transactions, and total value locked (TVL)
- **Call to Action**: Neon "Launch App" button with morphing hover animation
- **Trust Indicators**: Supported chains displayed (Solana, ZetaChain, TON)

---

### 🔑 Authentication / Onboarding
- **Multi-wallet Connection**: Animated wallet cards (Phantom, Solflare, MetaMask)
- **zkMe KYC Gate**: Progressive verification with real-time visual feedback
- **Role Selection**: Animated card flip between Client and Freelancer
- **Profile Setup**: Input fields for name, skills, needs, and preferences

---

### 💼 Dashboard (Dual Role System)

#### 👨‍💼 Client View
- Create new escrow (modal form)
- Track active/completed deals in grid view
- See quick stats (locked funds, active jobs, completion rate)
- Real-time activity timeline

#### 👩‍💻 Freelancer View
- Browse available tasks with filters
- Track ongoing projects with progress indicators
- Animated TrustScore badge with level-up animation
- Earnings dashboard with withdraw options

---

### 🧠 AI Tab – The Core Agentic Interface

#### Left Panel – Dual Chat:
- **Toggle**: AI Mode ⇄ Direct Chat (animated slide)
- Chat bubbles show sender roles (AI / Client / Freelancer)
- Real-time typing indicators + command palette (/verify, /help, /status)

#### Right Panel – Verification Zone:
- Drag-and-drop evidence upload with preview
- Trial counter (5 glowing rings that deplete per failure)
- AI analysis animation (neural particle streams)
- Results card: Confidence %, pass/fail, and AI feedback
- Client review before validation submission

---

### 👤 Profile Page
- Copyable wallet address with explorer link
- Animated zkMe Verification Badge
- Circular TrustScore visualization with glow pulse
- Grid of stats: jobs done, success rate, disputes
- Earnable badges and withdrawal history

---

### 💳 Transactions Page
- Searchable and filterable transaction list
- Cards show hash, amount, parties, status, and time
- Status tags: 🟡 Pending, 🟢 Verified, 🔵 Released, 🔴 Disputed
- Export to CSV + explorer links

---

### ⚖️ Dispute Center
- One-click "Raise Dispute" modal
- Upload evidence, select reason, add details
- Timeline visualization of ongoing disputes
- AI-assisted mediation chat and resolution log

---

### 🔔 Notifications
- Bell icon with badge counter
- Categorized dropdown: Escrow / Verification / Dispute / System
- Real-time updates via WebSocket
- Mark-as-read, delete, or snooze
- Push/email preferences

---

### 🛍️ Marketplace (Stretch Goal)
- Browse or filter tasks by category, budget, or TrustScore
- Freelancer cards with ratings and "Quick Apply" buttons
- Grid and list views with cyberpunk glow accents

---

## 📁 2. Folder & Module Structure

```
aetherlock/
├── app/
│   ├── layout.tsx               # Root layout with global providers
│   ├── page.tsx                 # Landing page
│   ├── auth/                    # Wallet + onboarding
│   ├── dashboard/               # Client/Freelancer dashboard
│   ├── ai/                      # AI verification tab
│   ├── profile/                 # Profile page
│   ├── transactions/            # Transaction history
│   ├── disputes/                # Dispute center
│   ├── marketplace/             # Marketplace (optional)
│   └── api/                     # API routes (escrow, chat, verify)
│
├── components/                  # Modular React components
│   ├── layout/ (Navbar, Sidebar, Footer)
│   ├── auth/ (WalletConnector, KYCVerification, RoleSelector)
│   ├── escrow/ (Cards, Modal, Details)
│   ├── ai/ (ChatInterface, ModeToggle, Analyzer)
│   ├── profile/ (TrustScoreDisplay, StatsGrid)
│   ├── shared/ (Button, Card, Input, Badge)
│   └── animations/ (GlowEffect, ParticleBackground)
│
├── context/                     # React contexts for app state
│   ├── WalletContext.tsx
│   ├── UserContext.tsx
│   ├── ChatContext.tsx
│   ├── EscrowContext.tsx
│   └── NotificationContext.tsx
│
├── hooks/ (custom hooks for wallet, chat, AI, KYC)
├── lib/ (api, blockchain, zkme, utils, types)
├── styles/ (Tailwind + animation.css)
├── types/ (TS types for escrow, user, chat, etc.)
└── public/ (assets)
```

---

## 🎨 3. UI / Motion Design System

### Animations
- **Page Transition**: Smooth fade & vertical slide
- **Card Hover**: Neon border pulse + slight lift
- **Modals**: Scale + opacity transitions
- **Success / Failure**: Glow pulse vs shake
- **Neon Theme**: Cyan + magenta gradients, scanline overlay, glitch micro-animations
- **Particles**: Floating dots to simulate AI analysis

---

## 🔄 4. Context & State Hierarchy

### Global Provider Chain:
```tsx
<WalletProvider>
  <UserProvider>
    <ChatProvider>
      <EscrowProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </EscrowProvider>
    </ChatProvider>
  </UserProvider>
</WalletProvider>
```

Each provider manages scoped state for wallet, user, escrow, and notifications, ensuring predictable context flow.

---

## 🔌 5. API & Backend Integration

- `/api/auth/` → wallet connect + zkMe verification
- `/api/escrow/` → create, manage, verify escrows
- `/api/chat/` → real-time communication (via WebSocket)
- `/api/transactions/` → blockchain interaction + status
- `/api/disputes/` → mediation + resolution tracking
- `/api/notifications/` → live alerts and updates

Integration uses fetch + secure headers. Real-time features rely on Socket.IO.

---

## 🎨 6. Theme System (Cyberpunk Dark)

### Tailwind theme extensions:
- **Primary colors**: Cyan → Purple → Pink
- **Background layers**: #0A0A0F → #1C1C26
- **Glow shadows**: multi-layer cyan pulse
- **Font**: Inter + Space Grotesk for futuristic display
- **Custom animations**: glow, scanline, float-particle

### Typography classes:
```css
.heading-xl { @apply text-5xl font-display bg-gradient-to-r from-cyan-400 to-purple-500; }
.body-base { @apply text-base text-gray-400; }
.mono { @apply font-mono text-cyan-400; }
```

---

## ✅ 7. Testing Framework

- **Unit Tests**: Jest + React Testing Library for UI logic
- **E2E**: Playwright scripts for full escrow flow
- **Performance**: Lighthouse + WebSocket resilience checks
- **Animation QA**: 60fps target verified via Chrome Performance tools

---

## 🚀 8. Deployment

- **Host**: Vercel
- **CI/CD**: Git push triggers deploy
- **Env Vars**: (Solana RPC, ZetaChain RPC, zkMe IDs, AI keys, etc.)
- **Monitoring**: Sentry for production logs
- **Optimization**: SWC minify, lazy CSS loading, compressed images

---

## 🌟 9. Stretch Goals (Post-MVP)

- 🎮 Leaderboard System
- 💬 Voice/Video Calls via WebRTC
- 📊 Advanced Analytics Dashboard
- 🛠 Smart Escrow Templates
- 🧬 AI Reputation Meter
- 🧠 Trust Network Visualization (React Flow + D3.js)

---

## 🧭 10. Development Roadmap

| Phase | Duration | Focus |
|-------|----------|-------|
| 1. Foundation | Weeks 1–2 | Setup Next.js + Tailwind + Wallet Auth |
| 2. Core Features | Weeks 3–5 | Escrow, AI Verification, Chat |
| 3. Polish & Test | Week 6 | Animations, Responsiveness, QA |
| 4. Advanced | Weeks 7–8 | Disputes, Notifications, Transactions |
| 5. Expansion | Week 9+ | Marketplace, Analytics, Reputation System |

---

## 🧩 Summary

**AetherLock's Frontend Architecture** fuses AI-driven automation, multi-chain integration, and gamified UX under a cyberpunk aesthetic.

It's engineered for:
- ⚡ **Interactivity**
- 🧠 **Intelligence**
- 🔐 **Trust**
- 🪐 **Scalability**