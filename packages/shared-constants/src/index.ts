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

// 任务类型常量
export const TASK_TYPES = {
  FEATURE: 'feature',
  BUG: 'bug',
  IMPROVEMENT: 'improvement',
  DOCUMENTATION: 'documentation',
} as const;

// 项目状态常量
export const PROJECT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
} as const;

// 通知类型常量
export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: 'task_assigned',
  TASK_COMPLETED: 'task_completed',
  TASK_DUE_SOON: 'task_due_soon',
  PROJECT_UPDATED: 'project_updated',
  COMMENT_ADDED: 'comment_added',
} as const;

// 文件上传常量
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'],
} as const;

// 分页常量
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// 导出类型定义
export type TaskPriority = typeof TASK_PRIORITY[keyof typeof TASK_PRIORITY];
export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];
export type UserRole = typeof USER_ROLE[keyof typeof USER_ROLE];
export type TaskType = typeof TASK_TYPES[keyof typeof TASK_TYPES];
export type ProjectStatus = typeof PROJECT_STATUS[keyof typeof PROJECT_STATUS];
export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];
