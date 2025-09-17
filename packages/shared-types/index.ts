// 任务优先级常量
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

// 任务状态常量
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// 用户角色常量
export const USER_ROLE = {
  ADMIN: 'admin',
  PROJECT_MANAGER: 'project_manager',
  USER: 'user',
} as const;

// API端点常量
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
  },
  USERS: '/api/users',
  PROJECTS: '/api/projects',
  TASKS: '/api/tasks',
} as const;

export type TaskPriority = typeof TASK_PRIORITY[keyof typeof TASK_PRIORITY];
export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];
export type UserRole = typeof USER_ROLE[keyof typeof USER_ROLE];
