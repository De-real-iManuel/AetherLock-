# Railway Deployment Guide for AetherLock Backend

This guide provides step-by-step instructions for deploying the AetherLock backend to Railway.

## Prerequisites

- Railway account (sign up at https://railway.app)
- GitHub repository with backend code
- All required API keys and credentials

## Step 1: Create Railway Project

1. Go to https://railway.app and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub account
5. Select your AetherLock repository
6. Railway will automatically detect the Node.js application

## Step 2: Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will provision a PostgreSQL database
4. The `DATABASE_URL` environment variable will be automatically injected

## Step 3: Configure Environment Variables

Go to your service settings and add the following environment variables:

### Required Variables

```bash
# Node Environment
NODE_ENV=production

# Frontend URL (update with your Vercel deployment URL)
FRONTEND_URL=https://your-app.vercel.app
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app

# Database (automatically provided by Railway PostgreSQL plugin)
# DATABASE_URL is automatically set by Railway
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_CONNECTION_TIMEOUT=30000
DATABASE_CONNECTION_LIFETIME=1800000
DATABASE_IDLE_TIMEOUT=600000

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your_generated_jwt_secret_here
JWT_EXPIRATION=7d

# AI Verification (Gemini API)
GEMINI_API_KEY=your_gemini_api_key
AI_MODEL=gemini-1.5-flash
AI_MAX_TOKENS=2048
AI_TEMPERATURE=0.7

# Identity Verification (zkMe)
ZKME_API_KEY=your_zkme_api_key
ZKME_APP_ID=your_zkme_app_id
ZKME_WEBHOOK_SECRET=your_zkme_webhook_secret

# IPFS Storage (Pinata)
IPFS_JWT=your_pinata_jwt_token
IPFS_API_KEY=your_pinata_api_key
IPFS_API_SECRET=your_pinata_api_secret
IPFS_GATEWAY_URL=https://gateway.pinata.cloud

# Blockchain Configuration
SOLANA_PROGRAM_ID=your_solana_program_id
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_NETWORK=mainnet-beta

# ZetaChain Configuration
ZETACHAIN_RPC_URL=https://zetachain-evm.blockpi.network/v1/rpc/public
ZETACHAIN_PRIVATE_KEY=your_zetachain_private_key
ZETACHAIN_NETWORK=mainnet

# Security
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
ENABLE_ERROR_STACK_TRACES=false
LOG_FORMAT=json

# Performance Monitoring
ENABLE_PERFORMANCE_MONITORING=true

# WebSocket Configuration
WS_PING_INTERVAL=25000
WS_PING_TIMEOUT=60000
WS_MAX_CONNECTIONS_PER_USER=5

# Feature Flags
ENABLE_AI_VERIFICATION=true
ENABLE_KYC_VERIFICATION=true
ENABLE_CROSS_CHAIN=true
ENABLE_CHAT=true
ENABLE_NOTIFICATIONS=true
```

### Optional Variables

```bash
# Sentry Error Tracking (recommended for production)
SENTRY_DSN=your_sentry_dsn
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1

# Additional CORS Origins
ADDITIONAL_CORS_ORIGINS=https://www.your-app.com,https://app.your-domain.com

# Email Configuration (if using email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM_NAME=AetherLock
EMAIL_FROM_ADDRESS=noreply@aetherlock.app

# Redis (if using caching)
REDIS_URL=redis://your-redis-url:6379
REDIS_KEY_PREFIX=aetherlock:
```

## Step 4: Configure Build and Start Commands

Railway should auto-detect these, but verify:

### Build Command
```bash
npm install && npm run db:generate
```

### Start Command
```bash
npm start
```

## Step 5: Configure Health Check

1. Go to your service settings in Railway
2. Navigate to "Health Check" section
3. Configure:
   - **Health Check Path**: `/health`
   - **Health Check Interval**: 30 seconds
   - **Health Check Timeout**: 10 seconds
   - **Health Check Retries**: 3

## Step 6: Verify Deployment Configuration

Before deploying, verify all environment variables are set correctly:

```bash
# Run deployment verification script
npm run verify:deployment
```

This script checks:
- All required environment variables are set
- Production security settings are correct
- Database URL is properly formatted with SSL
- CORS configuration is valid
- Connection pool settings are optimal

## Step 7: Run Database Migrations

After the first deployment:

1. Open Railway CLI or use the web terminal
2. Run migrations:
```bash
npx prisma migrate deploy
```

Or connect to your Railway database locally:
```bash
# Get DATABASE_URL from Railway dashboard
export DATABASE_URL="postgresql://..."
npx prisma migrate deploy
```

**Important**: Always create a backup before running migrations in production!

```bash
# Create backup before migration
pg_dump $DATABASE_URL > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql

# Run migration
npx prisma migrate deploy

# Verify migration success
npx prisma migrate status
```

## Step 8: Configure Automated Database Backups

Railway automatically backs up PostgreSQL databases, but you should verify the settings:

1. Go to PostgreSQL service in Railway dashboard
2. Click "Backups" tab
3. Verify backup schedule:
   - **Frequency**: Daily (automatic)
   - **Retention**: 7 days (Hobby), 30 days (Pro)
   - **Time**: Typically runs at 2 AM UTC

4. Test manual backup:
   - Click "Create Backup" button
   - Wait for backup to complete
   - Verify backup appears in list

5. Document backup restoration procedure (see DATABASE_ROLLBACK.md)

## Step 9: Configure Custom Domain (Optional)

1. Go to your service settings
2. Click "Settings" → "Domains"
3. Click "Generate Domain" for a Railway subdomain
4. Or add a custom domain:
   - Click "Custom Domain"
   - Enter your domain (e.g., api.aetherlock.app)
   - Add the CNAME record to your DNS provider
   - Wait for DNS propagation (can take up to 48 hours)

## Step 10: Enable Automatic Deployments

1. Go to service settings
2. Navigate to "Deployments"
3. Enable "Automatic Deployments"
4. Select branch: `main` or `production`
5. Every push to this branch will trigger a new deployment

## Step 11: Verify Deployment

### Test Health Check
```bash
curl https://your-app.up.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "services": {
    "database": {
      "status": "connected"
    },
    "ai": {
      "status": "configured"
    },
    "websocket": {
      "status": "connected"
    }
  }
}
```

### Test API Endpoints

#### Automated Testing (Recommended)

Run the comprehensive deployment test script:

```bash
# Make script executable (if not already)
chmod +x scripts/test-deployment.sh

# Run all tests
./scripts/test-deployment.sh https://your-app.up.railway.app https://your-app.vercel.app
```

This script tests:
- Health check endpoint
- CORS configuration
- API endpoints
- Security headers
- WebSocket connections
- Database connectivity
- External service configuration

#### Manual Testing

```bash
# Test CORS
curl -H "Origin: https://your-app.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://your-app.up.railway.app/api/user/profile

# Test API endpoint
curl https://your-app.up.railway.app/api/websocket/stats

# Test health check with detailed output
curl https://your-app.up.railway.app/health | jq
```

## Step 12: Update Frontend Configuration

Update your frontend `.env.production` file:

```bash
VITE_API_BASE_URL=https://your-app.up.railway.app
VITE_WEBSOCKET_URL=wss://your-app.up.railway.app
```

Redeploy your frontend to Vercel.

## Monitoring and Maintenance

### View Logs
1. Go to your Railway project
2. Click on your service
3. Navigate to "Logs" tab
4. Filter by log level (info, warn, error)

### Monitor Metrics
1. Go to "Metrics" tab in Railway dashboard
2. Monitor:
   - CPU usage
   - Memory usage
   - Network traffic
   - Request rate
   - Response time

### Database Monitoring
1. Click on PostgreSQL service
2. View metrics:
   - Connection count
   - Query performance
   - Storage usage

### Set Up Alerts
1. Go to project settings
2. Navigate to "Notifications"
3. Configure alerts for:
   - High error rate
   - High memory usage
   - Service downtime
   - Database connection issues

## Troubleshooting

### Database Connection Issues

**Problem**: `Database connection failed`

**Solutions**:
1. Verify `DATABASE_URL` is set correctly
2. Check if PostgreSQL service is running
3. Verify connection pool settings
4. Check Railway PostgreSQL logs

```bash
# Test database connection
npx prisma db pull
```

### CORS Errors

**Problem**: `Origin not allowed by CORS`

**Solutions**:
1. Verify `FRONTEND_URL` matches your Vercel deployment URL
2. Check `CORS_ALLOWED_ORIGINS` includes all necessary domains
3. Ensure no trailing slashes in URLs
4. Test with curl:

```bash
curl -H "Origin: https://your-app.vercel.app" \
     -X OPTIONS \
     https://your-app.up.railway.app/health
```

### Health Check Failures

**Problem**: Railway shows service as unhealthy

**Solutions**:
1. Check `/health` endpoint manually
2. Verify database connection
3. Check service logs for errors
4. Increase health check timeout if needed

### High Memory Usage

**Problem**: Service using too much memory

**Solutions**:
1. Reduce `DATABASE_POOL_MAX` (try 5-8)
2. Reduce `WS_MAX_CONNECTIONS_PER_USER`
3. Enable connection pooling
4. Check for memory leaks in logs
5. Upgrade Railway plan if needed

### WebSocket Connection Issues

**Problem**: WebSocket connections failing

**Solutions**:
1. Verify WSS protocol is used in production
2. Check WebSocket configuration
3. Verify Railway supports WebSocket (it does)
4. Check browser console for errors

## Performance Optimization

### Database Connection Pooling

For high-traffic applications, consider using PgBouncer:

1. Add PgBouncer to your Railway project
2. Update `DATABASE_URL` to point to PgBouncer
3. Configure pool mode (transaction or session)

### Caching

Add Redis for caching:

1. Add Redis plugin in Railway
2. Update environment variables
3. Implement caching in your application

### CDN

Use a CDN for static assets:

1. Upload static files to CDN
2. Update asset URLs in your application
3. Configure CORS on CDN

## Security Checklist

- [ ] All environment variables are set
- [ ] `JWT_SECRET` is strong and unique
- [ ] `NODE_ENV=production` is set
- [ ] `ENABLE_ERROR_STACK_TRACES=false` is set
- [ ] CORS is configured with production URLs only
- [ ] Database connection uses SSL (`?sslmode=require`)
- [ ] Rate limiting is enabled
- [ ] All API keys are valid and have appropriate permissions
- [ ] Health check endpoint is working
- [ ] Logs are being generated correctly
- [ ] Error tracking is configured (Sentry)

## Backup and Recovery

### Database Backups

Railway automatically backs up PostgreSQL databases:
- Backups are taken daily
- Retention period depends on your plan
- Manual backups can be triggered from dashboard

### Manual Backup
```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql
```

### Disaster Recovery Plan

1. Keep environment variables documented
2. Store API keys securely (use password manager)
3. Maintain database backups
4. Document deployment process
5. Test recovery procedures regularly

## Cost Optimization

### Railway Pricing Tiers

- **Hobby Plan**: $5/month + usage
  - 512MB RAM
  - 1GB storage
  - Suitable for development/testing

- **Pro Plan**: $20/month + usage
  - 8GB RAM
  - 100GB storage
  - Suitable for production

### Optimize Costs

1. Monitor resource usage
2. Optimize database queries
3. Implement caching
4. Use connection pooling
5. Clean up old data regularly

## Support and Resources

- Railway Documentation: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- AetherLock Documentation: [Your docs URL]
- GitHub Issues: [Your repo URL]/issues

## Post-Deployment Checklist

- [ ] Health check endpoint returns 200 OK
- [ ] Database connection is working
- [ ] All API endpoints are accessible
- [ ] CORS is configured correctly
- [ ] WebSocket connections work
- [ ] AI verification is working
- [ ] IPFS uploads are working
- [ ] zkMe KYC integration is working
- [ ] Blockchain interactions are working
- [ ] Logs are being generated
- [ ] Metrics are being collected
- [ ] Error tracking is working (if configured)
- [ ] Frontend can connect to backend
- [ ] All environment variables are set
- [ ] Custom domain is configured (if applicable)
- [ ] SSL certificate is valid
- [ ] Automatic deployments are enabled
- [ ] Team members have access
- [ ] Documentation is updated

## Maintenance Schedule

### Daily
- Monitor error logs
- Check health check status
- Review performance metrics

### Weekly
- Review database performance
- Check for security updates
- Review API usage patterns

### Monthly
- Update dependencies
- Review and optimize database
- Backup verification
- Security audit

## Emergency Contacts

- Railway Support: support@railway.app
- Team Lead: [Your contact]
- DevOps: [Your contact]

---

**Last Updated**: [Current Date]
**Version**: 1.0.0
