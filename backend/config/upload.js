import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage for different image types
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine upload path based on route or file field name
    let uploadPath = 'uploads/images/';
    
    if (req.baseUrl.includes('profiles') || file.fieldname === 'profile') {
      uploadPath += 'profiles/';
    } else if (req.baseUrl.includes('courses') || file.fieldname === 'course') {
      uploadPath += 'courses/';
    } else if (req.baseUrl.includes('announcements') || file.fieldname === 'announcement') {
      uploadPath += 'announcements/';
    } else if (file.fieldname === 'document') {
      uploadPath += 'documents/';
    }
    
    cb(null, path.join(__dirname, '..', uploadPath));
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = file.originalname.replace(ext, '').replace(/\s+/g, '-');
    cb(null, name + '-' + uniqueSuffix + ext);
  }
});

// File filter to accept only images
const imageFilter = function (req, file, cb) {
  // Accept images only
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// File filter to accept images and documents
const fileFilter = function (req, file, cb) {
  // Accept images and common document types
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and documents are allowed!'));
  }
};

// Upload middleware for images only
export const uploadImage = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for images
  }
});

// Upload middleware for documents and images
export const uploadFile = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for documents
  }
});

// Single image upload
export const uploadSingleImage = uploadImage.single('image');

// Multiple images upload (max 5)
export const uploadMultipleImages = uploadImage.array('images', 5);

// Profile image upload
export const uploadProfileImage = uploadImage.single('profile');

// Course image upload
export const uploadCourseImage = uploadImage.single('course');

// Document upload
export const uploadDocument = uploadFile.single('document');

