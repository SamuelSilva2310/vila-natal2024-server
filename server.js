import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Helpers for ES module paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const PORT = process.env.PORT || 8080;
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Ensure the upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
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

// In-memory store for the last uploaded file
let lastUploadedFile = null;

// Routes
// Upload an image
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  lastUploadedFile = req.file.filename;
  res.json({ message: 'File uploaded successfully.', filename: req.file.filename });
});

// Fetch the last uploaded image
app.get('/fetch', (req, res) => {
  if (!lastUploadedFile) {
    return res.status(404).json({ error: 'No image uploaded yet.' });
  }
  const filePath = path.join(UPLOAD_DIR, lastUploadedFile);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(500).json({ error: 'Error retrieving the file.' });
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
