import { Request, Response, NextFunction } from 'express';
import { ApiResponseUtil } from '../utils/apiResponse';
import { RequestContext } from '../types/api';

interface RateLimitConfig {
  windowMs: number; // 时间窗口（毫秒）
  max: number; // 最大请求数
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  public config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;

    // 定期清理过期的记录
    setInterval(() => {
      this.cleanup();
    }, this.config.windowMs);
  }

  /**
   * 检查是否超过限制
   */
  isLimitExceeded(key: string): boolean {
    const now = Date.now();
    const record = this.store[key];

    if (!record || now > record.resetTime) {
      // 创建新记录或重置过期记录
      this.store[key] = {
        count: 1,
        resetTime: now + this.config.windowMs
      };
      return false;
    }

    // 增加计数
    record.count++;
    return record.count > this.config.max;
  }

  /**
   * 获取剩余请求数
   */
  getRemainingRequests(key: string): number {
    const record = this.store[key];
    if (!record) {
      return this.config.max;
    }
    return Math.max(0, this.config.max - record.count);
  }

  /**
   * 获取重置时间
   */
  getResetTime(key: string): number {
    const record = this.store[key];
    return record ? record.resetTime : Date.now() + this.config.windowMs;
  }

  /**
   * 清理过期记录
   */
  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (now > this.store[key].resetTime) {
        delete this.store[key];
      }
    });
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const now = Date.now();
    const activeKeys = Object.keys(this.store).filter(key => now <= this.store[key].resetTime);

    return {
      totalKeys: activeKeys.length,
      windowMs: this.config.windowMs,
      maxRequests: this.config.max
    };
  }
}

// 创建不同的限流器实例
const rateLimiters = {
  // 全局限流：每分钟100次请求
  global: new RateLimiter({
    windowMs: 60 * 1000, // 1分钟
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    keyGenerator: (req) => `global:${req.ip}`
  }),

  // 认证限流：每分钟10次登录尝试
  auth: new RateLimiter({
    windowMs: 60 * 1000, // 1分钟
    max: 10,
    message: 'Too many authentication attempts, please try again later.',
    keyGenerator: (req) => `auth:${req.ip}`
  }),

  // 项目操作限流：每分钟50次请求
  projects: new RateLimiter({
    windowMs: 60 * 1000, // 1分钟
    max: 50,
    message: 'Too many project operations, please try again later.',
    keyGenerator: (req) => `projects:${req.user?.userId || req.ip}`
  }),

  // 任务操作限流：每分钟100次请求
  tasks: new RateLimiter({
    windowMs: 60 * 1000, // 1分钟
    max: 100,
    message: 'Too many task operations, please try again later.',
    keyGenerator: (req) => `tasks:${req.user?.userId || req.ip}`
  }),

  // 严格限流：每分钟5次请求（用于敏感操作）
  strict: new RateLimiter({
    windowMs: 60 * 1000, // 1分钟
    max: 5,
    message: 'Too many sensitive operations, please try again later.',
    keyGenerator: (req) => `strict:${req.user?.userId || req.ip}`
  })
};

/**
 * 通用限流中间件
 */
export const rateLimit = (limiterName: keyof typeof rateLimiters) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const limiter = rateLimiters[limiterName];
    const key = limiter.config.keyGenerator!(req);

    if (limiter.isLimitExceeded(key)) {
      const remaining = limiter.getRemainingRequests(key);
      const resetTime = limiter.getResetTime(key);
      const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

      // 设置限流响应头
      res.setHeader('X-RateLimit-Limit', limiter.config.max);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', new Date(resetTime).toISOString());
      res.setHeader('Retry-After', retryAfter);

      ApiResponseUtil.rateLimitExceeded(
        res,
        limiter.config.message || 'Rate limit exceeded',
        retryAfter,
        req.context
      );
      return;
    }

    // 设置限流信息到响应头
    const remaining = limiter.getRemainingRequests(key);
    const resetTime = limiter.getResetTime(key);

    res.setHeader('X-RateLimit-Limit', limiter.config.max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', new Date(resetTime).toISOString());

    next();
  };
};

/**
 * 全局限流中间件
 */
export const globalRateLimit = rateLimit('global');

/**
 * 认证限流中间件
 */
export const authRateLimit = rateLimit('auth');

/**
 * 项目操作限流中间件
 */
export const projectRateLimit = rateLimit('projects');

/**
 * 任务操作限流中间件
 */
export const taskRateLimit = rateLimit('tasks');

/**
 * 严格限流中间件
 */
export const strictRateLimit = rateLimit('strict');

/**
 * 动态限流中间件
 * 根据用户角色和操作类型动态调整限流策略
 */
export const dynamicRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  const userRole = req.user?.role;
  const path = req.path;

  // 根据用户角色调整限流策略
  let limiterName: keyof typeof rateLimiters = 'global';

  if (userRole === 'ADMIN') {
    // 管理员有更高的限制
    limiterName = 'projects';
  } else if (userRole === 'PROJECT_MANAGER') {
    // 项目经理中等限制
    limiterName = 'projects';
  } else {
    // 普通用户标准限制
    limiterName = 'global';
  }

  // 根据路径调整限流策略
  if (path.includes('/auth/')) {
    limiterName = 'auth';
  } else if (path.includes('/projects/')) {
    limiterName = 'projects';
  } else if (path.includes('/tasks/')) {
    limiterName = 'tasks';
  } else if (path.includes('/admin/') || path.includes('/cache/')) {
    limiterName = 'strict';
  }

  // 应用相应的限流策略
  rateLimit(limiterName)(req, res, next);
};

/**
 * 获取限流统计信息
 */
export const getRateLimitStats = () => {
  const stats: any = {};

  Object.keys(rateLimiters).forEach(key => {
    stats[key] = rateLimiters[key as keyof typeof rateLimiters].getStats();
  });

  return stats;
};
