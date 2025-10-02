import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters').optional(),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  profilePicture: z.string().url('Profile picture must be a valid URL').optional().or(z.literal('')),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(6, 'New password must be at least 6 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(100, 'Task title cannot exceed 100 characters'),
  description: z.string().max(500, 'Task description cannot exceed 500 characters').optional(),
  status: z.enum(['pending', 'in-progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().optional().or(z.literal('')),
  tags: z.array(z.string().max(20, 'Each tag cannot exceed 20 characters')).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(100, 'Task title cannot exceed 100 characters').optional(),
  description: z.string().max(500, 'Task description cannot exceed 500 characters').optional(),
  status: z.enum(['pending', 'in-progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().optional().or(z.literal('').or(z.null())),
  tags: z.array(z.string().max(20, 'Each tag cannot exceed 20 characters')).optional(),
});