import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth/authService';
import { ResponseUtil } from '../utils/response';
import { JwtPayload } from '@task-flow-pro/shared-types';

// 扩展Request接口以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * JWT认证中间件
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      ResponseUtil.unauthorized(res, '访问令牌缺失');
      return;
    }

    // 验证token
    const decoded = await AuthService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    ResponseUtil.forbidden(res, '无效的访问令牌');
  }
};

/**
 * 角色验证中间件
 */
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ResponseUtil.unauthorized(res, '未认证');
      return;
    }

    if (!roles.includes(req.user.role)) {
      ResponseUtil.forbidden(res, '权限不足');
      return;
    }

    next();
  };
};

/**
 * 可选认证中间件（不强制要求认证）
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = await AuthService.verifyToken(token);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // 可选认证失败时不抛出错误，继续执行
    next();
  }
};
