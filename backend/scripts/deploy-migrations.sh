#!/bin/bash

# Database Migration Deployment Script
# 
# This script safely deploys Prisma migrations to production database
# with backup and rollback capabilities
# 
# Usage:
#   ./scripts/deploy-migrations.sh [--skip-backup] [--dry-run]
# 
# Options:
#   --skip-backup  Skip creating a backup before migration (NOT RECOMMENDED)
#   --dry-run      Show what would be done without actually doing it

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
SKIP_BACKUP=false
DRY_RUN=false

for arg in "$@"; do
    case $arg in
        --skip-backup)
            SKIP_BACKUP=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        *)
            ;;
    esac
done

echo -e "${BLUE}🗄️  AetherLock Database Migration Deployment${NC}"
echo "=============================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL environment variable is not set${NC}"
    echo ""
    echo "Please set DATABASE_URL before running this script:"
    echo "  export DATABASE_URL='postgresql://user:password@host:port/database?sslmode=require'"
    echo ""
    exit 1
fi

# Verify DATABASE_URL format
if [[ ! "$DATABASE_URL" =~ ^postgresql:// ]]; then
    echo -e "${RED}❌ Error: DATABASE_URL must start with 'postgresql://'${NC}"
    exit 1
fi

# Check if SSL is enabled
if [[ ! "$DATABASE_URL" =~ sslmode=require ]]; then
    echo -e "${YELLOW}⚠️  Warning: DATABASE_URL does not include 'sslmode=require'${NC}"
    echo "   Production databases should use SSL connections"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Extract database info for display
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo "Database Host: $DB_HOST"
echo "Database Name: $DB_NAME"
echo ""

# Check database connectivity
echo -n "Testing database connection... "
if $DRY_RUN; then
    echo -e "${BLUE}[DRY RUN]${NC}"
else
    if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Connected${NC}"
    else
        echo -e "${RED}❌ Failed${NC}"
        echo ""
        echo "Cannot connect to database. Please check:"
        echo "  1. DATABASE_URL is correct"
        echo "  2. Database server is running"
        echo "  3. Network connectivity"
        echo "  4. Firewall rules allow connection"
        exit 1
    fi
fi

# Check migration status
echo ""
echo "Checking migration status..."
if $DRY_RUN; then
    echo -e "${BLUE}[DRY RUN] Would check migration status${NC}"
else
    npx prisma migrate status
fi

echo ""

# Create backup
if [ "$SKIP_BACKUP" = false ]; then
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="backup_before_migration_${TIMESTAMP}.sql"
    
    echo "Creating database backup..."
    echo "Backup file: $BACKUP_FILE"
    
    if $DRY_RUN; then
        echo -e "${BLUE}[DRY RUN] Would create backup: $BACKUP_FILE${NC}"
    else
        # Check if pg_dump is available
        if ! command -v pg_dump &> /dev/null; then
            echo -e "${YELLOW}⚠️  Warning: pg_dump not found${NC}"
            echo "   Backup will be skipped. Install PostgreSQL client tools to enable backups."
            echo ""
            read -p "Continue without backup? (y/N) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        else
            echo -n "Creating backup... "
            if pg_dump "$DATABASE_URL" > "$BACKUP_FILE" 2>/dev/null; then
                BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
                echo -e "${GREEN}✅ Done${NC} (Size: $BACKUP_SIZE)"
                echo ""
                echo -e "${GREEN}Backup created successfully!${NC}"
                echo "Location: $(pwd)/$BACKUP_FILE"
                echo ""
                echo "To restore this backup if needed:"
                echo "  psql \$DATABASE_URL < $BACKUP_FILE"
            else
                echo -e "${RED}❌ Failed${NC}"
                echo ""
                echo "Backup creation failed. Migration aborted."
                exit 1
            fi
        fi
    fi
else
    echo -e "${YELLOW}⚠️  Skipping backup (--skip-backup flag used)${NC}"
    echo "   This is NOT RECOMMENDED for production deployments!"
    echo ""
fi

# Confirm before proceeding
if [ "$DRY_RUN" = false ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Ready to deploy migrations to production database${NC}"
    echo ""
    read -p "Are you sure you want to continue? (yes/no) " -r
    echo
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        echo "Migration cancelled."
        exit 0
    fi
fi

# Deploy migrations
echo ""
echo "Deploying migrations..."
if $DRY_RUN; then
    echo -e "${BLUE}[DRY RUN] Would run: npx prisma migrate deploy${NC}"
else
    if npx prisma migrate deploy; then
        echo ""
        echo -e "${GREEN}✅ Migrations deployed successfully!${NC}"
    else
        echo ""
        echo -e "${RED}❌ Migration deployment failed!${NC}"
        echo ""
        if [ "$SKIP_BACKUP" = false ] && [ -f "$BACKUP_FILE" ]; then
            echo "A backup was created before the migration:"
            echo "  $BACKUP_FILE"
            echo ""
            echo "To rollback, restore the backup:"
            echo "  psql \$DATABASE_URL < $BACKUP_FILE"
        fi
        exit 1
    fi
fi

# Verify migration status
echo ""
echo "Verifying migration status..."
if $DRY_RUN; then
    echo -e "${BLUE}[DRY RUN] Would verify migration status${NC}"
else
    npx prisma migrate status
fi

# Generate Prisma Client
echo ""
echo "Regenerating Prisma Client..."
if $DRY_RUN; then
    echo -e "${BLUE}[DRY RUN] Would run: npx prisma generate${NC}"
else
    npx prisma generate
fi

# Run post-migration checks
echo ""
echo "Running post-migration checks..."

if $DRY_RUN; then
    echo -e "${BLUE}[DRY RUN] Would run post-migration checks${NC}"
else
    # Check table counts
    echo -n "Checking database tables... "
    TABLE_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tail -n 1 || echo "0")
    echo -e "${GREEN}✅ Found $TABLE_COUNT tables${NC}"
    
    # Check for pending migrations
    echo -n "Checking for pending migrations... "
    if npx prisma migrate status 2>&1 | grep -q "Database schema is up to date"; then
        echo -e "${GREEN}✅ No pending migrations${NC}"
    else
        echo -e "${YELLOW}⚠️  Warning: Unexpected migration status${NC}"
    fi
fi

# Summary
echo ""
echo "=============================================="
echo -e "${GREEN}✅ Migration deployment completed successfully!${NC}"
echo "=============================================="
echo ""

if [ "$SKIP_BACKUP" = false ] && [ "$DRY_RUN" = false ] && [ -f "$BACKUP_FILE" ]; then
    echo "📦 Backup Information:"
    echo "   File: $BACKUP_FILE"
    echo "   Size: $(du -h "$BACKUP_FILE" | cut -f1)"
    echo "   Keep this backup for at least 24 hours"
    echo ""
fi

echo "📋 Next Steps:"
echo "   1. Test your application endpoints"
echo "   2. Verify data integrity"
echo "   3. Monitor error logs for 24 hours"
echo "   4. Keep backup file for rollback if needed"
echo ""

if [ "$DRY_RUN" = true ]; then
    echo -e "${BLUE}This was a dry run. No changes were made.${NC}"
    echo "Run without --dry-run to actually deploy migrations."
    echo ""
fi
