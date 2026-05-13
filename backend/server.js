import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/database.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ✅ PRODUCTION SAFETY: Validate required environment variables
const validateEnvironment = () => {
  const requiredVars = [
    'MONGODB_URI',
    'BCRYPT_ROUNDS',
  ];

  const tokenSecret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
  if (!tokenSecret) {
    requiredVars.push('ACCESS_TOKEN_SECRET');
  }

  const recommendedVars = [
    'CORS_ALLOWED_ORIGINS',
    'BREVO_API_KEY',
    'GENAI_API_KEY',
  ];

  const missingRequired = [];
  const missingRecommended = [];

  // Check required variables
  for (const variable of requiredVars) {
    if (!process.env[variable]) {
      missingRequired.push(variable);
    }
  }

  // Check recommended variables
  for (const variable of recommendedVars) {
    if (!process.env[variable]) {
      missingRecommended.push(variable);
    }
  }

  if (!process.env.BREVO_SENDER_EMAIL && !process.env.SMTP_FROM_EMAIL && !process.env.EMAIL_FROM) {
    missingRecommended.push('BREVO_SENDER_EMAIL (or SMTP_FROM_EMAIL)');
  }

  // Report missing required variables
  if (missingRequired.length > 0) {
    console.error(
      `\n❌ FATAL ERROR: Missing REQUIRED environment variables:\n   ${missingRequired.join(', ')}\n` +
      `   Check your .env file or environment configuration.\n`
    );
    process.exit(1);
  }

  // Report missing recommended variables
  if (NODE_ENV === 'production' && missingRecommended.length > 0) {
    console.warn(
      `\n⚠️  WARNING: Missing RECOMMENDED environment variables in production:\n   ${missingRecommended.join(', ')}\n` +
      `   These features may not work properly without configuration.\n`
    );
  }

  // CORS security check
  if (!process.env.CORS_ALLOWED_ORIGINS && !process.env.CORS_ORIGIN) {
    console.warn('\n⚠️  WARNING: CORS_ALLOWED_ORIGINS not configured. Requests may be blocked.');
    if (NODE_ENV === 'production') {
      console.error('❌ In production, CORS_ALLOWED_ORIGINS must be explicitly configured for security.');
      process.exit(1);
    }
  }

  console.log('✅ Environment validation passed');
};

// ✅ PRODUCTION SAFETY: Check seeding disabled
const checkSeedingStatus = () => {
  if (NODE_ENV === 'production') {
    console.log('✅ Seed data disabled in production mode');
  } else {
    console.log('ℹ️  Development mode - seed data can be run with: npm run seed');
  }
};

const startServer = async () => {
  try {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║           HRM REWARD SYSTEM - BACKEND SERVER              ║
║                  Starting Application...                  ║
╚════════════════════════════════════════════════════════════╝
    `);

    // Validate environment variables BEFORE database connection
    console.log('\n📋 Step 1: Validating configuration...');
    validateEnvironment();
    checkSeedingStatus();

    // Connect to database
    console.log('\n🔗 Step 2: Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Database connected successfully');

    // Start server
    console.log('\n🚀 Step 3: Starting HTTP server...');
    const server = app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                  ✅ SERVER RUNNING                         ║
╠════════════════════════════════════════════════════════════╣
║ Environment: ${NODE_ENV.toUpperCase().padEnd(40)}║
║ Port: ${PORT.toString().padEnd(48)}║
║ API Base URL: http://localhost:${PORT}/api/v1${' '.repeat(32 - PORT.toString().length)}║
║ Ready to accept requests                                  ║
╚════════════════════════════════════════════════════════════╝
      `);
    });

    // ✅ PRODUCTION SAFETY: Graceful shutdown
    const gracefulShutdown = (signal) => {
      return async () => {
        console.log(`\n⚠️  ${signal} received - starting graceful shutdown...`);
        server.close(() => {
          console.log('✅ HTTP server closed');
          process.exit(0);
        });

        // Force shutdown after 30 seconds if graceful shutdown fails
        setTimeout(() => {
          console.error('❌ Graceful shutdown timeout - forcing exit');
          process.exit(1);
        }, 30000);
      };
    };

    // Handle termination signals
    process.on('SIGTERM', gracefulShutdown('SIGTERM'));
    process.on('SIGINT', gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('\n❌ UNCAUGHT EXCEPTION:');
      console.error(error);
      console.error('\nServer is shutting down due to uncaught exception');
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('\n❌ UNHANDLED PROMISE REJECTION:');
      console.error('Promise:', promise);
      console.error('Reason:', reason);
      console.error('\nServer is shutting down due to unhandled rejection');
      process.exit(1);
    });
  } catch (error) {
    console.error('\n❌ SERVER STARTUP FAILED:');
    console.error(error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error('\nFull error:', error);
    }
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
