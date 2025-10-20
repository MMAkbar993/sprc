import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Announcement from '../models/Announcement.js';

const router = express.Router();

// @route   GET /api/announcements
// @desc    Get announcements for current user based on role
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userRole = req.user.role;
    const { limit = 10 } = req.query;

    // Build query based on user role
    const query = { is_active: true };
    
    if (userRole === 'student') {
      query.target_audience = { $in: ['all', 'students'] };
    } else if (userRole === 'faculty') {
      query.target_audience = { $in: ['all', 'faculty'] };
    }
    // Admin can see all announcements

    const announcements = await Announcement.find(query)
      .populate('author_id', 'name email')
      .sort({ priority: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: { announcements }
    });

  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching announcements'
    });
  }
});

// @route   GET /api/announcements/:id
// @desc    Get specific announcement
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('author_id', 'name email')
      .lean();

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.json({
      success: true,
      data: { announcement }
    });

  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching announcement'
    });
  }
});

export default router;

