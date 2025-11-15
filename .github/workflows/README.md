# GitHub Actions Workflows

This directory contains CI/CD workflows for automated deployment to Vercel.

## Workflows

### vercel-production.yml

Automatically deploys to production when code is pushed to the `main` branch.

**Triggers:**
- Push to `main` branch
- Changes in `frontend/**` directory

**Steps:**
1. Checkout code
2. Setup Node.js 20
3. Install dependencies
4. Lint code
5. Build project with production environment variables
6. Deploy to Vercel production

### vercel-preview.yml

Automatically creates preview deployments for pull requests.

**Triggers:**
- Pull request opened/updated targeting `main` branch
- Changes in `frontend/**` directory

**Steps:**
1. Checkout code
2. Setup Node.js 20
3. Install dependencies
4. Lint code
5. Build project with preview environment variables
6. Deploy to Vercel preview

## Required GitHub Secrets

Configure these secrets in your repository settings (**Settings** → **Secrets and variables** → **Actions**):

### Vercel Configuration

| Secret | Description | How to Get |
|--------|-------------|------------|
| `VERCEL_TOKEN` | Vercel authentication token | [Account Settings → Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Vercel organization ID | Run `vercel link` in project directory |
| `VERCEL_PROJECT_ID` | Vercel project ID | Run `vercel link` in project directory |

### Production Environment Variables

| Secret | Description | Example |
|--------|-------------|---------|
| `VITE_API_URL_PRODUCTION` | Production API URL | `https://api.aetherlock.app` |
| `VITE_WS_URL_PRODUCTION` | Production WebSocket URL | `wss://api.aetherlock.app` |
| `VITE_SOLANA_RPC_URL_PRODUCTION` | Solana mainnet RPC | `https://api.mainnet-beta.solana.com` |
| `VITE_ZETACHAIN_RPC_URL_PRODUCTION` | ZetaChain mainnet RPC | `https://zetachain-mainnet.blockpi.network/v1/rpc/public` |
| `VITE_SOLANA_PROGRAM_ID_PRODUCTION` | Mainnet program ID | Your deployed program ID |
| `VITE_ZETACHAIN_GATEWAY_PRODUCTION` | Mainnet gateway address | Your deployed gateway address |
| `VITE_ZKME_APP_ID` | zkMe application ID | Your zkMe app ID |

### Preview Environment Variables

| Secret | Description | Example |
|--------|-------------|---------|
| `VITE_API_URL_PREVIEW` | Staging API URL | `https://api-staging.aetherlock.app` |
| `VITE_WS_URL_PREVIEW` | Staging WebSocket URL | `wss://api-staging.aetherlock.app` |
| `VITE_SOLANA_RPC_URL_PREVIEW` | Solana devnet RPC | `https://api.devnet.solana.com` |
| `VITE_ZETACHAIN_RPC_URL_PREVIEW` | ZetaChain testnet RPC | `https://zetachain-athens-evm.blockpi.network/v1/rpc/public` |
| `VITE_SOLANA_PROGRAM_ID_PREVIEW` | Devnet program ID | Your test program ID |
| `VITE_ZETACHAIN_GATEWAY_PREVIEW` | Testnet gateway address | Your test gateway address |

## Setup Instructions

### 1. Get Vercel Token

1. Go to [Vercel Account Settings → Tokens](https://vercel.com/account/tokens)
2. Create a new token with appropriate scope
3. Copy the token and add it as `VERCEL_TOKEN` secret in GitHub

### 2. Get Vercel Project IDs

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project (run in frontend directory)
cd frontend
vercel link

# Get project details
cat .vercel/project.json
```

The `.vercel/project.json` file will contain:
```json
{
  "orgId": "your-org-id",
  "projectId": "your-project-id"
}
```

Add these as `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` secrets in GitHub.

### 3. Add Environment Variable Secrets

Add all environment variables listed above to GitHub Secrets.

### 4. Enable Workflows

The workflows will automatically run when:
- Code is pushed to `main` (production deployment)
- Pull request is opened/updated (preview deployment)

## Workflow Status

View workflow runs in the **Actions** tab of your GitHub repository.

## Disabling Workflows

To temporarily disable a workflow:
1. Go to **Actions** tab
2. Select the workflow
3. Click **⋯** → **Disable workflow**

## Troubleshooting

### Build Fails

Check the workflow logs in the **Actions** tab for detailed error messages.

Common issues:
- Missing or incorrect environment variables
- Linting errors
- TypeScript compilation errors
- Missing dependencies

### Deployment Fails

Verify:
- Vercel token is valid
- Organization and project IDs are correct
- Vercel project exists and is accessible

### Environment Variables Not Working

Ensure:
- All required secrets are added to GitHub
- Secret names match exactly (case-sensitive)
- Values are correct and properly formatted

## Manual Deployment

If workflows fail, you can deploy manually:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Vercel GitHub Integration](https://vercel.com/docs/concepts/git/vercel-for-github)
