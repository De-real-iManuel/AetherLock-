import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import http from 'http';
import { rateLimiter } from '../middleware/validation.js';
import websocketService from '../services/websocketService.js';

dotenv.config();

// Database connection with production-ready configuration and connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : process.env.LOG_LEVEL === 'debug' 
      ? ['error', 'warn'] 
      : ['error'],
  errorFormat: process.env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
  // Connection pool configuration for production
  // These settings optimize database connections for high-traffic environments
  connectionLimit: parseInt(process.env.DATABASE_POOL_MAX) || 10,
});

// Test database connection on startup (production)
if (process.env.NODE_ENV === 'production') {
  prisma.$connect()
    .then(async () => {
      console.log('✅ Database connected with connection pooling');
      console.log(`📊 Pool settings: min=${process.env.DATABASE_POOL_MIN || 2}, max=${process.env.DATABASE_POOL_MAX || 10}`);
      
      // Test query to verify connection
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Database query test successful');
    })
    .catch((err) => {
      console.error('❌ Database connection failed:', err);
      console.error('💡 Check DATABASE_URL and ensure PostgreSQL is accessible');
      process.exit(1);
    });
} else {
  // In development, connect lazily
  console.log('🔧 Development mode: Database will connect on first query');
}

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 4001;

// Initialize WebSocket service with enhanced features
const io = websocketService.initialize(httpServer);

// Make io and prisma available globally for routes
global.io = io;
global.prisma = prisma;
global.websocketService = websocketService;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration with production-ready whitelist
const allowedOrigins = [];

// Add origins from CORS_ALLOWED_ORIGINS environment variable
if (process.env.CORS_ALLOWED_ORIGINS) {
  const configuredOrigins = process.env.CORS_ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
  allowedOrigins.push(...configuredOrigins);
}

// Add FRONTEND_URL if specified
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// Add additional origins if specified
if (process.env.ADDITIONAL_CORS_ORIGINS) {
  const additionalOrigins = process.env.ADDITIONAL_CORS_ORIGINS.split(',').map(origin => origin.trim());
  allowedOrigins.push(...additionalOrigins);
}

// Add default development origins if not in production
if (process.env.NODE_ENV !== 'production') {
  const devOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ];
  allowedOrigins.push(...devOrigins);
}

// Remove duplicates and empty strings
const uniqueOrigins = [...new Set(allowedOrigins)].filter(origin => origin && origin.length > 0);

