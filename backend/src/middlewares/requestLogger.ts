import morgan from 'morgan';
import { logger } from '../config/logger';

// Morgan stream to direct Express request logs to Winston
const stream = {
  write: (message: string) => logger.info(message.trim()),
};

// Skip Morgan logging on test environment
const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'test';
};

// Morgan request logging middleware
export const requestLogger = morgan(
  ':remote-addr :method :url :status :res[content-length] - :response-time ms',
  { stream, skip }
);
