# AetherLock Protocol - Complete Project Structure

## 📁 Root Directory Structure
```
aetherlock/
├── 📁 contracts/                    # Solana smart contracts
├── 📁 ai-agent/                     # Node.js AI verification service
├── 📁 frontend/                     # Next.js React application
├── 📁 docs/                         # Mintlify documentation
├── 📁 demo/                         # Demo materials and scripts
├── 📁 diagrams/                     # Architecture diagrams
├── 📁 tests/                        # Integration tests
├── 📄 roadmap.md                    # Development roadmap
├── 📄 deploy.sh                     # Deployment script
└── 📄 README.md                     # Project overview
```

## 🔗 Smart Contracts (`contracts/`)
```
contracts/
├── 📁 programs/
│   └── 📁 aetherlock-escrow/
│       ├── 📄 Cargo.toml
│       └── 📁 src/
│           ├── 📄 lib.rs            # Main program entry
│           ├── 📄 instructions/     # Instruction handlers
│           │   ├── 📄 mod.rs
│           │   ├── 📄 initialize_escrow.rs
│           │   ├── 📄 deposit_funds.rs
│           │   ├── 📄 submit_verification.rs
│           │   ├── 📄 release_funds.rs
│           │   ├── 📄 refund_buyer.rs
│           │   ├── 📄 raise_dispute.rs
│           │   └── 📄 resolve_dispute.rs
│           ├── 📄 state/            # Account structures
│           │   ├── 📄 mod.rs
│           │   ├── 📄 escrow.rs
│           │   └── 📄 config.rs
│           ├── 📄 errors.rs         # Custom error types
│           └── 📄 utils.rs          # Helper functions
├── 📁 tests/
│   ├── 📄 escrow.ts                 # Anchor tests
│   └── 📄 utils.ts                  # Test utilities
├── 📄 Anchor.toml                   # Anchor configuration
├── 📄 Cargo.toml                    # Rust workspace
└── 📄 package.json                  # Node.js dependencies
```

## 🤖 AI Agent Service (`ai-agent/`)
```
ai-agent/
├── 📁 src/
│   ├── 📄 index.js                  # Express server setup
│   ├── 📄 routes/
│   │   ├── 📄 verification.js       # Verification endpoints
│   │   ├── 📄 evidence.js           # Evidence processing
│   │   └── 📄 health.js             # Health check
│   ├── 📄 services/
│   │   ├── 📄 aiService.js          # AWS Bedrock integration
│   │   ├── 📄 ipfsService.js        # Web3.storage integration
│   │   ├── 📄 signatureService.js   # Ed25519 signing
│   │   └── 📄 blockchainService.js  # Solana interaction
│   ├── 📄 utils/
│   │   ├── 📄 crypto.js             # Cryptographic utilities
│   │   ├── 📄 validation.js         # Input validation
│   │   └── 📄 logger.js             # Logging utilities
│   └── 📄 config/
│       ├── 📄 aws.js                # AWS configuration
│       ├── 📄 solana.js             # Solana configuration
│       └── 📄 keys.js               # Key management
├── 📁 tests/
│   ├── 📄 verification.test.js      # Verification tests
│   ├── 📄 signature.test.js         # Signature tests
│   └── 📄 integration.test.js       # Integration tests
├── 📄 package.json
├── 📄 .env.example
└── 📄 Dockerfile                    # Container configuration
```

