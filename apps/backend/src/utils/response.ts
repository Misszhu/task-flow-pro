import { Response } from 'express';
import { StandardResponse } from '@task-flow-pro/shared-types';

export class ResponseUtil {
  /**
   * 成功响应
   */
  static success<T>(res: Response, data: T, message: string = 'success', statusCode: number = 200): void {
    const response: StandardResponse<T> = {
      data,
      message,
      success: true,
      statusCode,
      timestamp: new Date().toISOString()
    };
    res.status(statusCode).json(response);
  }

  /**
   * 错误响应
   */
  static error(res: Response, message: string, statusCode: number = 400): void {
    const response: StandardResponse<null> = {
      data: null,
      message,
      success: false,
      statusCode,
      timestamp: new Date().toISOString()
    };
    res.status(statusCode).json(response);
  }

  /**
   * 创建成功响应
   */
  static created<T>(res: Response, data: T, message: string = 'created'): void {
    this.success(res, data, message, 201);
  }

  /**
   * 未找到响应
   */
  static notFound(res: Response, message: string = 'not found'): void {
    this.error(res, message, 404);
  }

  /**
   * 未授权响应
   */
  static unauthorized(res: Response, message: string = 'unauthorized'): void {
    this.error(res, message, 401);
  }

  /**
   * 禁止访问响应
   */
  static forbidden(res: Response, message: string = 'forbidden'): void {
    this.error(res, message, 403);
  }

  /**
   * 服务器错误响应
   */
  static serverError(res: Response, message: string = 'internal server error'): void {
    this.error(res, message, 500);
  }
}
