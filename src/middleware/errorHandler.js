import { logger } from '../utils/logger.js';

export const handleError = (res, statusCode, message) => {
  logger.error(`Error: ${message} (Status Code: ${statusCode})`);
  res.status(statusCode).json({ error: message });
};

export const handleNotFound = (req, res) => {
  handleError(res, 404, 'Route not found.');
};
