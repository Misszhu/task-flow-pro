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
      const projects = await this.projectService.getAllProjects();
      ResponseUtil.success(res, projects, '获取项目列表成功');
    } catch (error) {
      ResponseUtil.serverError(res, '获取项目列表失败');
    }
  }

  // 创建新项目
  async createProject(req: Request, res: Response): Promise<void> {
    try {
      const { name, ownerId, visibility = 'PRIVATE', description, deadline } = req.body;
      const project = await this.projectService.createProject({
        name,
        ownerId,
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

      // 验证角色是否有效
      if (!['VIEWER', 'COLLABORATOR', 'MANAGER'].includes(role)) {
        res.status(400).json({ error: '无效的角色类型' });
        return;
      }

      const member = await this.projectService.addProjectMember(projectId, userId, role as 'VIEWER' | 'COLLABORATOR' | 'MANAGER');
      res.status(201).json(member);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('项目不存在') || error.message.includes('用户不存在')) {
          res.status(404).json({ error: error.message });
        } else if (error.message.includes('已经是项目成员')) {
          res.status(400).json({ error: error.message });
        } else {
          res.status(500).json({ error: '添加项目成员失败', details: error.message });
        }
      } else {
        res.status(500).json({ error: '添加项目成员失败', details: error });
      }
    }
  }

  // 获取项目成员列表
  async getProjectMembers(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const members = await this.projectService.getProjectMembers(projectId);
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: '获取项目成员失败', details: error });
    }
  }

  // 更新项目成员角色
  async updateProjectMemberRole(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, userId } = req.params;
      const { role } = req.body;

      // 验证角色是否有效
      if (!['VIEWER', 'COLLABORATOR', 'MANAGER'].includes(role)) {
        res.status(400).json({ error: '无效的角色类型' });
        return;
      }

      const member = await this.projectService.updateProjectMemberRole(projectId, userId, role as 'VIEWER' | 'COLLABORATOR' | 'MANAGER');
      res.json(member);
    } catch (error) {
      res.status(500).json({ error: '更新成员角色失败', details: error });
    }
  }

  // 移除项目成员
  async removeProjectMember(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, userId } = req.params;
      await this.projectService.removeProjectMember(projectId, userId);
      res.json({ message: '成员已移除' });
    } catch (error) {
      res.status(500).json({ error: '移除成员失败', details: error });
    }
  }
}
