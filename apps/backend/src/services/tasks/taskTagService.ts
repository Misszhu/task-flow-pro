import { PrismaClient } from '@prisma/client';
import {
  CreateTaskTagRequest,
  UpdateTaskTagRequest,
  AssignTaskTagRequest,
  TaskTag,
  PaginatedResponse,
  PaginationParams
} from '@task-flow-pro/shared-types';

const prisma = new PrismaClient();

export class TaskTagService {
  /**
   * 创建任务标签
   */
  static async createTag(data: CreateTaskTagRequest): Promise<TaskTag> {
    const tag = await prisma.taskTag.create({
      data: {
        name: data.name,
        color: data.color
      }
    });

    return tag as unknown as TaskTag;
  }

  /**
   * 获取所有标签
   */
  static async getAllTags(
    pagination: PaginationParams = { page: 1, limit: 50 }
  ): Promise<PaginatedResponse<TaskTag>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // 获取总数
    const total = await prisma.taskTag.count();

    // 获取标签列表
    const tags = await prisma.taskTag.findMany({
      skip,
      take: limit,
      orderBy: { name: 'asc' }
    });

    return {
      data: tags as unknown as TaskTag[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 根据ID获取标签
   */
  static async getTagById(tagId: string): Promise<TaskTag | null> {
    const tag = await prisma.taskTag.findUnique({
      where: { id: tagId }
    });

    return tag as unknown as TaskTag | null;
  }

  /**
   * 更新标签
   */
  static async updateTag(tagId: string, data: UpdateTaskTagRequest): Promise<TaskTag> {
    const tag = await prisma.taskTag.update({
      where: { id: tagId },
      data: {
        name: data.name,
        color: data.color
      }
    });

    return tag as unknown as TaskTag;
  }

  /**
   * 删除标签
   */
  static async deleteTag(tagId: string): Promise<void> {
    await prisma.taskTag.delete({
      where: { id: tagId }
    });
  }

  /**
   * 为任务分配标签
   */
  static async assignTagsToTask(taskId: string, tagIds: string[]): Promise<void> {
    // 先删除现有的标签关联
    await prisma.task.update({
      where: { id: taskId },
      data: {
        tags: {
          set: []
        }
      }
    });

    // 添加新的标签关联
    if (tagIds.length > 0) {
      await prisma.task.update({
        where: { id: taskId },
        data: {
          tags: {
            connect: tagIds.map(id => ({ id }))
          }
        }
      });
    }
  }

  /**
   * 获取任务的标签
   */
  static async getTaskTags(taskId: string): Promise<TaskTag[]> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        tags: true
      }
    });

    return task?.tags as unknown as TaskTag[] || [];
  }

  /**
   * 搜索标签
   */
  static async searchTags(
    searchTerm: string,
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<TaskTag>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where = {
      name: {
        contains: searchTerm,
        mode: 'insensitive' as const
      }
    };

    // 获取总数
    const total = await prisma.taskTag.count({ where });

    // 获取标签列表
    const tags = await prisma.taskTag.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' }
    });

    return {
      data: tags as unknown as TaskTag[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}
