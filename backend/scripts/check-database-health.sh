#!/bin/bash

# Database Health Check Script
# 
# This script performs comprehensive health checks on the production database
# 
# Usage:
#   ./scripts/check-database-health.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏥 AetherLock Database Health Check${NC}"
echo "====================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL environment variable is not set${NC}"
    exit 1
fi

# Extract database info
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo "Database Host: $DB_HOST"
echo "Database Name: $DB_NAME"
echo ""

# Test counter
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNING=0

# Function to run check
run_check() {
    local name=$1
    local query=$2
    local expected=$3
    
    echo -n "Checking $name... "
    
    result=$(npx prisma db execute --stdin <<< "$query" 2>/dev/null | tail -n 1 || echo "ERROR")
    
    if [ "$result" = "ERROR" ]; then
        echo -e "${RED}❌ FAILED${NC}"
        CHECKS_FAILED=$((CHECKS_FAILED + 1))
        return 1
    elif [ -n "$expected" ] && [ "$result" != "$expected" ]; then
        echo -e "${YELLOW}⚠️  WARNING${NC} (Expected: $expected, Got: $result)"
        CHECKS_WARNING=$((CHECKS_WARNING + 1))
        return 0
    else
        echo -e "${GREEN}✅ PASSED${NC} ($result)"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
        return 0
    fi
}

echo "🔌 Connection Tests"
echo "-------------------"
echo ""

# Test basic connectivity
echo -n "Testing database connection... "
if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Connected${NC}"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${RED}❌ Failed${NC}"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
    echo ""
    echo "Cannot connect to database. Exiting."
    exit 1
fi

# Check SSL connection
echo -n "Checking SSL connection... "
if [[ "$DATABASE_URL" =~ sslmode=require ]]; then
    echo -e "${GREEN}✅ SSL Enabled${NC}"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${YELLOW}⚠️  SSL Not Required${NC}"
    CHECKS_WARNING=$((CHECKS_WARNING + 1))
fi

echo ""
echo "📊 Database Statistics"
echo "----------------------"
echo ""

# Check table count
run_check "table count" "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"

# Check total row counts
echo -n "Checking total records... "
TOTAL_USERS=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM users;" 2>/dev/null | tail -n 1 || echo "0")
TOTAL_ESCROWS=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM escrows;" 2>/dev/null | tail -n 1 || echo "0")
TOTAL_MESSAGES=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM messages;" 2>/dev/null | tail -n 1 || echo "0")

echo -e "${GREEN}✅ PASSED${NC}"
echo "   Users: $TOTAL_USERS"
echo "   Escrows: $TOTAL_ESCROWS"
echo "   Messages: $TOTAL_MESSAGES"
CHECKS_PASSED=$((CHECKS_PASSED + 1))

echo ""
echo "🔍 Data Integrity Checks"
echo "------------------------"
echo ""

# Check for orphaned escrows (escrows without valid buyer)
echo -n "Checking for orphaned escrows... "
ORPHANED=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM escrows e LEFT JOIN users u ON e.buyer_id = u.id WHERE u.id IS NULL;" 2>/dev/null | tail -n 1 || echo "0")
if [ "$ORPHANED" = "0" ]; then
    echo -e "${GREEN}✅ PASSED${NC} (0 orphaned records)"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${YELLOW}⚠️  WARNING${NC} ($ORPHANED orphaned records found)"
    CHECKS_WARNING=$((CHECKS_WARNING + 1))
fi

# Check for null wallet addresses
echo -n "Checking for null wallet addresses... "
NULL_WALLETS=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM users WHERE wallet_address IS NULL;" 2>/dev/null | tail -n 1 || echo "0")
if [ "$NULL_WALLETS" = "0" ]; then
    echo -e "${GREEN}✅ PASSED${NC} (0 null addresses)"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${RED}❌ FAILED${NC} ($NULL_WALLETS null addresses found)"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

# Check for negative amounts
echo -n "Checking for negative escrow amounts... "
NEGATIVE_AMOUNTS=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM escrows WHERE amount < 0;" 2>/dev/null | tail -n 1 || echo "0")
if [ "$NEGATIVE_AMOUNTS" = "0" ]; then
    echo -e "${GREEN}✅ PASSED${NC} (0 negative amounts)"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${RED}❌ FAILED${NC} ($NEGATIVE_AMOUNTS negative amounts found)"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

