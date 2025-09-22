import { Response } from 'express';
import { ApiResponse, ErrorCode, HTTP_STATUS_MAP, ApiVersion, PaginationInfo, ApiMeta, RequestContext } from '../types/api';
import { v4 as uuidv4 } from 'uuid';

export class ApiResponseUtil {
  private static getCurrentVersion(): ApiVersion {
    return 'v1'; // 默认版本，可以从环境变量或配置中获取
  }

  private static generateRequestId(): string {
    return uuidv4();
  }

  private static getTimestamp(): string {
    return new Date().toISOString();
  }

  private static getProcessingTime(startTime: number): number {
    return Date.now() - startTime;
  }

  /**
   * 成功响应
   */
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200,
    context?: RequestContext,
    pagination?: PaginationInfo,
    meta?: Partial<ApiMeta>
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      pagination,
      meta: {
        requestId: context?.requestId || this.generateRequestId(),
        processingTime: context ? this.getProcessingTime(context.startTime) : undefined,
        ...meta
      },
      timestamp: this.getTimestamp(),
      version: this.getCurrentVersion()
    };

    res.status(statusCode).json(response);
  }

  /**
   * 创建成功响应
   */
  static created<T>(
    res: Response,
    data: T,
    message: string = 'Created successfully',
    context?: RequestContext
  ): void {
    this.success(res, data, message, 201, context);
  }

  /**
   * 错误响应
   */
  static error(
    res: Response,
    errorCode: ErrorCode,
    message: string,
    details?: any,
    field?: string,
    context?: RequestContext,
    statusCode?: number
  ): void {
    const httpStatus = statusCode || HTTP_STATUS_MAP[errorCode];

    const response: ApiResponse = {
      success: false,
      error: {
        code: errorCode,
        message,
        details,
        field,
        stack: process.env.NODE_ENV === 'development' ? new Error().stack : undefined
      },
      meta: {
        requestId: context?.requestId || this.generateRequestId(),
        processingTime: context ? this.getProcessingTime(context.startTime) : undefined
      },
      timestamp: this.getTimestamp(),
      version: this.getCurrentVersion()
    };

    res.status(httpStatus).json(response);
  }

  /**
   * 验证错误响应
   */
  static validationError(
    res: Response,
    message: string = 'Validation failed',
    details?: any,
    field?: string,
    context?: RequestContext
  ): void {
    this.error(res, ErrorCode.VALIDATION_ERROR, message, details, field, context);
  }

  /**
   * 未找到响应
   */
  static notFound(
    res: Response,
    message: string = 'Resource not found',
    context?: RequestContext
  ): void {
    this.error(res, ErrorCode.NOT_FOUND, message, undefined, undefined, context);
  }

  /**
   * 未授权响应
   */
  static unauthorized(
    res: Response,
    message: string = 'Unauthorized',
    context?: RequestContext
  ): void {
    this.error(res, ErrorCode.UNAUTHORIZED, message, undefined, undefined, context);
  }

  /**
   * 禁止访问响应
   */
  static forbidden(
    res: Response,
    message: string = 'Forbidden',
    context?: RequestContext
  ): void {
    this.error(res, ErrorCode.FORBIDDEN, message, undefined, undefined, context);
  }

  /**
   * 权限不足响应
   */
  static insufficientPermission(
    res: Response,
    message: string = 'Insufficient permission',
    context?: RequestContext
  ): void {
    this.error(res, ErrorCode.INSUFFICIENT_PERMISSION, message, undefined, undefined, context);
  }

  /**
   * 请求参数错误响应
   */
  static badRequest(
    res: Response,
    message: string = 'Bad request',
    details?: any,
    context?: RequestContext
  ): void {
    this.error(res, ErrorCode.INVALID_INPUT, message, details, undefined, context);
  }

  /**
   * 服务器错误响应
   */
  static serverError(
    res: Response,
    message: string = 'Internal server error',
    details?: any,
    context?: RequestContext
  ): void {
    this.error(res, ErrorCode.INTERNAL_ERROR, message, details, undefined, context);
  }

  /**
   * 限流错误响应
   */
  static rateLimitExceeded(
    res: Response,
    message: string = 'Rate limit exceeded',
    retryAfter?: number,
    context?: RequestContext
  ): void {
    const response: ApiResponse = {
      success: false,
      error: {
        code: ErrorCode.RATE_LIMIT_EXCEEDED,
        message,
        details: retryAfter ? { retryAfter } : undefined
      },
      meta: {
        requestId: context?.requestId || this.generateRequestId(),
        processingTime: context ? this.getProcessingTime(context.startTime) : undefined,
        rateLimit: retryAfter ? { limit: 0, remaining: 0, resetTime: Date.now() + retryAfter * 1000, retryAfter } : undefined
      },
      timestamp: this.getTimestamp(),
      version: this.getCurrentVersion()
    };

    res.status(429).json(response);
  }

  /**
   * 版本不支持响应
   */
  static unsupportedVersion(
    res: Response,
    message: string = 'Unsupported API version',
    context?: RequestContext
  ): void {
    this.error(res, ErrorCode.UNSUPPORTED_VERSION, message, undefined, undefined, context);
  }

  /**
   * 版本已废弃响应
   */
  static deprecatedVersion(
    res: Response,
    message: string = 'API version is deprecated',
    context?: RequestContext
  ): void {
    this.error(res, ErrorCode.DEPRECATED_VERSION, message, undefined, undefined, context, 410);
  }

  /**
   * 业务错误响应
   */
  static businessError(
    res: Response,
    message: string,
    details?: any,
    context?: RequestContext
  ): void {
    this.error(res, ErrorCode.BUSINESS_ERROR, message, details, undefined, context);
  }

  /**
   * 资源冲突响应
   */
  static conflict(
    res: Response,
    message: string = 'Resource conflict',
    details?: any,
    context?: RequestContext
  ): void {
    this.error(res, ErrorCode.RESOURCE_CONFLICT, message, details, undefined, context);
  }

  /**
   * 配额超限响应
   */
  static quotaExceeded(
    res: Response,
    message: string = 'Quota exceeded',
    details?: any,
    context?: RequestContext
  ): void {
    this.error(res, ErrorCode.QUOTA_EXCEEDED, message, details, undefined, context);
  }
}
