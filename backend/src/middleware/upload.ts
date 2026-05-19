import multer from 'multer';
import path from 'path';

// Configure storage (memory storage for AI processing)
const storage = multer.memoryStorage();

// File filter - only images
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Multer upload configuration
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Single file upload middleware
export const uploadSingle = upload.single('photo');

// Multiple files upload (for delivery proof)
export const uploadMultiple = upload.array('photos', 5);