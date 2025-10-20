import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
  uploadProfileImage, 
  uploadCourseImage, 
  uploadDocument,
  uploadMultipleImages 
} from '../config/upload.js';

const router = express.Router();

// @route   POST /api/upload/profile
// @desc    Upload profile image
// @access  Private
router.post('/profile', authenticateToken, (req, res) => {
  uploadProfileImage(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    // Get the file path that can be accessed via URL
    const fileUrl = `/uploads/images/profiles/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        filename: req.file.filename,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  });
});

// @route   POST /api/upload/course
// @desc    Upload course image
// @access  Private (Admin/Faculty)
router.post('/course', authenticateToken, (req, res) => {
  uploadCourseImage(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    const fileUrl = `/uploads/images/courses/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Course image uploaded successfully',
      data: {
        filename: req.file.filename,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  });
});

// @route   POST /api/upload/document
// @desc    Upload document
// @access  Private
router.post('/document', authenticateToken, (req, res) => {
  uploadDocument(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const fileUrl = `/uploads/images/documents/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        filename: req.file.filename,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  });
});

// @route   POST /api/upload/multiple
// @desc    Upload multiple images
// @access  Private
router.post('/multiple', authenticateToken, (req, res) => {
  uploadMultipleImages(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one image'
      });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      url: `/uploads/images/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype
    }));

    res.json({
      success: true,
      message: `${req.files.length} image(s) uploaded successfully`,
      data: {
        files: uploadedFiles
      }
    });
  });
});

export default router;

