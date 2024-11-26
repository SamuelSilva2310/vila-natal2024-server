import express from 'express';
import multer from 'multer';
import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Helpers for ES module paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const PORT = process.env.PORT || 8080;
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const PUBLIC_DIR = path.join(__dirname, path.resolve('public'));
const LOG_FILE = path.join(__dirname, 'server.log');

// Initialize Winston logger
const logBuffer = [];
const MAX_BUFFER_LOGS = 50;

// Custom transport to capture logs for debug endpoint
class InMemoryTransport extends winston.Transport {
  log(info, callback) {
    logBuffer.push(info);
    if (logBuffer.length > MAX_BUFFER_LOGS) {
      logBuffer.shift(); // Remove the oldest log
    }
    callback();
  }
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: LOG_FILE }),
    new InMemoryTransport(), // Capture logs for /debug
  ],
});

// Ensure the upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  logger.info(`Created upload directory: ${UPLOAD_DIR}`);
}

// Configure multer
const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

// Initialize the app
const app = express();

// Middleware
app.use(express.static(PUBLIC_DIR));

// Middleware to log all requests
app.use((req, res, next) => {
  const logMessage = `${req.method} ${req.originalUrl}`;
  logger.info(logMessage);
  next();
});

// In-memory store for image management
let hasBeenFetched = false;
let imageList = [];
let currentIndex = -1;

// Helper functions
function addNewImage(filename) {
  hasBeenFetched = false;
  imageList.push(filename);
  currentIndex = imageList.length - 1;
  logger.info(`New image added: ${filename}`);
}

function fetchLastImage() {
  hasBeenFetched = true;
  const filename = imageList.at(-1);
  logger.info(`Last image fetched: ${filename}`);
  return filename;
}

function isValidImageList() {
  return Array.isArray(imageList) && imageList.length > 0;
}

function canFetchImage() {
  const valid = !hasBeenFetched && isValidImageList();
  if (!valid) logger.warn('Cannot fetch image: Either already fetched or no images available.');
  return valid;
}

function handleError(res, statusCode, message) {
  logger.error(`Error: ${message} (Status Code: ${statusCode})`);
  res.status(statusCode).json({ error: message });
}

// Routes
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return handleError(res, 400, 'No file uploaded.');
  }

  addNewImage(req.file.filename);
  res.json({ message: 'File uploaded successfully.', filename: req.file.filename });
});

app.get('/fetch', (req, res) => {
  if (!canFetchImage()) {
    return handleError(res, 204, 'No image available.');
  }

  const filePath = path.join(UPLOAD_DIR, fetchLastImage());
  res.sendFile(filePath, (err) => {
    if (err) {
      handleError(res, 500, 'Error retrieving the file.');
    }
  });
});

app.get('/previous', (req, res) => {
  if (!isValidImageList()) {
    return handleError(res, 500, 'Invalid image list.');
  }

  currentIndex = currentIndex === 0 ? imageList.length - 1 : currentIndex - 1;
  const filePath = path.join(UPLOAD_DIR, imageList.at(currentIndex));
  logger.info(`Previous image retrieved: ${imageList.at(currentIndex)}`);

  res.sendFile(filePath, (err) => {
    if (err) {
      handleError(res, 500, 'Error retrieving the file.');
    }
  });
});

app.get('/next', (req, res) => {
  if (!isValidImageList()) {
    return handleError(res, 500, 'Invalid image list.');
  }

  currentIndex = currentIndex === imageList.length - 1 ? 0 : currentIndex + 1;
  const filePath = path.join(UPLOAD_DIR, imageList.at(currentIndex));
  logger.info(`Next image retrieved: ${imageList.at(currentIndex)}`);

  res.sendFile(filePath, (err) => {
    if (err) {
      handleError(res, 500, 'Error retrieving the file.');
    }
  });
});

// Debug endpoint
app.get('/debug', (req, res) => {
  const status = {
    currentIndex,
    imageList,
    hasBeenFetched,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    recentLogs: logBuffer, // Show captured logs
  };

  logger.info('Debug endpoint accessed.');
  res.json(status);
});

// 404 Fallback for undefined routes
app.use((req, res) => {
  handleError(res, 404, 'Route not found.');
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Server running at http://localhost:${PORT}`);
});
