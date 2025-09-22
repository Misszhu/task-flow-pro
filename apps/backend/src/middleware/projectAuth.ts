import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response';
import { ProjectPermissionService } from '../services/projects/projectPermissionService';
import { MemberRole } from '@prisma/client';

// 扩展Request接口以包含项目权限信息
declare global {
  namespace Express {
    interface Request {
      projectAccess?: {
        hasAccess: boolean;
        role?: 'OWNER' | MemberRole;
        membership?: any;
        project?: any;
      };
    }
  }
}

/**
 * 项目访问权限中间件
 * 验证用户是否有权限访问指定项目
 */
export const requireProjectAccess = (requiredRole?: MemberRole) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        ResponseUtil.unauthorized(res, '用户未认证');
        return;
      }

      if (!projectId) {
        ResponseUtil.badRequest(res, '缺少项目ID参数');
        return;
      }

      const access = await ProjectPermissionService.checkProjectAccess(
        userId,
        projectId,
        requiredRole
      );

      if (!access.hasAccess) {
        ResponseUtil.forbidden(res, '无权限访问此项目');
        return;
      }

      // 将权限信息附加到请求对象
      req.projectAccess = access;
      next();
    } catch (error) {
      console.error('Project access middleware error:', error);
      ResponseUtil.serverError(res, '权限验证失败');
    }
  };
};

/**
 * 项目成员管理权限中间件
 * 验证用户是否可以管理项目成员
 */
export const requireMemberManagement = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      ResponseUtil.unauthorized(res, '用户未认证');
      return;
    }

    if (!projectId) {
      ResponseUtil.badRequest(res, '缺少项目ID参数');
      return;
    }

    const canManage = await ProjectPermissionService.canManageMembers(userId, projectId);

    if (!canManage) {
      ResponseUtil.forbidden(res, '无权限管理项目成员');
      return;
    }

    next();
  } catch (error) {
    console.error('Member management middleware error:', error);
    ResponseUtil.serverError(res, '权限验证失败');
  }
};

/**
 * 项目编辑权限中间件
 * 验证用户是否可以编辑项目
 */
export const requireProjectEdit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      ResponseUtil.unauthorized(res, '用户未认证');
      return;
    }

    if (!projectId) {
      ResponseUtil.badRequest(res, '缺少项目ID参数');
      return;
    }

    const canEdit = await ProjectPermissionService.canEditProject(userId, projectId);

    if (!canEdit) {
      ResponseUtil.forbidden(res, '无权限编辑此项目');
      return;
    }

    next();
  } catch (error) {
    console.error('Project edit middleware error:', error);
    ResponseUtil.serverError(res, '权限验证失败');
  }
};

/**
 * 项目删除权限中间件
 * 验证用户是否可以删除项目
 */
export const requireProjectDelete = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      ResponseUtil.unauthorized(res, '用户未认证');
      return;
    }

    if (!projectId) {
      ResponseUtil.badRequest(res, '缺少项目ID参数');
      return;
    }

    const canDelete = await ProjectPermissionService.canDeleteProject(userId, projectId);

    if (!canDelete) {
      ResponseUtil.forbidden(res, '无权限删除此项目');
      return;
    }

    next();
  } catch (error) {
    console.error('Project delete middleware error:', error);
    ResponseUtil.serverError(res, '权限验证失败');
  }
};
