// API 配置文件
export const API_CONFIG = {
  // 基础 URL - 从环境变量读取
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',

  // API 版本
  API_VERSION: '/api',

  // 超时设置
  TIMEOUT: 30000,

  // 重试设置
  RETRY: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
  },

  // 请求头配置
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },

  // 环境信息
  ENV: process.env.REACT_APP_ENV || 'development',
  DEBUG: process.env.REACT_APP_DEBUG === 'true',
  LOG_LEVEL: process.env.REACT_APP_LOG_LEVEL || 'info',
} as const;

// API 端点配置
export const API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
  },

  // 健康检查
  HEALTH: {
    CHECK: '/health',
    DB_TEST: '/health/test-db',
  },

  // 项目管理
  PROJECTS: {
    LIST: '/projects',
    CREATE: '/projects',
    GET: (id: string) => `/projects/${id}`,
    UPDATE: (id: string) => `/projects/${id}`,
    DELETE: (id: string) => `/projects/${id}`,
    MEMBERS: (id: string) => `/projects/${id}/members`,
    ADD_MEMBER: (id: string) => `/projects/${id}/members`,
    UPDATE_MEMBER: (projectId: string, userId: string) => `/projects/${projectId}/members/${userId}`,
    REMOVE_MEMBER: (projectId: string, userId: string) => `/projects/${projectId}/members/${userId}`,
  },

  // 任务管理
  TASKS: {
    LIST: '/tasks',
    CREATE: '/tasks',
    GET: (id: string) => `/tasks/${id}`,
    UPDATE: (id: string) => `/tasks/${id}`,
    DELETE: (id: string) => `/tasks/${id}`,
    BY_PROJECT: (projectId: string) => `/tasks?projectId=${projectId}`,
  },

  // 用户管理
  USERS: {
    LIST: '/users',
    GET: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
  },
} as const;

// 环境配置
export const ENV_CONFIG = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
} as const;