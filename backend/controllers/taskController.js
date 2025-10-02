const { validationResult } = require('express-validator');
const Task = require('../models/Task');

// Get all tasks for the authenticated user
const getTasks = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, search, sort = '-createdAt' } = req.query;
    const userId = req.user._id;

    // Build query
    let query = { userId };

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by priority
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const tasks = await Task.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'name email');

    // Get total count for pagination
    const total = await Task.countDocuments(query);

    // Get task statistics
    const stats = await Task.getUserTaskStats(userId);

    res.json({
      message: 'Tasks retrieved successfully',
      tasks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalTasks: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      },
      stats
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      message: 'Server error retrieving tasks',
      error: process.env.NODE_ENV === 'development' ? error.message : 'SERVER_ERROR'
    });
  }
};

// Get single task by ID
const getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const task = await Task.findOne({ _id: id, userId }).populate('userId', 'name email');

    if (!task) {
      return res.status(404).json({
        message: 'Task not found',
        error: 'TASK_NOT_FOUND'
      });
    }

    res.json({
      message: 'Task retrieved successfully',
      task
    });

  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      message: 'Server error retrieving task',
      error: process.env.NODE_ENV === 'development' ? error.message : 'SERVER_ERROR'
    });
  }
};

// Create new task
const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, status, priority, dueDate, tags } = req.body;
    const userId = req.user._id;

    const task = new Task({
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags: tags || [],
      userId
    });

    await task.save();
    await task.populate('userId', 'name email');

    res.status(201).json({
      message: 'Task created successfully',
      task
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      message: 'Server error creating task',
      error: process.env.NODE_ENV === 'development' ? error.message : 'SERVER_ERROR'
    });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { title, description, status, priority, dueDate, tags } = req.body;
    const userId = req.user._id;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (tags !== undefined) updateData.tags = tags;

    const task = await Task.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    if (!task) {
      return res.status(404).json({
        message: 'Task not found',
        error: 'TASK_NOT_FOUND'
      });
    }

    res.json({
      message: 'Task updated successfully',
      task
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      message: 'Server error updating task',
      error: process.env.NODE_ENV === 'development' ? error.message : 'SERVER_ERROR'
    });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const task = await Task.findOneAndDelete({ _id: id, userId });

    if (!task) {
      return res.status(404).json({
        message: 'Task not found',
        error: 'TASK_NOT_FOUND'
      });
    }

    res.json({
      message: 'Task deleted successfully',
      task: { _id: task._id, title: task.title }
    });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      message: 'Server error deleting task',
      error: process.env.NODE_ENV === 'development' ? error.message : 'SERVER_ERROR'
    });
  }
};

// Bulk operations
const bulkUpdateTasks = async (req, res) => {
  try {
    const { taskIds, operation, data } = req.body;
    const userId = req.user._id;

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({
        message: 'Task IDs array is required',
        error: 'INVALID_TASK_IDS'
      });
    }

    let result;
    
    switch (operation) {
      case 'delete':
        result = await Task.deleteMany({ _id: { $in: taskIds }, userId });
        break;
      case 'status':
        if (!data.status) {
          return res.status(400).json({
            message: 'Status is required for bulk status update',
            error: 'MISSING_STATUS'
          });
        }
        result = await Task.updateMany(
          { _id: { $in: taskIds }, userId },
          { status: data.status }
        );
        break;
      case 'priority':
        if (!data.priority) {
          return res.status(400).json({
            message: 'Priority is required for bulk priority update',
            error: 'MISSING_PRIORITY'
          });
        }
        result = await Task.updateMany(
          { _id: { $in: taskIds }, userId },
          { priority: data.priority }
        );
        break;
      default:
        return res.status(400).json({
          message: 'Invalid bulk operation',
          error: 'INVALID_OPERATION'
        });
    }

    res.json({
      message: `Bulk ${operation} operation completed`,
      modifiedCount: result.modifiedCount || result.deletedCount,
      operation,
      taskIds
    });

  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({
      message: 'Server error during bulk operation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'SERVER_ERROR'
    });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  bulkUpdateTasks
};