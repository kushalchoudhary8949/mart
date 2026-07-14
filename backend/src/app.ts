import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { config } from './config';
import { requestLogger } from './middlewares/requestLogger';
import { rateLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';
import { AppError } from './utils/AppError';
import { HTTP_STATUS } from './utils/constants';
import routes from './routes';

const app = express();

// Secure Express headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin(origin, callback) {
      const allowed = new Set([...config.cors.origin, 'http://localhost:3000', 'http://localhost:5173', 'http://localhost:5175']);
      callback(null, !origin || allowed.has(origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Morgan/Winston request logger
app.use(requestLogger);

// Rate limiter for security
app.use(rateLimiter);

// Compress responses
app.use(compression());

// Parse incoming request payloads
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Mount routes at versioned path (/api/v1)
app.use(`/api/${config.apiVersion}`, routes);

// Handle undefined routes (404)
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, HTTP_STATUS.NOT_FOUND));
});

// Centralized error handling
app.use(errorHandler);

export default app;
