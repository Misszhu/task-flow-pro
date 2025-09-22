// API 版本类型
export type ApiVersion = 'v1' | 'v2';

// 统一响应格式
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
  pagination?: PaginationInfo;
  meta?: ApiMeta;
  timestamp: string;
  version: ApiVersion;
}

// 分页信息
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// API 元数据
export interface ApiMeta {
  requestId?: string;
  processingTime?: number;
  cacheHit?: boolean;
  rateLimit?: RateLimitInfo;
}

// 限流信息
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// API 错误类型
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  field?: string;
  stack?: string;
}

// 错误代码枚举
export enum ErrorCode {
  // 认证错误
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',

  // 验证错误
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_FIELD = 'MISSING_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',

  // 资源错误
  NOT_FOUND = 'NOT_FOUND',
  RESOURCE_EXISTS = 'RESOURCE_EXISTS',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',

  // 权限错误
  INSUFFICIENT_PERMISSION = 'INSUFFICIENT_PERMISSION',
  ACCESS_DENIED = 'ACCESS_DENIED',

  // 业务错误
  BUSINESS_ERROR = 'BUSINESS_ERROR',
  OPERATION_FAILED = 'OPERATION_FAILED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',

  // 系统错误
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',

  // 限流错误
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',

  // 版本错误
  UNSUPPORTED_VERSION = 'UNSUPPORTED_VERSION',
  DEPRECATED_VERSION = 'DEPRECATED_VERSION'
}

// HTTP 状态码映射
export const HTTP_STATUS_MAP: Record<ErrorCode, number> = {
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.INVALID_TOKEN]: 401,
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.INVALID_INPUT]: 400,
  [ErrorCode.MISSING_FIELD]: 400,
  [ErrorCode.INVALID_FORMAT]: 400,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.RESOURCE_EXISTS]: 409,
  [ErrorCode.RESOURCE_CONFLICT]: 409,
  [ErrorCode.INSUFFICIENT_PERMISSION]: 403,
  [ErrorCode.ACCESS_DENIED]: 403,
  [ErrorCode.BUSINESS_ERROR]: 422,
  [ErrorCode.OPERATION_FAILED]: 422,
  [ErrorCode.QUOTA_EXCEEDED]: 429,
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.CACHE_ERROR]: 500,
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCode.TOO_MANY_REQUESTS]: 429,
  [ErrorCode.UNSUPPORTED_VERSION]: 400,
  [ErrorCode.DEPRECATED_VERSION]: 410
};

// 请求上下文
export interface RequestContext {
  requestId: string;
  userId?: string;
  version: ApiVersion;
  startTime: number;
  userAgent?: string;
  ip?: string;
}
