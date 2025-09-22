import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateTaskTemplateData {
  name: string;
  description?: string;
  title: string;
  content?: string;
  isPublic?: boolean;
  createdBy: string;
}

export interface UpdateTaskTemplateData {
  name?: string;
  description?: string;
  title?: string;
  content?: string;
  isPublic?: boolean;
}

export interface TaskTemplateFilters {
  isPublic?: boolean;
  createdBy?: string;
  search?: string;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  title: string;
  content?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  creator: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateTaskFromTemplateData {
  templateId: string;
  projectId?: string;
  assigneeId?: string;
  customizations?: {
    title?: string;
    description?: string;
    priority?: string;
    dueDate?: Date;
  };
}

export class TaskTemplateService {
  /**
   * 创建任务模板
   */
  static async createTemplate(data: CreateTaskTemplateData): Promise<TaskTemplate> {
    const template = await prisma.taskTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        title: data.title,
        content: data.content,
        isPublic: data.isPublic || false,
        createdBy: data.createdBy
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return template as unknown as TaskTemplate;
  }

  /**
   * 获取任务模板列表
   */
  static async getTemplates(
    filters: TaskTemplateFilters = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<{ data: TaskTemplate[]; total: number; pagination: any }> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};

    if (filters.isPublic !== undefined) {
      where.isPublic = filters.isPublic;
    }

