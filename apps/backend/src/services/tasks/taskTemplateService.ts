import { PrismaClient } from '@prisma/client';
import {
  CreateTaskTemplateRequest,
  UpdateTaskTemplateRequest,
  TaskTemplate,
  TaskTemplateFilters,
  PaginatedResponse,
  PaginationParams
} from '@task-flow-pro/shared-types';

const prisma = new PrismaClient();

export class TaskTemplateService {
  /**
   * 创建任务模板
   */
  static async createTemplate(
    data: CreateTaskTemplateRequest,
    userId: string
  ): Promise<TaskTemplate> {
    const template = await prisma.taskTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        title: data.title,
        content: data.content,
        isPublic: data.isPublic || false,
        createdBy: userId
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });

    return template as unknown as TaskTemplate;
  }

  /**
   * 获取模板列表
   */
  static async getTemplates(
    filters: TaskTemplateFilters = {},
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<TaskTemplate>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};

    if (filters.name) {
      where.name = {
        contains: filters.name,
        mode: 'insensitive'
      };
    }

    if (filters.isPublic !== undefined) {
      where.isPublic = filters.isPublic;
    }

    if (filters.createdBy) {
      where.createdBy = filters.createdBy;
    }

    // 获取总数
    const total = await prisma.taskTemplate.count({ where });

    // 获取模板列表
    const templates = await prisma.taskTemplate.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });

    return {
      data: templates as unknown as TaskTemplate[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 获取单个模板
   */
  static async getTemplateById(templateId: string): Promise<TaskTemplate | null> {
    const template = await prisma.taskTemplate.findUnique({
      where: { id: templateId },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });

    return template as unknown as TaskTemplate | null;
  }

  /**
   * 更新模板
   */
  static async updateTemplate(
    templateId: string,
    data: UpdateTaskTemplateRequest,
    userId: string
  ): Promise<TaskTemplate> {
    // 检查权限
    const template = await prisma.taskTemplate.findUnique({
      where: { id: templateId },
      select: { createdBy: true }
    });

    if (!template) {
      throw new Error('模板不存在');
    }

    if (template.createdBy !== userId) {
      throw new Error('无权编辑此模板');
    }

    const updatedTemplate = await prisma.taskTemplate.update({
      where: { id: templateId },
      data: {
        name: data.name,
        description: data.description,
        title: data.title,
        content: data.content,
        isPublic: data.isPublic
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });

    return updatedTemplate as unknown as TaskTemplate;
  }

  /**
   * 删除模板
   */
  static async deleteTemplate(templateId: string, userId: string): Promise<void> {
    // 检查权限
    const template = await prisma.taskTemplate.findUnique({
      where: { id: templateId },
      select: { createdBy: true }
    });

    if (!template) {
      throw new Error('模板不存在');
    }

    if (template.createdBy !== userId) {
      throw new Error('无权删除此模板');
    }

    await prisma.taskTemplate.delete({
      where: { id: templateId }
    });
  }

  /**
   * 从模板创建任务
   */
  static async createTaskFromTemplate(
    templateId: string,
    userId: string,
    overrides: Partial<{
      title: string;
      description: string;
      priority: string;
      assigneeId: string;
      projectId: string;
      dueDate: Date;
    }> = {}
  ): Promise<any> {
    const template = await this.getTemplateById(templateId);
    if (!template) {
      throw new Error('模板不存在');
    }

    // 解析模板内容
    let templateData: any = {};
    if (template.content) {
      try {
        templateData = JSON.parse(template.content);
      } catch (error) {
        console.warn('模板内容解析失败:', error);
      }
    }

    // 合并模板数据和覆盖数据
    const taskData = {
      title: overrides.title || template.title,
      description: overrides.description || templateData.description || '',
      priority: overrides.priority || templateData.priority || 'MEDIUM',
      assigneeId: overrides.assigneeId || templateData.assigneeId,
      projectId: overrides.projectId || templateData.projectId,
      dueDate: overrides.dueDate || templateData.dueDate
    };

    // 这里应该调用TaskService.createTask，但为了避免循环依赖，返回任务数据
    return taskData;
  }

  /**
   * 获取公共模板
   */
  static async getPublicTemplates(
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<TaskTemplate>> {
    return this.getTemplates({ isPublic: true }, pagination);
  }

  /**
   * 获取用户的模板
   */
  static async getUserTemplates(
    userId: string,
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<TaskTemplate>> {
    return this.getTemplates({ createdBy: userId }, pagination);
  }

  /**
   * 搜索模板
   */
  static async searchTemplates(
    query: string,
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<TaskTemplate>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { description: { contains: query, mode: 'insensitive' as const } },
        { title: { contains: query, mode: 'insensitive' as const } }
      ]
    };

    const total = await prisma.taskTemplate.count({ where });

    const templates = await prisma.taskTemplate.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });

    return {
      data: templates as unknown as TaskTemplate[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 复制模板
   */
  static async copyTemplate(
    templateId: string,
    userId: string,
    newName?: string
  ): Promise<TaskTemplate> {
    const originalTemplate = await this.getTemplateById(templateId);
    if (!originalTemplate) {
      throw new Error('模板不存在');
    }

    const templateData: CreateTaskTemplateRequest = {
      name: newName || `${originalTemplate.name} (副本)`,
      description: originalTemplate.description,
      title: originalTemplate.title,
      content: originalTemplate.content,
      isPublic: false // 复制的模板默认为私有
    };

    return this.createTemplate(templateData, userId);
  }
}
