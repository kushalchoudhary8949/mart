import { Request, Response } from 'express';
import { testDbConnection } from '../config/database';
import { pingRedis } from '../config/redis';
import { HTTP_STATUS } from '../utils/constants';

/**
 * GET /health
 * Performs system diagnostics on DB, Redis, and Memory usage
 */
export async function healthCheck(_req: Request, res: Response): Promise<void> {
  const dbConnected = await testDbConnection();
  const redisConnected = await pingRedis();

  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  const status = dbConnected ? 'UP' : 'DOWN';
  const statusCode = status === 'UP' ? HTTP_STATUS.OK : HTTP_STATUS.INTERNAL_SERVER_ERROR;

  res.status(statusCode).json({
    success: dbConnected,
    status,
    timestamp: new Date().toISOString(),
    services: {
      database: dbConnected ? 'connected' : 'disconnected',
      redis: redisConnected ? 'connected' : 'disconnected',
    },
    system: {
      uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      },
    },
  });
}
