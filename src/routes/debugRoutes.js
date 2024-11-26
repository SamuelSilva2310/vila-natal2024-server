import express from 'express';
import { debugService } from '../services/debugService.js';

const router = express.Router();

router.get('/', (req, res) => {
  const status = debugService.getDebugInfo();

  // Use JSON.stringify with indentation for pretty printing
  res.setHeader('Content-Type', 'application/json'); // Optional, ensures JSON format
  res.send(JSON.stringify(status, null, 2)); // Pretty print with 2 spaces
});

export default router;