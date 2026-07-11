import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error'],
  });
} else {
  // Prevent multiple instances of Prisma Client in development (hot-reload friendly)
  const globalWithPrisma = global as typeof globalThis & {
    prisma?: PrismaClient;
  };
  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = globalWithPrisma.prisma;
}

export async function testDbConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info('🐘 Database connection established successfully.');
    return true;
  } catch (error) {
    logger.error('❌ Failed to connect to the database:', error);
    return false;
  }
}

export { prisma };
