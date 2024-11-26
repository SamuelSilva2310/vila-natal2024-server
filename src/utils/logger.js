import winston from 'winston';

const logBuffer = [];
const MAX_BUFFER_LOGS = 50;

// Custom in-memory transport for log buffering
class InMemoryTransport extends winston.Transport {
  log(info, callback) {
    logBuffer.push(info);
    if (logBuffer.length > MAX_BUFFER_LOGS) logBuffer.shift();
    callback();
  }
}

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'server.log' }),
    new InMemoryTransport(),
  ],
});

export { logBuffer }; // Export the log buffer for /debug
