import { Request, Response } from 'express';
import { ProjectService } from '../../services/projects/projectService';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { ProjectSearchOptions } from '../../types/pagination';

export class ProjectController {
  private projectService: ProjectService;

  constructor() {
    this.projectService = new ProjectService();
  }

  // 获取所有项目
  async getAllProjects(req: Request, res: Response): Promise<void> {
    try {
      // 从认证用户获取userId
      if (!req.user) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      // 解析查询参数
      const options: ProjectSearchOptions = {
        page: parseInt(req.query.page as string) || 1,
        limit: Math.min(parseInt(req.query.limit as string) || 20, 100), // 最大100条
        search: req.query.search as string,
        visibility: req.query.visibility as 'PUBLIC' | 'PRIVATE',
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
      };

      const result = await this.projectService.getAllProjects(req.user.userId, options);

      ApiResponseUtil.success(
        res,
        result.data,
        '获取项目列表成功',
        200,
        req.context,
        result.pagination
      );
    } catch (error) {
      console.error('获取项目列表失败:', error);
      ApiResponseUtil.serverError(res, '获取项目列表失败', undefined, req.context);
    }
  }

  // 创建新项目
  async createProject(req: Request, res: Response): Promise<void> {
    try {
      const { name, visibility = 'PRIVATE', description, deadline } = req.body;

      // 从认证用户获取ownerId
      if (!req.user) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const project = await this.projectService.createProject({
        name,
        ownerId: req.user.userId,
        visibility,
        description,
        deadline: deadline ? new Date(deadline) : null
      });
      ApiResponseUtil.created(res, project, '创建项目成功', req.context);
    } catch (error) {
      ApiResponseUtil.serverError(res, '创建项目失败', undefined, req.context);
    }
  }

  // 获取单个项目
  async getProjectById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const project = await this.projectService.getProjectById(id);

      if (!project) {
        ApiResponseUtil.notFound(res, '项目不存在', req.context);
        return;
      }

      ApiResponseUtil.success(res, project, '获取项目成功', 200, req.context);
    } catch (error) {
      ApiResponseUtil.serverError(res, '获取项目失败', undefined, req.context);
    }
  }

  // 添加项目成员
  async addProjectMember(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { userId, role = 'VIEWER' } = req.body;

      // 验证用户认证
      if (!req.user) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      // 验证角色是否有效
      if (!['VIEWER', 'COLLABORATOR', 'MANAGER'].includes(role)) {
        ApiResponseUtil.badRequest(res, '无效的角色类型', undefined, req.context);
        return;
      }

      // 检查操作者权限（通过中间件已验证，这里再次确认）
      const canManage = await this.projectService.canManageMembers(req.user.userId, projectId);
      if (!canManage) {
        ApiResponseUtil.forbidden(res, '无权限管理项目成员', req.context);
        return;
      }

      const member = await this.projectService.addProjectMember(projectId, userId, role as 'VIEWER' | 'COLLABORATOR' | 'MANAGER');
      ApiResponseUtil.created(res, member, '添加项目成员成功', req.context);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('项目不存在') || error.message.includes('用户不存在')) {
          ApiResponseUtil.notFound(res, error.message, req.context);
        } else if (error.message.includes('已经是项目成员')) {
          ApiResponseUtil.badRequest(res, error.message, undefined, req.context);
        } else {
          ApiResponseUtil.serverError(res, '添加项目成员失败', undefined, req.context);
        }
      } else {
        ApiResponseUtil.serverError(res, '添加项目成员失败', undefined, req.context);
      }
    }
  }

  // 获取项目成员列表
  async getProjectMembers(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;

      // 验证用户认证
      if (!req.user) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      // 检查用户是否有权限访问项目
      const hasAccess = await this.projectService.canManageMembers(req.user.userId, projectId);
      if (!hasAccess) {
        ApiResponseUtil.forbidden(res, '无权限查看项目成员', req.context);
        return;
      }

      const members = await this.projectService.getProjectMembers(projectId);
      ApiResponseUtil.success(res, members, '获取项目成员成功', 200, req.context);
    } catch (error) {
      ApiResponseUtil.serverError(res, '获取项目成员失败', undefined, req.context);
    }
  }

  // 更新项目成员角色
  async updateProjectMemberRole(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, userId } = req.params;
      const { role } = req.body;

      // 验证用户认证
      if (!req.user) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      // 验证角色是否有效
      if (!['VIEWER', 'COLLABORATOR', 'MANAGER'].includes(role)) {
        ApiResponseUtil.badRequest(res, '无效的角色类型', undefined, req.context);
        return;
      }

      // 检查操作者权限
      const canManage = await this.projectService.canManageMembers(req.user.userId, projectId);
      if (!canManage) {
        ApiResponseUtil.forbidden(res, '无权限管理项目成员', req.context);
        return;
      }

      const member = await this.projectService.updateProjectMemberRole(projectId, userId, role as 'VIEWER' | 'COLLABORATOR' | 'MANAGER');
      ApiResponseUtil.success(res, member, '更新成员角色成功', 200, req.context);
    } catch (error) {
      ApiResponseUtil.serverError(res, '更新成员角色失败', undefined, req.context);
    }
  }

  // 移除项目成员
  async removeProjectMember(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, userId } = req.params;

      // 验证用户认证
      if (!req.user) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      // 检查操作者权限
      const canManage = await this.projectService.canManageMembers(req.user.userId, projectId);
      if (!canManage) {
        ApiResponseUtil.forbidden(res, '无权限管理项目成员', req.context);
        return;
      }

      await this.projectService.removeProjectMember(projectId, userId);
      ApiResponseUtil.success(res, null, '成员已移除', 200, req.context);
    } catch (error) {
      ApiResponseUtil.serverError(res, '移除成员失败', undefined, req.context);
    }
  }
}
