// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  profilePicture?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface UpdateProfileData {
  name?: string;
  bio?: string;
  profilePicture?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Task types
export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags: string[];
  userId: string | User;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  dueDate?: string;
  tags?: string[];
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  dueDate?: string | null;
  tags?: string[];
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface TaskStats {
  total: number;
  pending: number;
  'in-progress': number;
  completed: number;
}

export interface TaskResponse {
  message: string;
  tasks: Task[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalTasks: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  stats: TaskStats;
}

export interface UserStats {
  tasks: TaskStats;
  overview: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    completionRate: number;
    recentTasks: number;
    recentCompletions: number;
  };
  user: {
    name: string;
    email: string;
    joinDate: string;
    lastActive: string;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface ApiError {
  message: string;
  error?: string;
  status?: number;
}

// Component types
export interface LoadingState {
  loading: boolean;
  error: string | null;
}

export interface FormState extends LoadingState {
  success: boolean;
}