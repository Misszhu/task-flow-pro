import { Request, Response, NextFunction } from 'express';
import { ApiVersion, RequestContext } from '../types/api';
import { ApiResponseUtil } from '../utils/apiResponse';

// 扩展Request接口以包含版本信息
declare global {
  namespace Express {
    interface Request {
      version?: ApiVersion;
      context?: RequestContext;
    }
  }
}

/**
 * API版本控制中间件
 */
export const apiVersioning = (req: Request, res: Response, next: NextFunction): void => {
  // 从URL路径中提取版本信息
  const versionMatch = req.path.match(/^\/api\/(v\d+)\//);
  const versionFromPath = versionMatch ? versionMatch[1] as ApiVersion : null;

  // 从查询参数中获取版本
  const versionFromQuery = req.query.version as string;

  // 从请求头中获取版本
  const versionFromHeader = req.headers['api-version'] as string;

  // 确定API版本
  let apiVersion: ApiVersion = 'v1'; // 默认版本

  if (versionFromPath) {
    apiVersion = versionFromPath;
  } else if (versionFromQuery) {
    apiVersion = versionFromQuery as ApiVersion;
  } else if (versionFromHeader) {
    apiVersion = versionFromHeader as ApiVersion;
  }

  // 验证版本是否支持
  const supportedVersions: ApiVersion[] = ['v1', 'v2'];
  if (!supportedVersions.includes(apiVersion)) {
    ApiResponseUtil.unsupportedVersion(res, `Unsupported API version: ${apiVersion}`);
    return;
  }

  // 检查版本是否已废弃
  const deprecatedVersions: ApiVersion[] = []; // 当前没有废弃的版本
  if (deprecatedVersions.includes(apiVersion)) {
    ApiResponseUtil.deprecatedVersion(res, `API version ${apiVersion} is deprecated. Please upgrade to a newer version.`);
    return;
  }

  // 设置版本信息
  req.version = apiVersion;

  // 创建请求上下文
  req.context = {
    requestId: req.headers['x-request-id'] as string || generateRequestId(),
    userId: req.user?.userId,
    version: apiVersion,
    startTime: Date.now(),
    userAgent: req.headers['user-agent'],
    ip: req.ip || req.connection.remoteAddress
  };

  next();
};

/**
 * 版本路由中间件
 * 用于处理不同版本的API路由
 */
export const versionRouter = (version: ApiVersion) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // 如果请求的版本与当前路由版本不匹配，跳过
    if (req.version !== version) {
      next();
      return;
    }

    // 继续处理匹配版本的路由
    next();
  };
};

/**
 * 生成请求ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 版本兼容性中间件
 * 处理版本间的兼容性问题
 */
export const versionCompatibility = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.version) {
    next();
    return;
  }

  // 根据版本调整请求参数或行为
  switch (req.version) {
    case 'v1':
      // v1版本的特定处理
      handleV1Compatibility(req);
      break;
    case 'v2':
      // v2版本的特定处理
      handleV2Compatibility(req);
      break;
  }

  next();
};

/**
 * v1版本兼容性处理
 */
function handleV1Compatibility(req: Request): void {
  // v1版本的特殊处理逻辑
  // 例如：参数名称映射、默认值设置等
}

/**
 * v2版本兼容性处理
 */
function handleV2Compatibility(req: Request): void {
  // v2版本的特殊处理逻辑
  // 例如：新的参数验证、增强的功能等
}

/**
 * 版本信息中间件
 * 在响应中添加版本信息
 */
export const addVersionInfo = (req: Request, res: Response, next: NextFunction): void => {
  // 在响应头中添加版本信息
  res.setHeader('API-Version', req.version || 'v1');
  res.setHeader('X-Request-ID', req.context?.requestId || '');

  next();
};
