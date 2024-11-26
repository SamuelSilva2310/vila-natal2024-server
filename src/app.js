import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './utils/logger.js';
import imageRoutes from './routes/imageRoutes.js';
import debugRoutes from './routes/debugRoutes.js';
import { requestLogger } from './middleware/requestLogger.js';
import { handleNotFound } from './middleware/errorHandler.js';

// ES module path helpers
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const PORT = process.env.PORT || 8080;
const PUBLIC_DIR = path.join(__dirname, 'public');

const app = express();

// Middleware
app.use(express.static(PUBLIC_DIR));
app.use(requestLogger);

// Routes
app.use('/api/image', imageRoutes);
app.use('/api/debug', debugRoutes);

// app.get('/', (req, res) => {
//   res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
// });

// Fallback for 404 errors
app.use(handleNotFound);

// Start the server
app.listen(PORT, () => {
  logger.info(`Server running at http://localhost:${PORT}`);
});
