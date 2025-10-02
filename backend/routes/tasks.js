const express = require('express');
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  bulkUpdateTasks
} = require('../controllers/taskController');

const router = express.Router();

// All task routes require authentication
router.use(authenticateToken);

// Validation rules
const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ max: 100 })
    .withMessage('Task title cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Task description cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be one of: pending, in-progress, completed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Each tag cannot exceed 20 characters')
];

const updateTaskValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Task title cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Task title cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Task description cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be one of: pending, in-progress, completed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
  body('dueDate')
    .optional()
    .custom((value) => {
      if (value === null || value === '') return true; // Allow null/empty to clear due date
      if (!new Date(value).getTime()) {
        throw new Error('Due date must be a valid date');
      }
      return true;
    }),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Each tag cannot exceed 20 characters')
];

const bulkUpdateValidation = [
  body('taskIds')
    .isArray({ min: 1 })
    .withMessage('Task IDs array is required and must not be empty'),
  body('taskIds.*')
    .isMongoId()
    .withMessage('Each task ID must be a valid MongoDB ObjectId'),
  body('operation')
    .isIn(['delete', 'status', 'priority'])
    .withMessage('Operation must be one of: delete, status, priority'),
  body('data.status')
    .if(body('operation').equals('status'))
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be one of: pending, in-progress, completed'),
  body('data.priority')
    .if(body('operation').equals('priority'))
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high')
];

// Routes

// GET /api/tasks - Get all tasks with filtering and pagination
router.get('/', getTasks);

// GET /api/tasks/:id - Get single task
router.get('/:id', getTask);

// POST /api/tasks - Create new task
router.post('/', createTaskValidation, createTask);

// PUT /api/tasks/:id - Update task
router.put('/:id', updateTaskValidation, updateTask);

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', deleteTask);

// POST /api/tasks/bulk - Bulk operations
router.post('/bulk', bulkUpdateValidation, bulkUpdateTasks);

module.exports = router;