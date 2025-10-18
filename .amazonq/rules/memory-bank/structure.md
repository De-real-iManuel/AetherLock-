# AetherLock Project Structure

## Directory Organization

### Root Configuration
- `package.json` - Project dependencies and scripts
- `vite.config.js` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS customization
- `postcss.config.js` - PostCSS processing setup
- `eslint.config.js` - Code linting rules

### Source Code (`/src`)
```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components (Shadcn/ui)
│   │   ├── button.jsx   # Button component variants
│   │   ├── card.jsx     # Card layout components
│   │   └── input.jsx    # Form input components
│   └── AetherLockEscrow.jsx  # Main escrow interface
├── lib/
│   └── utils.js         # Utility functions and helpers
├── assets/              # Static assets
├── App.jsx              # Root application component
├── main.jsx             # Application entry point
├── App.css              # Component-specific styles
└── index.css            # Global styles and Tailwind imports
```

### Public Assets (`/public`)
- Static files served directly by Vite

## Core Components

### AetherLockEscrow.jsx
Main application component handling:
- Solana wallet connections
- Escrow contract interactions
- Transaction state management
- User interface orchestration

### UI Components (`/components/ui`)
Shadcn/ui based components providing:
- Consistent design system
- Accessible form controls
- Responsive layout primitives
- Reusable interface elements

## Architectural Patterns

### Component Architecture
- **Single Page Application**: React-based SPA with component composition
- **Functional Components**: Modern React hooks-based architecture
- **UI Component Library**: Shadcn/ui for consistent design system

### State Management
- React hooks for local component state
- Solana Web3.js for blockchain state
- AWS SDK for external service integration

### Styling Strategy
- **Tailwind CSS**: Utility-first CSS framework
- **Component Variants**: Class-variance-authority for dynamic styling
- **Design Tokens**: Consistent spacing, colors, and typography