import { logger } from '../utils/logger.js';

export const requestLogger = (req, res, next) => {
  logger.info(`Incoming Request: ${req.method} ${req.originalUrl}`);
  next();
};
