'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { tasksApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import FiltersBar from '@/components/dashboard/FiltersBar';
import { generateInitials } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';
import type { Task, CreateTaskData, TaskFilters, TaskResponse } from '@/types';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const { show: showToast } = useToast();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [creatingTask, setCreatingTask] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>({ status: 'all', priority: 'all', search: '', page: 1, limit: 10, sort: '-createdAt' });
  const [pagination, setPagination] = useState<TaskResponse['pagination'] | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchTasks(filters);
    }
  }, [user, filters]);

  const fetchTasks = async (f: TaskFilters) => {
    setLoadingTasks(true);
    try {
      const response = await tasksApi.getTasks(f);
      setTasks(response.tasks);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoadingTasks(false);
    }
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    setCreatingTask(true);
    try {
      const taskData: CreateTaskData = {
        title: newTask.trim(),
        status: 'pending',
        priority: 'medium'
      };
      
      const response = await tasksApi.createTask(taskData);
      setTasks([response.task, ...tasks]);
      setNewTask('');
      showToast('Task created successfully', 'success');
    } catch (error) {
      console.error('Error creating task:', error);
      showToast('Failed to create task', 'error');
    } finally {
      setCreatingTask(false);
    }
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      const response = await tasksApi.updateTask(taskId, { status });
      setTasks(tasks.map(task => 
        task._id === taskId ? response.task : task
      ));
      showToast('Task updated', 'success');
    } catch (error) {
      console.error('Error updating task:', error);
      showToast('Failed to update task', 'error');
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await tasksApi.deleteTask(taskId);
      setTasks(tasks.filter(task => task._id !== taskId));
      showToast('Task deleted', 'success');
    } catch (error) {
      console.error('Error deleting task:', error);
      showToast('Failed to delete task', 'error');
    }
  };

  const confirmDelete = (taskId: string) => setConfirmDeleteId(taskId);
  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    await deleteTask(confirmDeleteId);
    setConfirmDeleteId(null);
  };

  const getStatusBadgeVariant = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'info';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getPriorityBadgeVariant = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-sm border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 gap-4">
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-lg">
                {generateInitials(user.name)}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome back, {user.name.split(' ')[0]}! 👋</h1>
                <p className="text-gray-600 text-sm sm:text-base">Ready to tackle your tasks today?</p>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-xs sm:text-sm text-gray-500">Logged in as</p>
                <p className="text-xs sm:text-sm font-medium text-gray-900">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button
                  onClick={() => router.push('/profile')}
                  variant="outline"
                  size="sm"
                  className="text-gray-700"
                >
                  Profile
                </Button>
                <Button
                  onClick={logout}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-800"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Tasks</p>
                  <p className="text-3xl font-bold">{tasks.length}</p>
                </div>
                <div className="h-12 w-12 bg-blue-400/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Completed</p>
                  <p className="text-3xl font-bold">{tasks.filter(t => t.status === 'completed').length}</p>
                </div>
                <div className="h-12 w-12 bg-green-400/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">In Progress</p>
                  <p className="text-3xl font-bold">{tasks.filter(t => t.status === 'in-progress').length}</p>
                </div>
                <div className="h-12 w-12 bg-orange-400/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Section */}
          <Card className="border-white/20 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Task Management</CardTitle>
              <CardDescription>Manage your tasks efficiently and stay productive</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="mb-6">
                <FiltersBar
                  initial={filters}
                  onChange={(f) => setFilters(f)}
                  onClear={() => setFilters({ status: 'all', priority: 'all', search: '', page: 1, limit: 10, sort: '-createdAt' })}
                />
              </div>

              {/* Add Task Form */}
              <form onSubmit={createTask} className="flex flex-col sm:flex-row gap-3 mb-6">
                <Input
                  type="text"
                  placeholder="Enter a new task..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  loading={creatingTask}
                  disabled={creatingTask || !newTask.trim()}
                  className="sm:w-40"
                >
                  Add Task
                </Button>
              </form>

              {/* Tasks List */}
              {loadingTasks ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6m8-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600">No tasks match your filters. Try adjusting search, status, or priority.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {tasks.map((task) => (
                    <div
                      key={task._id}
                      className="p-4 border border-gray-200 rounded-xl bg-white hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1 sm:pr-4">
                          <h4 className="font-semibold text-gray-900 mb-1 break-words">{task.title}</h4>
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <Badge variant={getStatusBadgeVariant(task.status)} className="capitalize">
                              {task.status.replace('-', ' ')}
                            </Badge>
                            <Badge variant={getPriorityBadgeVariant(task.priority)} className="capitalize">
                              {task.priority}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                          <select
                            value={task.status}
                            onChange={(e) => updateTaskStatus(task._id, e.target.value as Task['status'])}
                            className="w-full sm:w-auto text-sm border-2 border-gray-200 rounded-lg px-2 py-2 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                          
                          <Button
                            size="sm"
                            variant="danger"
                            className="w-full sm:w-auto"
                            onClick={() => confirmDelete(task._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination && (pagination.totalPages > 1) && (
                <div className="flex items-center justify-between mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasPrevPage}
                    onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, (f.page || 1) - 1) }))}
                  >
                    Previous
                  </Button>

                  <p className="text-sm text-gray-600">
                    Page {pagination.currentPage} of {pagination.totalPages} • {pagination.totalTasks} tasks
                  </p>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasNextPage}
                    onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Confirm Delete Dialog */}
          <ConfirmDialog
            open={!!confirmDeleteId}
            title="Delete task?"
            description="This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={handleConfirmDelete}
            onCancel={() => setConfirmDeleteId(null)}
          />
      </main>
    </div>
  );
}