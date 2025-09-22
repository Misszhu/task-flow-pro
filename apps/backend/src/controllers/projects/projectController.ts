import { Request, Response } from 'express';
import { ProjectService } from '../../services/projects/projectService';
import { ResponseUtil } from '../../utils/response';

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
        ResponseUtil.unauthorized(res, '未认证');
        return;
      }

      const projects = await this.projectService.getAllProjects(req.user.userId);
      ResponseUtil.success(res, projects, '获取项目列表成功');
    } catch (error) {
      ResponseUtil.serverError(res, '获取项目列表失败');
    }
  }

  // 创建新项目
  async createProject(req: Request, res: Response): Promise<void> {
    try {
      const { name, visibility = 'PRIVATE', description, deadline } = req.body;

      // 从认证用户获取ownerId
      if (!req.user) {
        ResponseUtil.unauthorized(res, '未认证');
        return;
      }

      const project = await this.projectService.createProject({
        name,
        ownerId: req.user.userId,
        visibility,
        description,
        deadline: deadline ? new Date(deadline) : null
      });
      ResponseUtil.created(res, project, '创建项目成功');
    } catch (error) {
      ResponseUtil.serverError(res, '创建项目失败');
    }
  }

  // 获取单个项目
  async getProjectById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const project = await this.projectService.getProjectById(id);

      if (!project) {
        ResponseUtil.notFound(res, '项目不存在');
        return;
      }

      ResponseUtil.success(res, project, '获取项目成功');
    } catch (error) {
      ResponseUtil.serverError(res, '获取项目失败');
    }
  }

  // 添加项目成员
  async addProjectMember(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { userId, role = 'VIEWER' } = req.body;

      // 验证用户认证
      if (!req.user) {
        ResponseUtil.unauthorized(res, '未认证');
        return;
      }

      // 验证角色是否有效
      if (!['VIEWER', 'COLLABORATOR', 'MANAGER'].includes(role)) {
        ResponseUtil.badRequest(res, '无效的角色类型');
        return;
      }

      // 检查操作者权限（通过中间件已验证，这里再次确认）
      const canManage = await this.projectService.canManageMembers(req.user.userId, projectId);
      if (!canManage) {
        ResponseUtil.forbidden(res, '无权限管理项目成员');
        return;
      }

      const member = await this.projectService.addProjectMember(projectId, userId, role as 'VIEWER' | 'COLLABORATOR' | 'MANAGER');
      ResponseUtil.created(res, member, '添加项目成员成功');
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('项目不存在') || error.message.includes('用户不存在')) {
          ResponseUtil.notFound(res, error.message);
        } else if (error.message.includes('已经是项目成员')) {
          ResponseUtil.badRequest(res, error.message);
        } else {
          ResponseUtil.serverError(res, '添加项目成员失败');
        }
      } else {
        ResponseUtil.serverError(res, '添加项目成员失败');
      }
    }
  }

  // 获取项目成员列表
  async getProjectMembers(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;

      // 验证用户认证
      if (!req.user) {
        ResponseUtil.unauthorized(res, '未认证');
        return;
      }

      // 检查用户是否有权限访问项目
      const hasAccess = await this.projectService.canManageMembers(req.user.userId, projectId);
      if (!hasAccess) {
        ResponseUtil.forbidden(res, '无权限查看项目成员');
        return;
      }

      const members = await this.projectService.getProjectMembers(projectId);
      ResponseUtil.success(res, members, '获取项目成员成功');
    } catch (error) {
      ResponseUtil.serverError(res, '获取项目成员失败');
    }
  }

  // 更新项目成员角色
  async updateProjectMemberRole(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, userId } = req.params;
      const { role } = req.body;

      // 验证用户认证
      if (!req.user) {
        ResponseUtil.unauthorized(res, '未认证');
        return;
      }

      // 验证角色是否有效
      if (!['VIEWER', 'COLLABORATOR', 'MANAGER'].includes(role)) {
        ResponseUtil.badRequest(res, '无效的角色类型');
        return;
      }

      // 检查操作者权限
      const canManage = await this.projectService.canManageMembers(req.user.userId, projectId);
      if (!canManage) {
        ResponseUtil.forbidden(res, '无权限管理项目成员');
        return;
      }

      const member = await this.projectService.updateProjectMemberRole(projectId, userId, role as 'VIEWER' | 'COLLABORATOR' | 'MANAGER');
      ResponseUtil.success(res, member, '更新成员角色成功');
    } catch (error) {
      ResponseUtil.serverError(res, '更新成员角色失败');
    }
  }

  // 移除项目成员
  async removeProjectMember(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, userId } = req.params;

      // 验证用户认证
      if (!req.user) {
        ResponseUtil.unauthorized(res, '未认证');
        return;
      }

      // 检查操作者权限
      const canManage = await this.projectService.canManageMembers(req.user.userId, projectId);
      if (!canManage) {
        ResponseUtil.forbidden(res, '无权限管理项目成员');
        return;
      }

      await this.projectService.removeProjectMember(projectId, userId);
      ResponseUtil.success(res, null, '成员已移除');
    } catch (error) {
      ResponseUtil.serverError(res, '移除成员失败');
    }
  }
}