console.log('🔒 CORS Configuration:');
console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`   Allowed origins (${uniqueOrigins.length}):`, uniqueOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl, etc.) only in development
    if (!origin) {
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      } else {
        console.warn('⚠️ CORS: Request with no origin header blocked in production');
        return callback(new Error('Origin header required in production'));
      }
    }
    
    // Check if origin is in allowed list
    if (uniqueOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS: Blocked request from unauthorized origin: ${origin}`);
      console.warn(`   Allowed origins: ${uniqueOrigins.join(', ')}`);
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours - cache preflight requests
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware (production-ready with structured logging)
if (process.env.ENABLE_REQUEST_LOGGING !== 'false') {
  app.use((req, res, next) => {
    const start = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    
    // Attach request ID for tracing
    req.requestId = requestId;
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logLevel = res.statusCode >= 400 ? 'error' : 'info';
      
      // Structured logging for production (JSON format)
      if (process.env.LOG_FORMAT === 'json') {
        const logData = {
          timestamp: new Date().toISOString(),
          requestId,
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          userAgent: req.get('user-agent'),
          ip: req.ip || req.connection.remoteAddress,
          level: logLevel
        };
        
        // Only log errors or if debug mode is enabled
        if (logLevel === 'error' || process.env.LOG_LEVEL === 'debug') {
          console.log(JSON.stringify(logData));
        }
      } else {
        // Human-readable logging for development
        const logMessage = `${new Date().toISOString()} [${requestId}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`;
        
        if (logLevel === 'error' || process.env.LOG_LEVEL === 'debug') {
          console.log(logMessage);
        }
      }
    });
    next();
  });
}

// Rate limiting middleware
app.use('/api/', rateLimiter(100, 60000)); // 100 requests per minute

// Health check endpoint (Railway compatible)
// Railway uses this endpoint to determine if the service is healthy
// Path: /health
// Expected response: 200 OK with JSON body
app.get('/health', async (req, res) => {
  try {
    // Test database connection with timeout
    const dbCheckPromise = prisma.$queryRaw`SELECT 1`;
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database health check timeout')), 5000)
    );
    
    await Promise.race([dbCheckPromise, timeoutPromise]);
    
    const wsStats = websocketService.getStats();
    
    // Get database pool stats (if available)
    const poolStats = {
      active: 'N/A', // Prisma doesn't expose pool stats directly
      idle: 'N/A',
      max: process.env.DATABASE_POOL_MAX || 10
    };
    
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      services: {
        database: {
          status: 'connected',
          pool: poolStats
        },
        ai: {
          status: process.env.GEMINI_API_KEY ? 'configured' : 'not_configured',
          model: process.env.AI_MODEL || 'gemini-1.5-flash'
        },
        ipfs: {
          status: process.env.IPFS_JWT ? 'configured' : 'not_configured',
          provider: 'pinata'
        },
        kyc: {
          status: process.env.ZKME_API_KEY ? 'configured' : 'not_configured',
          provider: 'zkme'
        },
        websocket: {
          status: 'connected',
          activeConnections: wsStats.totalConnections,
          activeEscrows: wsStats.activeEscrows
        }
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
      }
    });
  } catch (error) {
    console.error('❌ Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      environment: process.env.NODE_ENV || 'development'
    });
  }
});

// WebSocket stats endpoint (for debugging/monitoring)
app.get('/api/websocket/stats', (req, res) => {
  const stats = websocketService.getStats();
  res.json({
    success: true,
    stats
  });
});

// Load routes
(async () => {
  const zkmeRoutes = (await import('../routes/zkme.js')).default;
  const escrowRoutes = (await import('../routes/escrow.js')).default;
  const aiRoutes = (await import('../routes/ai.js')).default;
  const apiRoutes = (await import('../routes/api.js')).default;
  const userRoutes = (await import('../routes/user.js')).default;
  const chatRoutes = (await import('../routes/chat.js')).default;
  const ipfsRoutes = (await import('../routes/ipfs.js')).default;
  
  app.use('/api/zkme', zkmeRoutes);
  app.use('/api/escrow', escrowRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/ipfs', ipfsRoutes);
  app.use('/api', apiRoutes);
  
  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'Route not found'
    });
  });
  
  // Global error handler middleware (production-ready)
  app.use((err, req, res, next) => {
    // Log error with structured logging
    if (process.env.LOG_FORMAT === 'json') {
      console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'error',
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        error: err.message,
        stack: process.env.ENABLE_ERROR_STACK_TRACES === 'true' ? err.stack : undefined,
        statusCode: err.statusCode || 500
      }));
    } else {
      console.error('Error:', err);
    }
    
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    
    // Send error response
    res.status(statusCode).json({
      success: false,
      error: message,
      requestId: req.requestId,
      // Only include stack trace in development or if explicitly enabled
      ...(process.env.ENABLE_ERROR_STACK_TRACES === 'true' && { stack: err.stack }),
      timestamp: new Date().toISOString()
    });
  });
  
  httpServer.listen(PORT, () => {
    console.log(`🤖 AetherLock AI Agent running on port ${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/health`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔐 zkMe KYC enabled`);
    console.log(`🧠 AI verification ready`);
    console.log(`📸 IPFS storage configured`);
  });
})();

// Graceful shutdown handling for production
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  // Stop accepting new connections
  httpServer.close(async () => {
    console.log('✅ HTTP server closed');
    
    try {
      // Close WebSocket connections
      if (websocketService && websocketService.close) {
        await websocketService.close();
        console.log('✅ WebSocket connections closed');
      }
      
      // Disconnect from database
      await prisma.$disconnect();
      console.log('✅ Database disconnected');
      
      console.log('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('⚠️ Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});
