# Quick Vercel Setup Guide

This is a quick reference for deploying AetherLock frontend to Vercel. For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Quick Start

### 1. Connect to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Select the repository containing this frontend

### 2. Configure Project Settings

**Framework Preset:** Vite

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**Root Directory:**
- If monorepo: `./frontend`
- If standalone: `./`

### 3. Add Environment Variables

Go to **Settings** → **Environment Variables** and add:

#### Production Environment

```bash
VITE_API_URL=https://api.aetherlock.app
VITE_WS_URL=wss://api.aetherlock.app
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
VITE_ZETACHAIN_RPC_URL=https://zetachain-mainnet.blockpi.network/v1/rpc/public
VITE_SOLANA_PROGRAM_ID=<your-mainnet-program-id>
VITE_ZETACHAIN_GATEWAY=<your-mainnet-gateway-address>
VITE_ZKME_APP_ID=<your-zkme-app-id>
VITE_ENABLE_VOICE=false
VITE_ENABLE_ANALYTICS=true
```

#### Preview Environment (for PRs)

```bash
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

### 4. Deploy

Click **Deploy** and wait for the build to complete.

## Automatic Deployments

Once configured, deployments are automatic:

- **Push to main** → Production deployment
- **Open PR** → Preview deployment
- **Push to PR** → Updated preview

## Preview Deployments

Every pull request automatically gets:
- ✅ Unique preview URL
- ✅ Automatic updates on push
- ✅ Vercel bot comment with URL
- ✅ Separate environment variables

## Custom Domain

1. Go to **Settings** → **Domains**
2. Add your domain (e.g., `app.aetherlock.com`)
3. Configure DNS:
   - **A Record**: Point to Vercel's IP
   - **CNAME**: Point to `cname.vercel-dns.com`
4. Wait for SSL certificate (automatic)

## Vercel CLI (Optional)

```bash
# Install
npm i -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Configuration Files

The following files configure Vercel deployment:

- **vercel.json**: Deployment configuration (rewrites, headers, env)
- **.env.example**: Environment variable template
- **package.json**: Build scripts and dependencies

## Troubleshooting

### Build Fails
```bash
# Test build locally
npm install
npm run build
```

### Environment Variables Not Working
1. Ensure variables are prefixed with `VITE_`
2. Check they're set in Vercel dashboard
3. Redeploy after adding variables

### 404 on Page Refresh
- Verify `vercel.json` has SPA rewrites configured
- Check that all routes redirect to `/index.html`

### WebSocket Connection Fails
1. Use `wss://` (not `ws://`) in production
2. Verify backend WebSocket server is accessible
3. Check CORS configuration

## Need Help?

- 📖 [Full Deployment Guide](./DEPLOYMENT.md)
- 🔧 [Vercel Documentation](https://vercel.com/docs)
- 💬 [Vercel Support](https://vercel.com/support)

## Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] Backend API deployed and accessible
- [ ] Smart contracts deployed to mainnet
- [ ] zkMe app ID configured
- [ ] Custom domain configured (optional)
- [ ] Build completes successfully locally
- [ ] All tests passing
