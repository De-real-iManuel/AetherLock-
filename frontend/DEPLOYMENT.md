# AetherLock Frontend Deployment Guide

This guide covers deploying the AetherLock frontend to Vercel with proper configuration for production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Vercel Configuration](#vercel-configuration)
- [Deployment Steps](#deployment-steps)
- [Preview Deployments](#preview-deployments)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Vercel account (sign up at [vercel.com](https://vercel.com))
- GitHub repository connected to Vercel
- Backend API deployed and accessible
- Required API keys and service credentials

## Environment Variables

### Required Environment Variables

The following environment variables must be configured in your Vercel project settings:

#### API Configuration

| Variable | Description | Example (Development) | Example (Production) |
|----------|-------------|----------------------|---------------------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3001` | `https://api.aetherlock.app` |
| `VITE_WS_URL` | WebSocket server URL | `ws://localhost:3001` | `wss://api.aetherlock.app` |

#### Blockchain Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SOLANA_RPC_URL` | Solana RPC endpoint | `https://api.mainnet-beta.solana.com` |
| `VITE_ZETACHAIN_RPC_URL` | ZetaChain RPC endpoint | `https://zetachain-mainnet.blockpi.network/v1/rpc/public` |
| `VITE_SOLANA_PROGRAM_ID` | Solana program ID for escrow contracts | `AetherLockEscrow11111111111111111111111111` |
| `VITE_ZETACHAIN_GATEWAY` | ZetaChain gateway contract address | `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0` |

#### Third-Party Services

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_ZKME_APP_ID` | zkMe KYC application ID | `M202510180319727898435789743751` |

#### Feature Flags

| Variable | Description | Default | Options |
|----------|-------------|---------|---------|
| `VITE_ENABLE_VOICE` | Enable voice chat features | `false` | `true`, `false` |
| `VITE_ENABLE_ANALYTICS` | Enable analytics tracking | `true` | `true`, `false` |

### Setting Environment Variables in Vercel

1. Go to your project in the Vercel dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable with appropriate values for each environment:
   - **Production**: Used for production deployments
   - **Preview**: Used for preview deployments (PRs)
   - **Development**: Used for local development

#### Example Configuration

```bash
# Production Environment
VITE_API_URL=https://api.aetherlock.app
VITE_WS_URL=wss://api.aetherlock.app
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
VITE_ZETACHAIN_RPC_URL=https://zetachain-mainnet.blockpi.network/v1/rpc/public
VITE_SOLANA_PROGRAM_ID=<your-mainnet-program-id>
VITE_ZETACHAIN_GATEWAY=<your-mainnet-gateway-address>
VITE_ZKME_APP_ID=<your-zkme-app-id>
VITE_ENABLE_VOICE=false
VITE_ENABLE_ANALYTICS=true

# Preview Environment (for testing)
VITE_API_URL=https://api-staging.aetherlock.app
VITE_WS_URL=wss://api-staging.aetherlock.app
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_ZETACHAIN_RPC_URL=https://zetachain-athens-evm.blockpi.network/v1/rpc/public
VITE_SOLANA_PROGRAM_ID=<your-devnet-program-id>
VITE_ZETACHAIN_GATEWAY=<your-testnet-gateway-address>
VITE_ZKME_APP_ID=<your-zkme-app-id>
VITE_ENABLE_VOICE=false
VITE_ENABLE_ANALYTICS=false
```

## Vercel Configuration

The `vercel.json` file in the project root configures the deployment settings:

### Key Configuration Features

#### SPA Routing
All routes are rewritten to `/index.html` to support client-side routing:
```json
"rewrites": [
  {
    "source": "/(.*)",
    "destination": "/index.html"
  }
]
```

#### Caching Headers
Static assets are cached for optimal performance:
```json
"headers": [
  {
    "source": "/assets/(.*)",
    "headers": [
      {
        "key": "Cache-Control",
        "value": "public, max-age=31536000, immutable"
      }
    ]
  }
]
```

#### Security Headers
Security headers are automatically applied:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

#### GitHub Integration
Automatic deployments are enabled for:
- Main branch → Production
- Pull requests → Preview deployments
- Auto-aliasing for custom domains
- Automatic job cancellation for superseded deployments

## Deployment Steps

### Initial Setup

1. **Connect Repository to Vercel**
   ```bash
   # Install Vercel CLI (optional)
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   ```

2. **Import Project**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select your GitHub repository
   - Vercel will auto-detect the Vite framework

3. **Configure Project**
   - Framework Preset: **Vite**
   - Root Directory: `./frontend` (if in monorepo) or `./` (if standalone)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Add Environment Variables**
   - Add all required environment variables as listed above
   - Set appropriate values for Production and Preview environments

5. **Deploy**
   - Click **Deploy**
   - Wait for the build to complete
   - Your site will be live at `https://your-project.vercel.app`

### Subsequent Deployments

Deployments are automatic:
- **Push to main branch** → Production deployment
- **Open pull request** → Preview deployment
- **Push to PR branch** → Updated preview deployment

### Manual Deployment

Using Vercel CLI:
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Preview Deployments

Preview deployments are automatically created for every pull request.

### Features

- **Unique URL**: Each PR gets a unique preview URL
- **Automatic Updates**: Preview updates on every push to the PR branch
- **Environment Variables**: Uses Preview environment variables
- **Comments**: Vercel bot comments on PRs with deployment status and URL

### Accessing Preview Deployments

1. Open your pull request on GitHub
2. Look for the Vercel bot comment with the preview URL
3. Click the URL to view the preview deployment

### Preview Environment Configuration

Preview deployments should use:
- Staging/testnet backend API
- Devnet blockchain RPCs
- Test program IDs and contract addresses
- Disabled analytics

## Custom Domain Configuration

### Adding a Custom Domain

1. Go to your project in Vercel dashboard
2. Navigate to **Settings** → **Domains**
3. Add your domain (e.g., `app.aetherlock.com`)
4. Follow DNS configuration instructions:
   - **A Record**: Point to Vercel's IP
   - **CNAME**: Point to `cname.vercel-dns.com`

5. Wait for DNS propagation (up to 48 hours)
6. Vercel automatically provisions SSL certificate

### Recommended Domain Setup

- Production: `app.aetherlock.com`
- Staging: `staging.aetherlock.com`
- Preview: `preview-*.aetherlock.com` (automatic)

## Build Optimization

### Build Settings

The project is optimized for production builds:

- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Removes unused code
- **Minification**: JavaScript and CSS minification
- **Asset Optimization**: Images and fonts optimized
- **Compression**: Gzip and Brotli compression enabled

### Build Performance

Expected build times:
- Initial build: 2-3 minutes
- Incremental builds: 1-2 minutes

### Bundle Size Targets

- Main bundle: < 500KB (gzipped)
- Total initial load: < 1MB (gzipped)
- Lazy-loaded chunks: < 200KB each

## Monitoring and Analytics

### Vercel Analytics

Enable Vercel Analytics for performance monitoring:
1. Go to **Analytics** tab in Vercel dashboard
2. Enable **Web Analytics**
3. View real-time performance metrics

### Key Metrics to Monitor

- **Core Web Vitals**: LCP, FID, CLS
- **Build Times**: Track build performance
- **Error Rate**: Monitor deployment failures
- **Traffic**: Page views and unique visitors

## Troubleshooting

### Common Issues

#### Build Failures

**Issue**: Build fails with "Module not found"
```bash
Solution: Ensure all dependencies are in package.json
npm install
npm run build  # Test locally
```

**Issue**: TypeScript errors during build
```bash
Solution: Fix type errors or adjust tsconfig.json
npm run lint  # Check for errors locally
```

#### Environment Variables Not Working

**Issue**: Environment variables are undefined in production
```bash
Solution: 
1. Verify variables are prefixed with VITE_
2. Check they're set in Vercel dashboard
3. Redeploy after adding variables
```

#### Routing Issues

**Issue**: 404 errors on page refresh
```bash
Solution: Verify vercel.json rewrites configuration
The SPA rewrite should redirect all routes to /index.html
```

#### WebSocket Connection Failures

**Issue**: WebSocket fails to connect in production
```bash
Solution:
1. Ensure VITE_WS_URL uses wss:// (not ws://)
2. Verify backend WebSocket server is accessible
3. Check CORS configuration on backend
```

### Deployment Logs

View deployment logs:
1. Go to **Deployments** tab in Vercel dashboard
2. Click on a deployment
3. View **Build Logs** and **Function Logs**

### Rollback

To rollback to a previous deployment:
1. Go to **Deployments** tab
2. Find the working deployment
3. Click **⋯** → **Promote to Production**

## Performance Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] Custom domain configured with SSL
- [ ] Analytics enabled
- [ ] Error tracking configured
- [ ] Build completes successfully
- [ ] Bundle size within targets
- [ ] All routes work correctly
- [ ] WebSocket connections work
- [ ] Wallet connections work
- [ ] API calls succeed
- [ ] Images load correctly
- [ ] Animations perform smoothly
- [ ] Mobile responsive design verified
- [ ] Cross-browser testing completed

## Security Checklist

- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Security headers configured
- [ ] Environment variables secured
- [ ] API keys not exposed in client code
- [ ] CORS configured on backend
- [ ] Rate limiting enabled on API
- [ ] Input validation implemented
- [ ] XSS protection enabled

## Support

For deployment issues:
- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Project Issues**: [GitHub Issues](https://github.com/your-repo/issues)

## Additional Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Environment Variables Best Practices](https://vercel.com/docs/concepts/projects/environment-variables)
- [Custom Domains Guide](https://vercel.com/docs/concepts/projects/domains)
