import { logBuffer } from '../utils/logger.js';
import { imageService } from './imageService.js';

const getDebugInfo = () => {
  return {
    imageList: imageService.getImageList(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    recentLogs: logBuffer,
  };
};

export const debugService = { getDebugInfo };
