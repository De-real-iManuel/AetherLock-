# AetherLock Technology Stack

## Core Technologies

### Frontend Framework
- **React 19.1.1** - Modern React with latest features
- **Vite 7.1.7** - Fast build tool and dev server
- **JavaScript (ES Modules)** - Modern JavaScript with module support

### Blockchain Integration
- **@solana/web3.js 1.98.4** - Solana blockchain interaction
- **Solana Network** - High-performance blockchain platform

### AI & Cloud Services
- **@aws-sdk/client-bedrock-runtime 3.913.0** - AWS Bedrock AI services
- **aws-sdk 2.1692.0** - AWS service integration

### UI & Styling
- **Tailwind CSS 4.1.14** - Utility-first CSS framework
- **@tailwindcss/postcss 4.1.14** - PostCSS integration
- **Shadcn/ui 0.9.5** - Component library
- **@radix-ui/react-slot 1.2.3** - Primitive UI components
- **Lucide React 0.546.0** - Icon library
- **class-variance-authority 0.7.1** - Component variant management
- **clsx 2.1.1** - Conditional className utility
- **tailwind-merge 3.3.1** - Tailwind class merging

## Development Tools

### Code Quality
- **ESLint 9.36.0** - JavaScript linting
- **@eslint/js 9.36.0** - ESLint JavaScript rules
- **eslint-plugin-react-hooks 5.2.0** - React hooks linting
- **eslint-plugin-react-refresh 0.4.22** - React refresh linting

### Build & Processing
- **@vitejs/plugin-react 5.0.4** - Vite React plugin
- **PostCSS 8.5.6** - CSS processing
- **Autoprefixer 10.4.21** - CSS vendor prefixing

### TypeScript Support
- **@types/react 19.1.16** - React TypeScript definitions
- **@types/react-dom 19.1.9** - React DOM TypeScript definitions

## Development Commands

### Local Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint checks
```

### Project Setup
```bash
npm install          # Install dependencies
```

## Configuration Files

### Build Configuration
- `vite.config.js` - Vite bundler settings
- `postcss.config.js` - PostCSS processing
- `tailwind.config.js` - Tailwind customization

### Code Quality
- `eslint.config.js` - Linting rules and plugins
- `.gitignore` - Version control exclusions

## Browser Support
Modern browsers with ES2020+ support required for:
- ES Modules
- Modern JavaScript features
- Web3 APIs
- CSS Grid/Flexbox