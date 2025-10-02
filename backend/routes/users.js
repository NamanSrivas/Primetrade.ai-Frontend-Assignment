const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const Task = require('../models/Task');

const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

// GET /api/users/me - Get current user profile (alias for auth/profile)
router.get('/me', async (req, res) => {
  try {
    res.json({
      message: 'User profile retrieved successfully',
      user: req.user
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      message: 'Server error retrieving user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'SERVER_ERROR'
    });
  }
});

// GET /api/users/stats - Get user statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get task statistics
    const taskStats = await Task.getUserTaskStats(userId);
    
    // Get additional user stats
    const totalTasks = await Task.countDocuments({ userId });
    const completedTasks = await Task.countDocuments({ userId, status: 'completed' });
    const overdueTasks = await Task.countDocuments({ 
      userId, 
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' }
    });
    
    // Calculate completion rate
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Get recent activity (last 7 days)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const recentTasks = await Task.countDocuments({ 
      userId, 
      createdAt: { $gte: lastWeek } 
    });
    
    const recentCompletions = await Task.countDocuments({ 
      userId, 
      completedAt: { $gte: lastWeek } 
    });

    res.json({
      message: 'User statistics retrieved successfully',
      stats: {
        tasks: taskStats,
        overview: {
          totalTasks,
          completedTasks,
          overdueTasks,
          completionRate,
          recentTasks,
          recentCompletions
        },
        user: {
          name: req.user.name,
          email: req.user.email,
          joinDate: req.user.createdAt,
          lastActive: new Date()
        }
      }
    });
    
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      message: 'Server error retrieving user statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'SERVER_ERROR'
    });
  }
});

// DELETE /api/users/me - Delete user account
router.delete('/me', async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Delete all user's tasks first
    await Task.deleteMany({ userId });
    
    // Delete the user account
    await User.findByIdAndDelete(userId);
    
    res.json({
      message: 'User account and all associated data deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete user account error:', error);
    res.status(500).json({
      message: 'Server error deleting user account',
      error: process.env.NODE_ENV === 'development' ? error.message : 'SERVER_ERROR'
    });
  }
});

module.exports = router;