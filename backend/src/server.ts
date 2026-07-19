import http from 'http';
import app from './app';
import { config } from './config';
import { logger } from './config/logger';
import { prisma, testDbConnection } from './config/database';
import { redis } from './config/redis';
import { initializeSocket } from './socket';


const server = http.createServer(app);
initializeSocket(server);

async function startServer() {
  logger.info('Starting Vrindawan Mart Backend Service...');

  // 1. Verify Database and Redis connectivity
  const dbStatus = await testDbConnection();
  const redisStatus = await redis.ping().then((res) => res === 'PONG').catch(() => false);

  if (!dbStatus) {
    logger.warn('⚠️ Starting server without an active Database connection. Queries will fail.');
  }
  if (!redisStatus) {
    logger.warn('⚠️ Starting server without an active Redis connection. Caching & Rate-Limiting will fail.');
  }

  // 2. Bind server to Port
  const port = config.port;
  server.listen(port, () => {
    logger.info(`⚡ Server is running on port ${port} in ${config.env} mode.`);
  });
}

// Handle unhandled Promise rejections and uncaught exceptions globally
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down...', err);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful Shutdown implementation
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed.');

    try {
      // Disconnect Prisma Client
      await prisma.$disconnect();
      logger.info('🐘 Database connection closed.');

      // Disconnect Redis Client
      await redis.quit();
      logger.info('🚀 Redis connection closed.');

      logger.info('👋 Graceful shutdown complete. Exiting process.');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 10s if graceful shutdown hangs
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();
