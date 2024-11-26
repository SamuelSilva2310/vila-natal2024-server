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
let hasBeenFetched = false;
let imageList = [];
let currenIndex = -1


function newImage(filename){
  hasBeenFetched = false;
  imageList.push(filename)
  currenIndex = imageList.length - 1;
}

function fetchLastImage(filename){
  hasBeenFetched = true;
  return imageList.at(-1); //lastElement
}

function isValidImageList(){
  return Array.isArray(imageList) && imageList.length > 0;
}

function canFetchImage() {
  
  //const isValidIndex = typeof currentIndex === 'number' && currentIndex >= 0 && currentIndex < imageList.length;
  return !hasBeenFetched && isValidImageList();
}



app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  newImage(req.file.filename);
  res.json({ message: 'File uploaded successfully.', filename: req.file.filename });
});

// Fetch the last uploaded image
app.get('/fetch', (req, res) => {
  if (!canFetchImage()) {
    return res.status(204).json({ error: 'No image available' });
  }
  
  const filePath = path.join(UPLOAD_DIR, fetchLastImage());
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(500).json({ error: 'Error retrieving the file.' });
    }
  });
});


app.get('/previous', (req, res) => {
  if (!isValidImageList()) {
    return res.status(500).json({ error: 'Invalid image list' });
  }
  
  
  if(currenIndex == 0){ 
    currenIndex = imageList.length - 1;
  }else{
    currenIndex--;
  }
  
  const filePath = path.join(UPLOAD_DIR, imageList.at(currenIndex));
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(500).json({ error: 'Error retrieving the file.' });
    }
  });
});

app.get('/next', (req, res) => {
  if (!isValidImageList()) {
    return res.status(500).json({ error: 'Invalid image list' });
  }
  
  
  if(currenIndex == imageList.length - 1){
    currenIndex = 0;
  }else{
    currenIndex++;
  }

  const filePath = path.join(UPLOAD_DIR, imageList.at(currenIndex));

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
