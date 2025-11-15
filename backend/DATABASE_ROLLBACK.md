# Database Rollback Procedure

This document outlines the procedures for rolling back database changes in case of migration failures or data corruption.

## Table of Contents

1. [Pre-Rollback Checklist](#pre-rollback-checklist)
2. [Backup Procedures](#backup-procedures)
3. [Rollback Methods](#rollback-methods)
4. [Recovery Procedures](#recovery-procedures)
5. [Post-Rollback Verification](#post-rollback-verification)

## Pre-Rollback Checklist

Before performing any rollback operation:

- [ ] Identify the specific migration or change that needs to be rolled back
- [ ] Verify that a backup exists from before the problematic change
- [ ] Notify all team members about the planned rollback
- [ ] Put the application in maintenance mode (if possible)
- [ ] Document the reason for the rollback
- [ ] Estimate downtime and communicate to stakeholders

## Backup Procedures

### Automatic Backups (Railway)

Railway automatically creates daily backups of your PostgreSQL database:

1. **Access Backups**:
   - Go to Railway dashboard
   - Select your PostgreSQL service
   - Navigate to "Backups" tab
   - View available backup snapshots

2. **Backup Retention**:
   - Hobby Plan: 7 days
   - Pro Plan: 30 days
   - Enterprise: Custom retention

### Manual Backup Before Changes

Always create a manual backup before running migrations:

```bash
# Set your DATABASE_URL
export DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Create backup with timestamp
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup file
ls -lh backup_*.sql
```

### Backup with Compression

For large databases:

```bash
# Create compressed backup
pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Verify compressed backup
gunzip -t backup_*.sql.gz
```

### Backup Specific Tables

If only specific tables are affected:

```bash
# Backup specific tables
pg_dump $DATABASE_URL -t users -t escrows > backup_specific_tables.sql
```

## Rollback Methods

### Method 1: Prisma Migration Rollback

Prisma doesn't have a built-in rollback command, but you can manually revert migrations.

#### Step 1: Identify the Migration to Rollback

```bash
# List all migrations
ls -la prisma/migrations/

# Example output:
# 20240101000000_initial_setup/
# 20240102000000_add_user_fields/
# 20240103000000_add_escrow_status/  <- Want to rollback this
```

#### Step 2: Create a Rollback Migration

```bash
# Create a new migration that reverses the changes
npx prisma migrate dev --name rollback_escrow_status --create-only

# Edit the generated migration file to reverse the changes
# Example: If the original migration added a column, the rollback should drop it
```

#### Step 3: Apply the Rollback Migration

```bash
# Apply the rollback migration
npx prisma migrate deploy
```

### Method 2: Restore from Backup (Railway Dashboard)

#### For Railway Automatic Backups:

1. **Access Railway Dashboard**:
   - Go to your Railway project
   - Select PostgreSQL service
   - Click "Backups" tab

2. **Select Backup**:
   - Choose the backup from before the problematic change
   - Note the timestamp

3. **Restore Backup**:
   - Click "Restore" button next to the backup
   - Confirm the restoration
   - Wait for the process to complete (5-30 minutes depending on size)

4. **Verify Restoration**:
   - Check database connection
   - Verify data integrity
   - Test application functionality

### Method 3: Restore from Manual Backup

#### Restore Uncompressed Backup:

```bash
# WARNING: This will drop and recreate the database
# Make sure you have a current backup first!

# Set DATABASE_URL
export DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Drop all tables (be careful!)
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Restore from backup
psql $DATABASE_URL < backup_20240103_120000.sql

# Verify restoration
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

#### Restore Compressed Backup:

```bash
# Restore from compressed backup
gunzip -c backup_20240103_120000.sql.gz | psql $DATABASE_URL
```

#### Restore Specific Tables:

```bash
# Restore only specific tables
psql $DATABASE_URL < backup_specific_tables.sql
```

### Method 4: Point-in-Time Recovery (Enterprise Only)

For Railway Enterprise plans with point-in-time recovery:

1. Contact Railway support
2. Provide the exact timestamp to restore to
3. Wait for Railway to perform the recovery
4. Verify the restoration

## Recovery Procedures

### Scenario 1: Migration Failed Midway

**Symptoms**: Migration script failed, database is in inconsistent state

**Recovery Steps**:

1. **Check Migration Status**:
```bash
# Connect to database
psql $DATABASE_URL

# Check Prisma migration table
SELECT * FROM "_prisma_migrations" ORDER BY finished_at DESC LIMIT 5;
```

2. **Identify Failed Migration**:
```sql
-- Look for migrations with failed status
SELECT migration_name, finished_at, logs 
FROM "_prisma_migrations" 
WHERE finished_at IS NULL OR logs LIKE '%error%';
```

3. **Manual Cleanup**:
```sql
-- If migration partially applied, manually revert changes
-- Example: Drop partially created table
DROP TABLE IF EXISTS problematic_table;

-- Mark migration as rolled back
DELETE FROM "_prisma_migrations" 
WHERE migration_name = '20240103000000_problematic_migration';
```

4. **Restore from Backup**:
```bash
# Restore from backup taken before migration
psql $DATABASE_URL < backup_before_migration.sql
```

5. **Regenerate Prisma Client**:
```bash
npx prisma generate
```

### Scenario 2: Data Corruption After Deployment

**Symptoms**: Application deployed successfully but data is corrupted

**Recovery Steps**:

1. **Put Application in Maintenance Mode**:
   - Update Railway environment variable: `MAINTENANCE_MODE=true`
   - Deploy a maintenance page

2. **Identify Corruption Scope**:
```sql
-- Check for null values where they shouldn't be
SELECT COUNT(*) FROM users WHERE wallet_address IS NULL;

-- Check for orphaned records
SELECT COUNT(*) FROM escrows WHERE buyer_id NOT IN (SELECT id FROM users);

-- Check for invalid data
SELECT * FROM escrows WHERE amount < 0;
```

3. **Restore from Backup**:
```bash
# Restore entire database
psql $DATABASE_URL < backup_before_corruption.sql
```

4. **Verify Data Integrity**:
```sql
-- Run integrity checks
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM escrows;
SELECT COUNT(*) FROM messages;

-- Verify relationships
SELECT COUNT(*) FROM escrows e 
LEFT JOIN users u ON e.buyer_id = u.id 
WHERE u.id IS NULL;
```

5. **Remove Maintenance Mode**:
   - Update Railway environment variable: `MAINTENANCE_MODE=false`
   - Redeploy application

### Scenario 3: Schema Mismatch After Rollback

**Symptoms**: Database rolled back but Prisma schema doesn't match

**Recovery Steps**:

1. **Pull Current Database Schema**:
```bash
# This will update your Prisma schema to match the database
npx prisma db pull
```

2. **Review Changes**:
```bash
# Check what changed
git diff prisma/schema.prisma
```

3. **Regenerate Prisma Client**:
```bash
npx prisma generate
```

4. **Update Application Code**:
   - Fix any TypeScript errors due to schema changes
   - Update queries that reference changed fields

5. **Test Locally**:
```bash
# Run tests
npm test

# Start dev server
npm run dev
```

6. **Deploy Updated Code**:
```bash
git add .
git commit -m "fix: update schema after database rollback"
git push origin main
```

## Post-Rollback Verification

### Database Integrity Checks

```sql
-- Check table counts
SELECT 
  schemaname,
  tablename,
  (SELECT COUNT(*) FROM pg_class WHERE relname = tablename) as row_count
FROM pg_tables 
WHERE schemaname = 'public';

-- Check for missing indexes
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes 
WHERE schemaname = 'public';

-- Check for foreign key constraints
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

### Application Health Checks

```bash
# Test health endpoint
curl https://your-app.up.railway.app/health

# Expected response:
# {
#   "status": "healthy",
#   "services": {
#     "database": { "status": "connected" }
#   }
# }
```

### Functional Testing

1. **Test User Operations**:
   - Create new user
   - Update user profile
   - Verify KYC status

2. **Test Escrow Operations**:
   - Create new escrow
   - Submit work
   - Release funds

3. **Test Real-time Features**:
   - Send chat message
   - Verify WebSocket connection
   - Check notifications

### Data Validation

```sql
-- Verify critical data
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_escrows FROM escrows;
SELECT COUNT(*) as active_escrows FROM escrows WHERE status = 'ACTIVE';
SELECT SUM(amount) as total_locked_funds FROM escrows WHERE status IN ('ACTIVE', 'CREATED');

-- Check for data consistency
SELECT 
  e.id,
  e.buyer_id,
  u.wallet_address
FROM escrows e
LEFT JOIN users u ON e.buyer_id = u.id
WHERE u.id IS NULL;  -- Should return 0 rows
```

## Prevention Best Practices

### Before Running Migrations

1. **Always Create a Backup**:
```bash
# Automated backup script
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backups/backup_$TIMESTAMP.sql
echo "Backup created: backup_$TIMESTAMP.sql"
```

2. **Test Migrations Locally**:
```bash
# Use a local database that mirrors production
npm run db:migrate
npm test
```

3. **Review Migration SQL**:
```bash
# Generate migration without applying
npx prisma migrate dev --create-only

# Review the generated SQL
cat prisma/migrations/*/migration.sql
```

4. **Use Staging Environment**:
   - Deploy to staging first
   - Run migrations on staging database
   - Test thoroughly
   - Only then deploy to production

### During Migrations

1. **Monitor Migration Progress**:
```bash
# Watch migration logs
tail -f migration.log
```

2. **Set Migration Timeout**:
```bash
# Set statement timeout to prevent long-running migrations
psql $DATABASE_URL -c "SET statement_timeout = '5min';"
```

3. **Use Transactions**:
```sql
-- Wrap migrations in transactions when possible
BEGIN;
-- Migration statements here
COMMIT;
-- Or ROLLBACK if something goes wrong
```

### After Migrations

1. **Verify Migration Success**:
```bash
# Check migration status
npx prisma migrate status
```

2. **Run Health Checks**:
```bash
curl https://your-app.up.railway.app/health
```

3. **Monitor Error Logs**:
```bash
# Check Railway logs for errors
railway logs
```

4. **Keep Backup for 24 Hours**:
   - Don't delete backups immediately
   - Wait 24 hours to ensure stability
   - Monitor for any issues

## Emergency Contacts

- **Database Issues**: [DBA Contact]
- **Railway Support**: support@railway.app
- **Team Lead**: [Team Lead Contact]
- **On-Call Engineer**: [On-Call Contact]

## Rollback Decision Matrix

| Severity | Impact | Action | Approval Required |
|----------|--------|--------|-------------------|
| Critical | Data loss | Immediate rollback | Team Lead |
| High | Service down | Rollback within 1 hour | Senior Dev |
| Medium | Degraded performance | Rollback within 4 hours | Any Dev |
| Low | Minor issues | Fix forward | Any Dev |

## Rollback Checklist

- [ ] Backup created before rollback
- [ ] Team notified about rollback
- [ ] Maintenance mode enabled (if needed)
- [ ] Rollback method selected
- [ ] Rollback executed
- [ ] Database integrity verified
- [ ] Application health checked
- [ ] Functional tests passed
- [ ] Data validation completed
- [ ] Maintenance mode disabled
- [ ] Team notified about completion
- [ ] Incident documented
- [ ] Post-mortem scheduled

## Documentation

After any rollback:

1. **Create Incident Report**:
   - What went wrong
   - Why it went wrong
   - How it was fixed
   - How to prevent it

2. **Update Runbook**:
   - Add new scenarios
   - Update procedures
   - Document lessons learned

3. **Share Knowledge**:
   - Team meeting
   - Documentation update
   - Training if needed

---

**Last Updated**: [Current Date]
**Version**: 1.0.0
**Maintained By**: DevOps Team