## 🎨 Frontend Application (`frontend/`)
```
frontend/
├── 📁 src/
│   ├── 📁 app/                      # Next.js 13+ app directory
│   │   ├── 📄 layout.tsx            # Root layout with providers
│   │   ├── 📄 page.tsx              # Landing page with 3D hero
│   │   ├── 📄 globals.css           # Global styles and animations
│   │   ├── 📁 dashboard/
│   │   │   └── 📄 page.tsx          # Main dashboard
│   │   ├── 📁 escrow/
│   │   │   └── 📁 [id]/
│   │   │       └── 📄 page.tsx      # Escrow detail page
│   │   ├── 📁 kyc/
│   │   │   └── 📄 page.tsx          # KYC verification
│   │   └── 📁 settings/
│   │       └── 📄 page.tsx          # User settings
│   ├── 📁 components/               # React components
│   │   ├── 📁 ui/                   # Base UI components
│   │   │   ├── 📄 Button.tsx        # Animated button component
│   │   │   ├── 📄 Card.tsx          # 3D card component
│   │   │   ├── 📄 Modal.tsx         # Animated modal
│   │   │   ├── 📄 Input.tsx         # Glowing input fields
│   │   │   └── 📄 Progress.tsx      # Animated progress bars
│   │   ├── 📁 wallet/               # Wallet components
│   │   │   ├── 📄 WalletConnect.tsx # Animated wallet connection
│   │   │   ├── 📄 WalletModal.tsx   # Wallet selection modal
│   │   │   └── 📄 WalletProvider.tsx# Wallet context provider
│   │   ├── 📁 escrow/               # Escrow components
│   │   │   ├── 📄 EscrowCard.tsx    # 3D escrow card
│   │   │   ├── 📄 EscrowDetail.tsx  # Detailed escrow view
│   │   │   ├── 📄 CreateEscrow.tsx  # Creation wizard
│   │   │   ├── 📄 StatusTimeline.tsx# Animated status timeline
│   │   │   └── 📄 DisputeModal.tsx  # Dispute interface
│   │   ├── 📁 animations/           # Animation components
│   │   │   ├── 📄 ParticleBackground.tsx # Three.js particles
│   │   │   ├── 📄 Logo3D.tsx        # 3D AetherLock logo
│   │   │   ├── 📄 LoadingSpinner.tsx# Animated loading states
│   │   │   ├── 📄 SuccessAnimation.tsx # Success celebrations
│   │   │   └── 📄 GlitchEffect.tsx  # Glitch animations
│   │   ├── 📁 ai/                   # AI-related components
│   │   │   ├── 📄 AIStatusBadge.tsx # AI verification status
│   │   │   ├── 📄 EvidenceUpload.tsx# Evidence upload interface
│   │   │   └── 📄 VerificationFlow.tsx # AI verification flow
│   │   └── 📁 layout/               # Layout components
│   │       ├── 📄 Header.tsx        # Animated header
│   │       ├── 📄 Sidebar.tsx       # Collapsible sidebar
│   │       └── 📄 Footer.tsx        # Footer with links
│   ├── 📁 hooks/                    # Custom React hooks
│   │   ├── 📄 useWallet.ts          # Wallet state management
│   │   ├── 📄 useEscrow.ts          # Escrow operations
│   │   ├── 📄 useAI.ts              # AI verification
│   │   ├── 📄 useAnimations.ts      # Animation utilities
│   │   └── 📄 useKYC.ts             # KYC integration
│   ├── 📁 lib/                      # Utility libraries
│   │   ├── 📄 solana.ts             # Solana/Anchor client
│   │   ├── 📄 zkme.ts               # zkMe integration
│   │   ├── 📄 ipfs.ts               # IPFS utilities
│   │   ├── 📄 animations.ts         # Animation configurations
│   │   └── 📄 utils.ts              # General utilities
│   ├── 📁 styles/                   # Styling
│   │   ├── 📄 animations.css        # CSS animations
│   │   ├── 📄 cyberpunk.css         # Cyberpunk theme
│   │   └── 📄 components.css        # Component styles
│   └── 📁 types/                    # TypeScript types
│       ├── 📄 escrow.ts             # Escrow types
│       ├── 📄 ai.ts                 # AI service types
│       ├── 📄 wallet.ts             # Wallet types
│       └── 📄 animations.ts         # Animation types
├── 📁 public/                       # Static assets
│   ├── 📁 images/
│   │   ├── 📄 logo.svg              # AetherLock logo
│   │   ├── 📄 hero-bg.jpg           # Hero background
│   │   └── 📁 icons/                # UI icons
│   ├── 📁 sounds/                   # Audio effects
│   │   ├── 📄 success.mp3           # Success sound
│   │   ├── 📄 error.mp3             # Error sound
│   │   └── 📄 click.mp3             # Click feedback
│   └── 📁 models/                   # 3D models
│       └── 📄 logo.glb              # 3D logo model
├── 📄 package.json
├── 📄 next.config.js                # Next.js configuration
├── 📄 tailwind.config.js            # Tailwind CSS config
├── 📄 tsconfig.json                 # TypeScript config
└── 📄 .env.example                  # Environment variables
```