    if (filters.createdBy) {
      where.createdBy = filters.createdBy;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { title: { contains: filters.search, mode: 'insensitive' } }
      ];
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
            name: true,
            email: true
          }
        }
      }
    });

    return {
      data: templates as unknown as TaskTemplate[],
      total,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 获取单个任务模板
   */
  static async getTemplateById(templateId: string): Promise<TaskTemplate> {
    const template = await prisma.taskTemplate.findUnique({
      where: { id: templateId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!template) {
      throw new Error('任务模板不存在');
    }

    return template as unknown as TaskTemplate;
  }

  /**
   * 更新任务模板
   */
  static async updateTemplate(
    templateId: string,
    data: UpdateTaskTemplateData,
    userId: string
  ): Promise<TaskTemplate> {
    // 检查模板是否存在和权限
    const existingTemplate = await prisma.taskTemplate.findUnique({
      where: { id: templateId },
      select: { createdBy: true }
    });

    if (!existingTemplate) {
      throw new Error('任务模板不存在');
    }

    if (existingTemplate.createdBy !== userId) {
      throw new Error('无权修改此任务模板');
    }

    const template = await prisma.taskTemplate.update({
      where: { id: templateId },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return template as unknown as TaskTemplate;
  }

  /**
   * 删除任务模板
   */
  static async deleteTemplate(templateId: string, userId: string): Promise<void> {
    // 检查模板是否存在和权限
    const existingTemplate = await prisma.taskTemplate.findUnique({
      where: { id: templateId },
      select: { createdBy: true }
    });

    if (!existingTemplate) {
      throw new Error('任务模板不存在');
    }

    if (existingTemplate.createdBy !== userId) {
      throw new Error('无权删除此任务模板');
    }

    await prisma.taskTemplate.delete({
      where: { id: templateId }
    });
  }

  /**
   * 从模板创建任务
   */
  static async createTaskFromTemplate(
    data: CreateTaskFromTemplateData,
    userId: string
  ): Promise<any> {
    // 获取模板
    const template = await prisma.taskTemplate.findUnique({
      where: { id: data.templateId }
    });

    if (!template) {
      throw new Error('任务模板不存在');
    }

    // 检查模板权限
    if (!template.isPublic && template.createdBy !== userId) {
      throw new Error('无权使用此任务模板');
    }

    // 解析模板内容
    let templateData: any = {};
    if (template.content) {
      try {
        templateData = JSON.parse(template.content);
      } catch (error) {
        console.warn('解析模板内容失败:', error);
      }
    }

    // 合并模板数据和自定义数据
    const taskData = {
      title: data.customizations?.title || templateData.title || template.title,
      description: data.customizations?.description || templateData.description || template.description,
      priority: data.customizations?.priority || templateData.priority || 'MEDIUM',
      projectId: data.projectId || templateData.projectId,
      assigneeId: data.assigneeId || templateData.assigneeId,
      dueDate: data.customizations?.dueDate || templateData.dueDate,
      creatorId: userId
    };

    // 创建任务
    const task = await prisma.task.create({
      data: taskData,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return task;
  }

  /**
   * 复制任务模板
   */
  static async copyTemplate(templateId: string, userId: string): Promise<TaskTemplate> {
    // 获取原模板
    const originalTemplate = await prisma.taskTemplate.findUnique({
      where: { id: templateId }
    });

    if (!originalTemplate) {
      throw new Error('任务模板不存在');
    }

    // 检查模板权限
    if (!originalTemplate.isPublic && originalTemplate.createdBy !== userId) {
      throw new Error('无权复制此任务模板');
    }

    // 创建副本
    const copiedTemplate = await prisma.taskTemplate.create({
      data: {
        name: `${originalTemplate.name} (副本)`,
        description: originalTemplate.description,
        title: originalTemplate.title,
        content: originalTemplate.content,
        isPublic: false, // 副本默认为私有
        createdBy: userId
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return copiedTemplate as unknown as TaskTemplate;
  }

  /**
   * 获取用户的模板
   */
  static async getUserTemplates(
    userId: string,
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<{ data: TaskTemplate[]; total: number; pagination: any }> {
    return this.getTemplates({ createdBy: userId }, pagination);
  }

  /**
   * 获取公共模板
   */
  static async getPublicTemplates(
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<{ data: TaskTemplate[]; total: number; pagination: any }> {
    return this.getTemplates({ isPublic: true }, pagination);
  }

  /**
   * 搜索模板
   */
  static async searchTemplates(
    searchTerm: string,
    filters: TaskTemplateFilters = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<{ data: TaskTemplate[]; total: number; pagination: any }> {
    return this.getTemplates({ ...filters, search: searchTerm }, pagination);
  }

  /**
   * 获取模板统计
   */
  static async getTemplateStats(userId?: string): Promise<{
    totalTemplates: number;
    publicTemplates: number;
    privateTemplates: number;
    userTemplates: number;
    byCategory: Record<string, number>;
  }> {
    const where: any = {};
    if (userId) {
      where.createdBy = userId;
    }

    const [
      totalTemplates,
      publicTemplates,
      privateTemplates,
      userTemplates
    ] = await Promise.all([
      prisma.taskTemplate.count({ where }),
      prisma.taskTemplate.count({ where: { isPublic: true } }),
      prisma.taskTemplate.count({ where: { isPublic: false } }),
      userId ? prisma.taskTemplate.count({ where: { createdBy: userId } }) : 0
    ]);

    // 按类别统计（这里可以根据实际需求调整）
    const byCategory = {
      'default': totalTemplates,
      'public': publicTemplates,
      'private': privateTemplates
    };

    return {
      totalTemplates,
      publicTemplates,
      privateTemplates,
      userTemplates,
      byCategory
    };
  }

  /**
   * 批量创建模板
   */
  static async createBulkTemplates(
    templates: CreateTaskTemplateData[]
  ): Promise<TaskTemplate[]> {
    const results: TaskTemplate[] = [];

    for (const templateData of templates) {
      try {
        const template = await this.createTemplate(templateData);
        results.push(template);
      } catch (error) {
        console.error(`创建模板失败: ${templateData.name}`, error);
        // 继续处理其他模板
      }
    }

    return results;
  }

  /**
   * 清理未使用的模板
   */
  static async cleanupUnusedTemplates(daysThreshold: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);

    // 查找长时间未使用的私有模板
    const unusedTemplates = await prisma.taskTemplate.findMany({
      where: {
        isPublic: false,
        updatedAt: {
          lt: cutoffDate
        }
      },
      select: { id: true }
    });

    const deleteCount = unusedTemplates.length;

    if (deleteCount > 0) {
      await prisma.taskTemplate.deleteMany({
        where: {
          id: {
            in: unusedTemplates.map(t => t.id)
          }
        }
      });
    }

    return deleteCount;
  }
}