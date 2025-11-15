# AetherLock Frontend Setup Instructions

## Prerequisites

Before running the project, ensure you have the following installed:

1. **Node.js** (v20 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

## Installation Steps

1. Navigate to the frontend directory:
   ```bash
   cd AetherLock--main/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

   This will install all required dependencies including:
   - React 19
   - Vite 7
   - TypeScript 5
   - Tailwind CSS 3
   - Framer Motion 11
   - Zustand 5
   - TanStack React Query 5
   - Axios
   - Socket.io-client
   - And all other dependencies listed in package.json

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`:
   ```
   VITE_API_BASE_URL=http://localhost:3001
   VITE_WEBSOCKET_URL=ws://localhost:3001
   VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
   VITE_ZKME_APP_ID=your_zkme_app_id
   VITE_ZKME_API_KEY=your_zkme_api_key
   VITE_PINATA_API_KEY=your_pinata_api_key
   VITE_PINATA_SECRET_KEY=your_pinata_secret_key
   VITE_ARCANUM_API_KEY=your_arcanum_api_key
   ```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Build

Create a production build:
```bash
npm run build
```

## Linting

Run ESLint to check code quality:
```bash
npm run lint
```

## Project Structure

```
src/
├── components/     # React components
│   ├── ui/        # Base UI components (Button, Card, Modal, etc.)
│   ├── layout/    # Layout components (Navbar, Footer, Sidebar)
│   ├── wallet/    # Wallet connection components
│   ├── kyc/       # KYC verification components
│   ├── escrow/    # Escrow management components
│   ├── ai/        # AI verification components
│   ├── chat/      # Chat interface components
│   ├── animations/# Animation components (Particles, Grid, etc.)
│   └── landing/   # Landing page components
├── pages/         # Page components
├── services/      # API and external service integrations
├── stores/        # Zustand state management stores
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
├── hooks/         # Custom React hooks
└── lib/           # Library configurations and helpers
```

## Configuration Files

- `tsconfig.json` - TypeScript configuration
- `vite.config.js` - Vite bundler configuration
- `tailwind.config.js` - Tailwind CSS configuration with cyberpunk theme
- `eslint.config.js` - ESLint configuration
- `.prettierrc` - Prettier code formatting configuration

## Next Steps

After setup is complete, you can begin implementing the tasks from the spec:
1. Implement type definitions and data models (Task 2)
2. Build core services layer (Task 3)
3. Create Zustand stores (Task 4)
4. And so on...

Refer to `.kiro/specs/aetherlock-frontend-rebuild/tasks.md` for the complete implementation plan.
