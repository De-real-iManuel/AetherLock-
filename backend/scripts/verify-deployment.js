#!/usr/bin/env node

/**
 * Deployment Verification Script
 * 
 * This script verifies that all required environment variables are set
 * and that the deployment is configured correctly for production.
 * 
 * Usage:
 *   node scripts/verify-deployment.js
 * 
 * Exit codes:
 *   0 - All checks passed
 *   1 - One or more checks failed
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const REQUIRED_VARS = [
  'NODE_ENV',
  'DATABASE_URL',
  'FRONTEND_URL',
  'JWT_SECRET',
  'GEMINI_API_KEY',
  'ZKME_API_KEY',
  'ZKME_APP_ID',
  'IPFS_JWT',
];

const RECOMMENDED_VARS = [
  'LOG_LEVEL',
  'LOG_FORMAT',
  'ENABLE_REQUEST_LOGGING',
  'ENABLE_ERROR_STACK_TRACES',
  'DATABASE_POOL_MAX',
  'RATE_LIMIT_MAX_REQUESTS',
  'CORS_ALLOWED_ORIGINS',
];

const PRODUCTION_CHECKS = [
  {
    name: 'NODE_ENV is production',
    check: () => process.env.NODE_ENV === 'production',
    severity: 'error',
  },
  {
    name: 'DATABASE_URL includes SSL mode',
    check: () => process.env.DATABASE_URL?.includes('sslmode=require'),
    severity: 'error',
  },
  {
    name: 'JWT_SECRET is strong (32+ characters)',
    check: () => (process.env.JWT_SECRET?.length || 0) >= 32,
    severity: 'error',
  },
  {
    name: 'Error stack traces disabled',
    check: () => process.env.ENABLE_ERROR_STACK_TRACES !== 'true',
    severity: 'warning',
  },
  {
    name: 'Structured logging enabled (JSON format)',
    check: () => process.env.LOG_FORMAT === 'json',
    severity: 'warning',
  },
  {
    name: 'Log level is info or warn',
    check: () => ['info', 'warn', 'error'].includes(process.env.LOG_LEVEL || ''),
    severity: 'warning',
  },
  {
    name: 'FRONTEND_URL is HTTPS',
    check: () => process.env.FRONTEND_URL?.startsWith('https://'),
    severity: 'error',
  },
  {
    name: 'CORS origins configured',
    check: () => {
      const origins = process.env.CORS_ALLOWED_ORIGINS || process.env.FRONTEND_URL;
      return origins && origins.length > 0;
    },
    severity: 'error',
  },
  {
    name: 'Database connection pool configured',
    check: () => {
      const poolMax = parseInt(process.env.DATABASE_POOL_MAX || '0');
      return poolMax >= 5 && poolMax <= 20;
    },
    severity: 'warning',
  },
  {
    name: 'Rate limiting configured',
    check: () => {
      const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '0');
      return maxRequests > 0 && maxRequests <= 200;
    },
    severity: 'warning',
  },
];

console.log('🔍 AetherLock Backend Deployment Verification\n');
console.log('=' .repeat(60));

let hasErrors = false;
let hasWarnings = false;

// Check required environment variables
console.log('\n📋 Required Environment Variables:\n');
REQUIRED_VARS.forEach((varName) => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const display = value ? (varName.includes('SECRET') || varName.includes('KEY') || varName.includes('JWT') ? '[REDACTED]' : value) : 'NOT SET';
  
  console.log(`${status} ${varName}: ${display}`);
  
  if (!value) {
    hasErrors = true;
  }
});

// Check recommended environment variables
console.log('\n📋 Recommended Environment Variables:\n');
RECOMMENDED_VARS.forEach((varName) => {
  const value = process.env[varName];
  const status = value ? '✅' : '⚠️';
  const display = value || 'NOT SET (using default)';
  
  console.log(`${status} ${varName}: ${display}`);
  
  if (!value) {
    hasWarnings = true;
  }
});

// Run production checks
if (process.env.NODE_ENV === 'production') {
  console.log('\n🔒 Production Security Checks:\n');
  
  PRODUCTION_CHECKS.forEach((check) => {
    const passed = check.check();
    const status = passed ? '✅' : (check.severity === 'error' ? '❌' : '⚠️');
    
    console.log(`${status} ${check.name}`);
    
    if (!passed) {
      if (check.severity === 'error') {
        hasErrors = true;
      } else {
        hasWarnings = true;
      }
    }
  });
}

// Database URL validation
console.log('\n🗄️  Database Configuration:\n');
if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log(`✅ Protocol: ${url.protocol}`);
    console.log(`✅ Host: ${url.hostname}`);
    console.log(`✅ Port: ${url.port || '5432'}`);
    console.log(`✅ Database: ${url.pathname.substring(1)}`);
    
    const sslMode = url.searchParams.get('sslmode') || url.searchParams.get('ssl');
    if (sslMode) {
      console.log(`✅ SSL Mode: ${sslMode}`);
    } else {
      console.log('⚠️  SSL Mode: not specified (recommended: sslmode=require)');
      hasWarnings = true;
    }
  } catch (error) {
    console.log('❌ Invalid DATABASE_URL format');
    hasErrors = true;
  }
} else {
  console.log('❌ DATABASE_URL not set');
  hasErrors = true;
}

// CORS configuration
console.log('\n🌐 CORS Configuration:\n');
const corsOrigins = [];
if (process.env.CORS_ALLOWED_ORIGINS) {
  corsOrigins.push(...process.env.CORS_ALLOWED_ORIGINS.split(',').map(o => o.trim()));
}
if (process.env.FRONTEND_URL) {
  corsOrigins.push(process.env.FRONTEND_URL);
}
if (process.env.ADDITIONAL_CORS_ORIGINS) {
  corsOrigins.push(...process.env.ADDITIONAL_CORS_ORIGINS.split(',').map(o => o.trim()));
}

const uniqueOrigins = [...new Set(corsOrigins)].filter(o => o.length > 0);
if (uniqueOrigins.length > 0) {
  console.log(`✅ Allowed origins (${uniqueOrigins.length}):`);
  uniqueOrigins.forEach(origin => console.log(`   - ${origin}`));
} else {
  console.log('❌ No CORS origins configured');
  hasErrors = true;
}

// Connection pool configuration
console.log('\n🔌 Connection Pool Configuration:\n');
const poolMin = parseInt(process.env.DATABASE_POOL_MIN || '2');
const poolMax = parseInt(process.env.DATABASE_POOL_MAX || '10');
const connectionTimeout = parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '30000');

console.log(`✅ Pool Min: ${poolMin}`);
console.log(`✅ Pool Max: ${poolMax}`);
console.log(`✅ Connection Timeout: ${connectionTimeout}ms`);

if (poolMax < 5) {
  console.log('⚠️  Pool Max is low (< 5), may cause connection issues under load');
  hasWarnings = true;
}

if (poolMax > 20) {
  console.log('⚠️  Pool Max is high (> 20), ensure your database plan supports this');
  hasWarnings = true;
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 Verification Summary:\n');

if (hasErrors) {
  console.log('❌ FAILED: Critical issues found that must be fixed before deployment');
  console.log('   Please review the errors above and update your environment variables.');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  PASSED WITH WARNINGS: Deployment is possible but not optimal');
  console.log('   Consider addressing the warnings above for better production readiness.');
  process.exit(0);
} else {
  console.log('✅ PASSED: All checks passed! Deployment is ready.');
  process.exit(0);
}