echo ""
echo "🔐 Security Checks"
echo "------------------"
echo ""

# Check for duplicate wallet addresses
echo -n "Checking for duplicate wallet addresses... "
DUPLICATES=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM (SELECT wallet_address, COUNT(*) as cnt FROM users GROUP BY wallet_address HAVING COUNT(*) > 1) as dupes;" 2>/dev/null | tail -n 1 || echo "0")
if [ "$DUPLICATES" = "0" ]; then
    echo -e "${GREEN}✅ PASSED${NC} (0 duplicates)"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${RED}❌ FAILED${NC} ($DUPLICATES duplicate addresses found)"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

echo ""
echo "⚡ Performance Checks"
echo "---------------------"
echo ""

# Check for missing indexes
echo -n "Checking for missing indexes... "
INDEX_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';" 2>/dev/null | tail -n 1 || echo "0")
if [ "$INDEX_COUNT" -gt "0" ]; then
    echo -e "${GREEN}✅ PASSED${NC} ($INDEX_COUNT indexes found)"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${YELLOW}⚠️  WARNING${NC} (No indexes found)"
    CHECKS_WARNING=$((CHECKS_WARNING + 1))
fi

# Check database size
echo -n "Checking database size... "
DB_SIZE=$(npx prisma db execute --stdin <<< "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));" 2>/dev/null | tail -n 1 || echo "Unknown")
echo -e "${GREEN}✅ PASSED${NC} ($DB_SIZE)"
CHECKS_PASSED=$((CHECKS_PASSED + 1))

# Check active connections
echo -n "Checking active connections... "
ACTIVE_CONN=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM pg_stat_activity WHERE datname = '$DB_NAME';" 2>/dev/null | tail -n 1 || echo "Unknown")
echo -e "${GREEN}✅ PASSED${NC} ($ACTIVE_CONN active)"
CHECKS_PASSED=$((CHECKS_PASSED + 1))

# Check connection limit
echo -n "Checking connection limit... "
MAX_CONN=$(npx prisma db execute --stdin <<< "SELECT setting FROM pg_settings WHERE name = 'max_connections';" 2>/dev/null | tail -n 1 || echo "Unknown")
echo -e "${GREEN}✅ PASSED${NC} (Max: $MAX_CONN)"
CHECKS_PASSED=$((CHECKS_PASSED + 1))

# Calculate connection usage percentage
if [ "$ACTIVE_CONN" != "Unknown" ] && [ "$MAX_CONN" != "Unknown" ]; then
    CONN_USAGE=$((ACTIVE_CONN * 100 / MAX_CONN))
    echo -n "Connection pool usage... "
    if [ "$CONN_USAGE" -lt 70 ]; then
        echo -e "${GREEN}✅ HEALTHY${NC} ($CONN_USAGE%)"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
    elif [ "$CONN_USAGE" -lt 90 ]; then
        echo -e "${YELLOW}⚠️  WARNING${NC} ($CONN_USAGE% - Consider increasing pool size)"
        CHECKS_WARNING=$((CHECKS_WARNING + 1))
    else
        echo -e "${RED}❌ CRITICAL${NC} ($CONN_USAGE% - Increase pool size immediately)"
        CHECKS_FAILED=$((CHECKS_FAILED + 1))
    fi
fi

echo ""
echo "🔄 Migration Status"
echo "-------------------"
echo ""

# Check migration status
echo "Current migration status:"
npx prisma migrate status

echo ""
echo "====================================="
echo "📊 Health Check Summary"
echo "====================================="
echo ""
echo -e "Checks Passed:  ${GREEN}$CHECKS_PASSED${NC}"
echo -e "Checks Warning: ${YELLOW}$CHECKS_WARNING${NC}"
echo -e "Checks Failed:  ${RED}$CHECKS_FAILED${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ] && [ $CHECKS_WARNING -eq 0 ]; then
    echo -e "${GREEN}✅ Database is healthy!${NC}"
    exit 0
elif [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Database is healthy with warnings${NC}"
    echo "   Review warnings above and consider addressing them"
    exit 0
else
    echo -e "${RED}❌ Database has critical issues!${NC}"
    echo "   Please review and fix the failed checks above"
    exit 1
fi
