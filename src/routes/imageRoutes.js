import express from 'express';
import multer from 'multer';
import { uploadDir, imageService } from '../services/imageService.js';
import { handleError } from '../middleware/errorHandler.js';

const router = express.Router();

// Configure multer
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

// Routes
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return handleError(res, 400, 'No file uploaded.');
  }

  imageService.addNewImage(req.file.filename);
  res.json({ message: 'File uploaded successfully.', filename: req.file.filename });
});

router.get('/fetch', (req, res) => {
  if (!imageService.canFetchImage()) {
    return handleError(res, 204, 'No image available.');
  }

  const filePath = imageService.fetchLastImagePath();
  const orientation = imageService.getImageOrientation(filePath);
  
  res.setHeader("X-ImageOrientation-EXIF", orientation);
  res.sendFile(filePath, (err) => {
    if (err) handleError(res, 500, 'Error retrieving the file.');
  });
});

router.get('/previous', (req, res) => {
  try {
    const filePath = imageService.getPreviousImagePath();
    res.sendFile(filePath);
  } catch (err) {
    handleError(res, 500, err.message);
  }
});

router.get('/next', (req, res) => {
  try {
    const filePath = imageService.getNextImagePath();
    res.sendFile(filePath);
  } catch (err) {
    handleError(res, 500, err.message);
  }
});

export default router;
