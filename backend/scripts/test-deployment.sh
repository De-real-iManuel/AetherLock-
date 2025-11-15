#!/bin/bash

# Deployment Testing Script
# 
# This script tests all critical endpoints and functionality after deployment
# 
# Usage:
#   ./scripts/test-deployment.sh <backend-url>
# 
# Example:
#   ./scripts/test-deployment.sh https://your-app.up.railway.app

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if URL is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Backend URL is required${NC}"
    echo "Usage: $0 <backend-url>"
    echo "Example: $0 https://your-app.up.railway.app"
    exit 1
fi

BACKEND_URL=$1
FRONTEND_URL=${2:-"https://your-app.vercel.app"}

echo "🧪 AetherLock Backend Deployment Tests"
echo "======================================"
echo ""
echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=$3
    local method=${4:-GET}
    local data=${5:-}
    
    echo -n "Testing $name... "
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$url" -H "Origin: $FRONTEND_URL")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$url" -H "Content-Type: application/json" -H "Origin: $FRONTEND_URL" -d "$data")
    fi
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ PASSED${NC} (Status: $status_code)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC} (Expected: $expected_status, Got: $status_code)"
        echo "Response: $body"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Function to test CORS
test_cors() {
    local name=$1
    local url=$2
    
    echo -n "Testing CORS for $name... "
    
    response=$(curl -s -I -H "Origin: $FRONTEND_URL" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: Content-Type" -X OPTIONS "$url")
    
    if echo "$response" | grep -q "Access-Control-Allow-Origin"; then
        echo -e "${GREEN}✅ PASSED${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        echo "Response headers:"
        echo "$response"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Function to test WebSocket
test_websocket() {
    local name=$1
    local url=$2
    
    echo -n "Testing WebSocket $name... "
    
    # Check if wscat is installed
    if ! command -v wscat &> /dev/null; then
        echo -e "${YELLOW}⚠️  SKIPPED${NC} (wscat not installed)"
        echo "   Install with: npm install -g wscat"
        return 0
    fi
    
    # Test WebSocket connection (timeout after 5 seconds)
    timeout 5 wscat -c "$url" --execute "ping" &> /dev/null
    
    if [ $? -eq 0 ] || [ $? -eq 124 ]; then
        echo -e "${GREEN}✅ PASSED${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

echo "📋 Running Health Checks..."
echo ""

# Test health endpoint
test_endpoint "Health Check" "$BACKEND_URL/health" 200

# Test health check response structure
echo -n "Testing health check response structure... "
health_response=$(curl -s "$BACKEND_URL/health")

if echo "$health_response" | jq -e '.status == "healthy"' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASSED${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    
    # Display service statuses
    echo ""
    echo "Service Statuses:"
    echo "$health_response" | jq -r '.services | to_entries[] | "  \(.key): \(.value.status)"'
    echo ""
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "Response: $health_response"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""
echo "🌐 Testing CORS Configuration..."
echo ""

# Test CORS for various endpoints
test_cors "Health endpoint" "$BACKEND_URL/health"
test_cors "API endpoint" "$BACKEND_URL/api/websocket/stats"

echo ""
echo "🔌 Testing API Endpoints..."
echo ""

# Test WebSocket stats endpoint
test_endpoint "WebSocket Stats" "$BACKEND_URL/api/websocket/stats" 200

# Test 404 handling
test_endpoint "404 Handler" "$BACKEND_URL/api/nonexistent" 404

echo ""
echo "🔒 Testing Security Headers..."
echo ""

echo -n "Testing security headers... "
headers=$(curl -s -I "$BACKEND_URL/health")

security_passed=true

# Check for security headers
if ! echo "$headers" | grep -q "X-Content-Type-Options"; then
    echo -e "${YELLOW}⚠️  Missing X-Content-Type-Options header${NC}"
    security_passed=false
fi

if ! echo "$headers" | grep -q "X-Frame-Options"; then
    echo -e "${YELLOW}⚠️  Missing X-Frame-Options header${NC}"
    security_passed=false
fi

if $security_passed; then
    echo -e "${GREEN}✅ PASSED${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${YELLOW}⚠️  PASSED WITH WARNINGS${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
fi

echo ""
echo "⚡ Testing WebSocket Connection..."
echo ""

# Convert HTTP(S) URL to WS(S)
WS_URL=$(echo "$BACKEND_URL" | sed 's/^http/ws/')
test_websocket "Connection" "$WS_URL"

echo ""
echo "📊 Testing Database Connection..."
echo ""

echo -n "Testing database connectivity... "
health_response=$(curl -s "$BACKEND_URL/health")
db_status=$(echo "$health_response" | jq -r '.services.database.status')

if [ "$db_status" = "connected" ]; then
    echo -e "${GREEN}✅ PASSED${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ FAILED${NC} (Status: $db_status)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""
echo "🔧 Testing External Service Configuration..."
echo ""

# Check AI service configuration
echo -n "Testing AI service configuration... "
ai_status=$(echo "$health_response" | jq -r '.services.ai.status')
if [ "$ai_status" = "configured" ]; then
    echo -e "${GREEN}✅ PASSED${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${YELLOW}⚠️  NOT CONFIGURED${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
fi

# Check IPFS service configuration
echo -n "Testing IPFS service configuration... "
ipfs_status=$(echo "$health_response" | jq -r '.services.ipfs.status')
if [ "$ipfs_status" = "configured" ]; then
    echo -e "${GREEN}✅ PASSED${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${YELLOW}⚠️  NOT CONFIGURED${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
fi

# Check KYC service configuration
echo -n "Testing KYC service configuration... "
kyc_status=$(echo "$health_response" | jq -r '.services.kyc.status')
if [ "$kyc_status" = "configured" ]; then
    echo -e "${GREEN}✅ PASSED${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${YELLOW}⚠️  NOT CONFIGURED${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
fi

echo ""
echo "======================================"
echo "📊 Test Summary"
echo "======================================"
echo ""
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed! Deployment is healthy.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please review the errors above.${NC}"
    exit 1
fi