## 📚 Documentation (`docs/`)
```
docs/
├── 📄 mint.json                     # Mintlify configuration
├── 📁 pages/
│   ├── 📄 overview.mdx              # Project overview
│   ├── 📄 architecture.mdx          # System architecture
│   ├── 📄 smart-contracts.mdx       # Contract documentation
│   ├── 📄 ai-agent.mdx              # AI agent guide
│   ├── 📄 frontend.mdx              # Frontend guide
│   ├── 📄 deployment.mdx            # Deployment instructions
│   └── 📄 api-reference.mdx         # API documentation
├── 📁 images/
│   ├── 📄 architecture.png          # Architecture diagram
│   ├── 📄 flow-diagram.png          # User flow diagram
│   └── 📄 ui-mockups.png            # UI screenshots
└── 📄 README.md                     # Documentation README
```

## 🎬 Demo Materials (`demo/`)
```
demo/
├── 📄 demo-script.md                # 90-second demo script
├── 📄 presentation.pptx             # Hackathon presentation
├── 📁 videos/
│   ├── 📄 full-demo.mp4             # Complete demo video
│   ├── 📄 ui-showcase.mp4           # UI animation showcase
│   └── 📄 technical-deep-dive.mp4   # Technical explanation
├── 📁 screenshots/
│   ├── 📄 landing-page.png          # Landing page screenshot
│   ├── 📄 dashboard.png             # Dashboard screenshot
│   ├── 📄 escrow-detail.png         # Escrow detail view
│   └── 📄 mobile-views.png          # Mobile responsive views
└── 📄 judge-checklist.md            # Evaluation criteria
```

## 🧪 Testing (`tests/`)
```
tests/
├── 📁 e2e/                          # End-to-end tests
│   ├── 📄 user-journey.spec.ts      # Complete user flow
│   ├── 📄 wallet-connection.spec.ts # Wallet integration
│   └── 📄 escrow-lifecycle.spec.ts  # Escrow operations
├── 📁 integration/                  # Integration tests
│   ├── 📄 ai-agent.test.ts          # AI agent integration
│   ├── 📄 blockchain.test.ts        # Blockchain integration
│   └── 📄 zkme.test.ts              # zkMe integration
├── 📁 performance/                  # Performance tests
│   ├── 📄 animation-fps.test.ts     # Animation performance
│   └── 📄 load-testing.test.ts      # Load testing
└── 📄 test-config.ts                # Test configuration
```

## 📊 Architecture Diagrams (`diagrams/`)
```
diagrams/
├── 📄 system-architecture.mmd       # Mermaid system diagram
├── 📄 user-flow.mmd                 # User journey diagram
├── 📄 smart-contract-flow.mmd       # Contract interaction flow
├── 📄 ai-verification-flow.mmd      # AI verification process
└── 📄 deployment-architecture.mmd   # Deployment diagram
```

## 🚀 Key Technology Stack

### Blockchain & Web3
- **Solana**: Smart contract platform (Rust/Anchor)
- **Zeta Chain**: zkMe KYC integration
- **IPFS**: Decentralized evidence storage
- **Web3.storage**: IPFS pinning service

### AI & Backend
- **AWS Bedrock**: AI verification service
- **Node.js/Express**: AI agent API
- **Ed25519**: Cryptographic signatures
- **AWS Lambda**: Serverless deployment

### Frontend & UI
- **Next.js 13+**: React framework with app directory
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Advanced animations
- **Three.js**: 3D graphics and particles
- **React Hook Form**: Form management
- **Zustand**: State management

### Development & Deployment
- **Anchor**: Solana development framework
- **Vercel**: Frontend deployment
- **GitHub Actions**: CI/CD pipeline
- **Docker**: Containerization
- **Mintlify**: Documentation platform

## 🎯 Motion Design Highlights

### Landing Page
- 3D rotating AetherLock logo with particle effects
- Interactive particle background that responds to mouse movement
- Smooth scroll animations with parallax effects
- Animated statistics counters and progress bars

### Dashboard
- Staggered card animations on load
- Hover effects with magnetic attraction
- Real-time data visualization with smooth transitions
- Floating action buttons with ripple effects

### Escrow Flow
- Multi-step wizard with morphing progress indicators
- Drag-and-drop evidence upload with visual feedback
- Status timeline with animated progress and flowing connections
- Success celebrations with confetti and sound effects

### Mobile Experience
- Touch gestures with haptic feedback simulation
- Responsive animations that adapt to screen size
- Swipe interactions for card navigation
- Optimized performance for mobile devices

This structure ensures a professional, scalable codebase with impressive visual design that will stand out in the hackathon while maintaining clean architecture and comprehensive testing.