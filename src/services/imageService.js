import path from 'path';
import { logger } from '../utils/logger.js';
import fs from 'fs';

const uploadDir = path.resolve('uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  logger.info(`Created upload directory: ${uploadDir}`);
}

let hasBeenFetched = false;
let imageList = [];
let currentIndex = -1;

const addNewImage = (filename) => {
  hasBeenFetched = false;
  imageList.push(filename);
  currentIndex = imageList.length - 1;
  logger.info(`New image added: ${filename}`);
};

const fetchLastImagePath = () => {
  hasBeenFetched = true;
  return path.join(uploadDir, imageList.at(-1));
};

const getNextImagePath = () => {
  if (imageList.length === 0) throw new Error('No images available.');
  currentIndex = (currentIndex + 1) % imageList.length;
  logger.info(`Next image retrieved: ${imageList[currentIndex]}`);
  return path.join(uploadDir, imageList[currentIndex]);
};

const getPreviousImagePath = () => {
  if (imageList.length === 0) throw new Error('No images available.');
  currentIndex = (currentIndex - 1 + imageList.length) % imageList.length;
  logger.info(`Previous image retrieved: ${imageList[currentIndex]}`);
  return path.join(uploadDir, imageList[currentIndex]);
};

const getImageList = () => {
  return imageList;
};

const canFetchImage = () => !hasBeenFetched && imageList.length > 0;

export const imageService = {
  addNewImage,
  fetchLastImagePath,
  getNextImagePath,
  getPreviousImagePath,
  canFetchImage,
  getImageList,
};

export { uploadDir };
