import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ApiResponseUtil } from '../utils/apiResponse';
import { ErrorCode } from '../types/api';

/**
 * 增强的错误处理中间件
 */
export const enhancedErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 如果响应已经发送，直接返回
  if (res.headersSent) {
    return next(error);
  }

  console.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.context?.requestId,
    userId: req.user?.userId
  });

  // 处理不同类型的错误
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    handlePrismaError(error, req, res);
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    handlePrismaValidationError(error, req, res);
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    handlePrismaInitializationError(error, req, res);
  } else if (error instanceof Prisma.PrismaClientRustPanicError) {
    handlePrismaRustPanicError(error, req, res);
  } else if (error.name === 'ValidationError') {
    handleValidationError(error, req, res);
  } else if (error.name === 'CastError') {
    handleCastError(error, req, res);
  } else if (error.name === 'JsonWebTokenError') {
    handleJWTError(error, req, res);
  } else if (error.name === 'TokenExpiredError') {
    handleTokenExpiredError(error, req, res);
  } else if (error.name === 'MulterError') {
    handleMulterError(error, req, res);
  } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    handleNetworkError(error, req, res);
  } else if (error.code === 'LIMIT_FILE_SIZE') {
    handleFileSizeError(error, req, res);
  } else {
    handleGenericError(error, req, res);
  }
};

/**
 * 处理 Prisma 已知请求错误
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError, req: Request, res: Response): void {
  const { code, meta } = error;

  switch (code) {
    case 'P2002':
      // 唯一约束违反
      const field = meta?.target as string[];
      ApiResponseUtil.conflict(
        res,
        `Resource already exists${field ? ` with ${field.join(', ')}` : ''}`,
        { field, code },
        req.context
      );
      break;

    case 'P2025':
      // 记录未找到
      ApiResponseUtil.notFound(
        res,
        'Resource not found',
        req.context
      );
      break;

    case 'P2003':
      // 外键约束违反
      ApiResponseUtil.businessError(
        res,
        'Cannot perform operation due to related data constraints',
        { code, meta },
        req.context
      );
      break;

    case 'P2014':
      // 关系违反
      ApiResponseUtil.businessError(
        res,
        'Cannot perform operation due to relationship constraints',
        { code, meta },
        req.context
      );
      break;

    default:
      ApiResponseUtil.serverError(
        res,
        'Database operation failed',
        { code, meta },
        req.context
      );
  }
}

/**
 * 处理 Prisma 验证错误
 */
function handlePrismaValidationError(error: Prisma.PrismaClientValidationError, req: Request, res: Response): void {
  ApiResponseUtil.validationError(
    res,
    'Invalid data provided for database operation',
    { message: error.message },
    undefined,
    req.context
  );
}

/**
 * 处理 Prisma 初始化错误
 */
function handlePrismaInitializationError(error: Prisma.PrismaClientInitializationError, req: Request, res: Response): void {
  ApiResponseUtil.serverError(
    res,
    'Database connection failed',
    { code: error.errorCode },
    req.context
  );
}

/**
 * 处理 Prisma Rust Panic 错误
 */
function handlePrismaRustPanicError(error: Prisma.PrismaClientRustPanicError, req: Request, res: Response): void {
  ApiResponseUtil.serverError(
    res,
    'Database engine error',
    { message: error.message },
    req.context
  );
}

/**
 * 处理验证错误
 */
function handleValidationError(error: any, req: Request, res: Response): void {
  const details = error.details || error.errors;
  ApiResponseUtil.validationError(
    res,
    'Validation failed',
    details,
    undefined,
    req.context
  );
}

/**
 * 处理类型转换错误
 */
function handleCastError(error: any, req: Request, res: Response): void {
  ApiResponseUtil.badRequest(
    res,
    'Invalid data format',
    { field: error.path, value: error.value },
    req.context
  );
}

/**
 * 处理 JWT 错误
 */
function handleJWTError(error: any, req: Request, res: Response): void {
  ApiResponseUtil.unauthorized(
    res,
    'Invalid authentication token',
    req.context
  );
}

/**
 * 处理令牌过期错误
 */
function handleTokenExpiredError(error: any, req: Request, res: Response): void {
  ApiResponseUtil.error(
    res,
    ErrorCode.TOKEN_EXPIRED,
    'Authentication token has expired',
    { expiredAt: error.expiredAt },
    undefined,
    req.context
  );
}

/**
 * 处理文件上传错误
 */
function handleMulterError(error: any, req: Request, res: Response): void {
  let message = 'File upload error';
  let code = ErrorCode.VALIDATION_ERROR;

  switch (error.code) {
    case 'LIMIT_FILE_SIZE':
      message = 'File size too large';
      code = ErrorCode.QUOTA_EXCEEDED;
      break;
    case 'LIMIT_FILE_COUNT':
      message = 'Too many files uploaded';
      code = ErrorCode.QUOTA_EXCEEDED;
      break;
    case 'LIMIT_UNEXPECTED_FILE':
      message = 'Unexpected file field';
      break;
    case 'LIMIT_PART_COUNT':
      message = 'Too many parts in multipart request';
      break;
  }

  ApiResponseUtil.error(
    res,
    code,
    message,
    { field: error.field, code: error.code },
    undefined,
    req.context
  );
}

/**
 * 处理网络错误
 */
function handleNetworkError(error: any, req: Request, res: Response): void {
  ApiResponseUtil.serverError(
    res,
    'External service unavailable',
    { code: error.code, hostname: error.hostname },
    req.context
  );
}

/**
 * 处理文件大小错误
 */
function handleFileSizeError(error: any, req: Request, res: Response): void {
  ApiResponseUtil.quotaExceeded(
    res,
    'File size exceeds maximum allowed limit',
    { limit: error.limit, received: error.received },
    req.context
  );
}

/**
 * 处理通用错误
 */
function handleGenericError(error: any, req: Request, res: Response): void {
  // 根据错误状态码确定响应
  const statusCode = error.statusCode || error.status || 500;

  if (statusCode >= 400 && statusCode < 500) {
    ApiResponseUtil.badRequest(
      res,
      error.message || 'Bad request',
      { statusCode },
      req.context
    );
  } else {
    ApiResponseUtil.serverError(
      res,
      error.message || 'Internal server error',
      process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined,
      req.context
    );
  }
}

/**
 * 404 错误处理中间件
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  ApiResponseUtil.notFound(
    res,
    `Route ${req.method} ${req.path} not found`,
    req.context
  );
};

/**
 * 异步错误包装器
 * 用于包装异步路由处理函数，自动捕获错误
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};